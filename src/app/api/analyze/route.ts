import { NextResponse } from "next/server";
import { createApiClient, getCurrentUser } from "@/lib/supabase-server";
import { analyzeDealTranscript } from "@/lib/deal-analyzer";

export const maxDuration = 30;

// POST /api/analyze - 議事録をAI分析してスコアリング
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { deal_id, meeting_date, meeting_type, participants, source, content } =
    body;

  if (!deal_id || !content || !meeting_date) {
    return NextResponse.json(
      { error: "deal_id, meeting_date, content は必須です" },
      { status: 400 }
    );
  }

  const supabase = await createApiClient();

  // 1. 議事録を保存
  const { data: transcript, error: transcriptError } = await supabase
    .from("transcripts")
    .insert({
      deal_id,
      meeting_date,
      meeting_type: meeting_type || "general",
      participants: participants || null,
      source: source || "manual",
      content,
    })
    .select()
    .single();

  if (transcriptError) {
    return NextResponse.json(
      { error: `議事録保存エラー: ${transcriptError.message}` },
      { status: 500 }
    );
  }

  // 2. AI分析実行
  let aiResult;
  try {
    aiResult = await analyzeDealTranscript(content);
  } catch (err) {
    return NextResponse.json(
      {
        error: `AI分析エラー: ${err instanceof Error ? err.message : "不明なエラー"}`,
        transcript_id: transcript.id,
      },
      { status: 500 }
    );
  }

  // 3. スコアを保存
  const { data: score, error: scoreError } = await supabase
    .from("deal_scores")
    .insert({
      deal_id,
      transcript_id: transcript.id,
      seller_motivation_score: aiResult.seller_motivation.score,
      seller_motivation_reasoning: aiResult.seller_motivation.reasoning,
      seller_motivation_signals: aiResult.seller_motivation.key_signals,
      buyer_seriousness_score: aiResult.buyer_seriousness.score,
      buyer_seriousness_reasoning: aiResult.buyer_seriousness.reasoning,
      buyer_seriousness_signals: aiResult.buyer_seriousness.key_signals,
      deal_feasibility_score: aiResult.deal_feasibility.score,
      deal_feasibility_reasoning: aiResult.deal_feasibility.reasoning,
      deal_feasibility_signals: aiResult.deal_feasibility.key_signals,
      process_stage_score: aiResult.process_stage.score,
      process_stage_label: aiResult.process_stage.label,
      overall_score: aiResult.overall_score,
      risk_factors: aiResult.risk_factors,
      next_actions: aiResult.next_actions,
      summary: aiResult.summary,
    })
    .select()
    .single();

  if (scoreError) {
    return NextResponse.json(
      { error: `スコア保存エラー: ${scoreError.message}` },
      { status: 500 }
    );
  }

  // 4. 案件のupdated_atを更新
  await supabase
    .from("deals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", deal_id);

  return NextResponse.json({ transcript, score }, { status: 201 });
}
