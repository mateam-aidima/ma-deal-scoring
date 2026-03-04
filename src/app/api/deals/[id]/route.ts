import { NextResponse } from "next/server";
import { createApiClient, getCurrentUser } from "@/lib/supabase-server";

// GET /api/deals/[id] - 案件詳細（議事録+スコア履歴含む）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createApiClient();

  const [dealRes, transcriptsRes, scoresRes] = await Promise.all([
    supabase.from("deals").select("*").eq("id", id).single(),
    supabase
      .from("transcripts")
      .select("*")
      .eq("deal_id", id)
      .order("meeting_date", { ascending: false }),
    supabase
      .from("deal_scores")
      .select("*")
      .eq("deal_id", id)
      .order("analyzed_at", { ascending: false }),
  ]);

  if (dealRes.error) {
    return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({
    deal: dealRes.data,
    transcripts: transcriptsRes.data || [],
    scores: scoresRes.data || [],
  });
}

// PATCH /api/deals/[id] - 案件更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createApiClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.deal_name !== undefined) updateData.deal_name = body.deal_name;
  if (body.seller_company !== undefined) updateData.seller_company = body.seller_company;
  if (body.buyer_company !== undefined) updateData.buyer_company = body.buyer_company;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.deal_size_estimate !== undefined)
    updateData.deal_size_estimate = body.deal_size_estimate
      ? parseInt(body.deal_size_estimate)
      : null;
  if (body.assigned_broker !== undefined) updateData.assigned_broker = body.assigned_broker;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data, error } = await supabase
    .from("deals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/deals/[id] - 案件削除
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createApiClient();

  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
