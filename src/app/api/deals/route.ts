import { NextResponse } from "next/server";
import { createApiClient, getCurrentUser } from "@/lib/supabase-server";

// GET /api/deals - 案件一覧（最新スコア付き）
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = await createApiClient();

  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 各案件の最新スコアを取得
  const dealIds = deals.map((d: { id: string }) => d.id);
  const { data: scores } = await supabase
    .from("deal_scores")
    .select("deal_id, overall_score, process_stage_label, analyzed_at")
    .in("deal_id", dealIds.length > 0 ? dealIds : ["__none__"])
    .order("analyzed_at", { ascending: false });

  // deal_id → 最新スコア のマップを作成
  const latestScores = new Map<string, { score: number; stage: string }>();
  for (const s of scores || []) {
    if (!latestScores.has(s.deal_id)) {
      latestScores.set(s.deal_id, {
        score: s.overall_score,
        stage: s.process_stage_label,
      });
    }
  }

  const dealsWithScores = deals.map((d: { id: string }) => ({
    ...d,
    latest_score: latestScores.get(d.id)?.score ?? null,
    latest_stage: latestScores.get(d.id)?.stage ?? null,
  }));

  return NextResponse.json(dealsWithScores);
}

// POST /api/deals - 案件作成
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = await createApiClient();

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      deal_name: body.deal_name,
      seller_company: body.seller_company || null,
      buyer_company: body.buyer_company || null,
      industry: body.industry || null,
      deal_size_estimate: body.deal_size_estimate
        ? parseInt(body.deal_size_estimate)
        : null,
      assigned_broker: body.assigned_broker || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
