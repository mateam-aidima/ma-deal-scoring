import { NextResponse } from "next/server";
import { createApiClient, getCurrentUser } from "@/lib/supabase-server";

// GET /api/dashboard/summary - ダッシュボード集計
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = await createApiClient();

  // アクティブ案件（RLS により自分の案件のみ取得）
  const { data: activeDeals } = await supabase
    .from("deals")
    .select("id")
    .eq("status", "active");

  // 今月の分析数
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyScores } = await supabase
    .from("deal_scores")
    .select("id")
    .gte("analyzed_at", startOfMonth.toISOString());

  // 全アクティブ案件の最新スコア
  const activeIds = (activeDeals || []).map((d: { id: string }) => d.id);
  const { data: allScores } = await supabase
    .from("deal_scores")
    .select("deal_id, overall_score, analyzed_at")
    .in("deal_id", activeIds.length > 0 ? activeIds : ["__none__"])
    .order("analyzed_at", { ascending: false });

  // deal_id → 最新スコアのマップ
  const latestScores = new Map<string, number>();
  for (const s of allScores || []) {
    if (!latestScores.has(s.deal_id)) {
      latestScores.set(s.deal_id, s.overall_score);
    }
  }

  const scoreValues = Array.from(latestScores.values());
  const averageScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0;
  const alertDeals = scoreValues.filter((s) => s < 40).length;

  // ランキング用: 全アクティブ案件 + 最新スコア
  const { data: dealsForRanking } = await supabase
    .from("deals")
    .select("id, deal_name")
    .eq("status", "active");

  const ranking = (dealsForRanking || [])
    .map((d: { id: string; deal_name: string }) => ({
      deal_name: d.deal_name,
      score: latestScores.get(d.id) ?? 0,
    }))
    .filter((d: { score: number }) => d.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  // 最近のスコア変動
  const { data: recentScores } = await supabase
    .from("deal_scores")
    .select("deal_id, overall_score, process_stage_label, analyzed_at")
    .order("analyzed_at", { ascending: false })
    .limit(10);

  // deal_id → deal_name マッピング
  const { data: allDeals } = await supabase.from("deals").select("id, deal_name");
  const dealNameMap = new Map<string, string>();
  for (const d of allDeals || []) {
    dealNameMap.set(d.id, d.deal_name);
  }

  const recentChanges = (recentScores || []).map(
    (s: {
      deal_id: string;
      overall_score: number;
      process_stage_label: string;
      analyzed_at: string;
    }) => ({
      deal_name: dealNameMap.get(s.deal_id) || "不明",
      score: s.overall_score,
      stage: s.process_stage_label,
      analyzed_at: s.analyzed_at,
    })
  );

  return NextResponse.json({
    activeDeals: activeDeals?.length || 0,
    analyzedThisMonth: monthlyScores?.length || 0,
    averageScore,
    alertDeals,
    ranking,
    recentChanges,
  });
}
