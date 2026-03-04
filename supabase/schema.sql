-- ============================================================
-- M&A Deal Scoring - Supabase スキーマ
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- UUID 拡張（有効化済みの場合はスキップ）
create extension if not exists "uuid-ossp";

-- ============================================================
-- deals テーブル
-- ============================================================
create table if not exists deals (
  id                  uuid        default uuid_generate_v4() primary key,
  user_id             uuid        references auth.users(id) on delete cascade not null,
  deal_name           text        not null,
  seller_company      text,
  buyer_company       text,
  industry            text,
  deal_size_estimate  integer,
  assigned_broker     text,
  status              text        default 'active'
                                  check (status in ('active', 'closed_won', 'closed_lost', 'on_hold')),
  notes               text,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- ============================================================
-- transcripts テーブル
-- ============================================================
create table if not exists transcripts (
  id            uuid        default uuid_generate_v4() primary key,
  deal_id       uuid        references deals(id) on delete cascade not null,
  meeting_date  date        not null,
  meeting_type  text        default 'general'
                            check (meeting_type in ('initial', 'top_meeting', 'dd', 'negotiation', 'general')),
  participants  text,
  source        text        default 'manual'
                            check (source in ('zoom_vtt', 'teams_vtt', 'manual', 'audio_upload')),
  content       text        not null,
  created_at    timestamptz default now() not null
);

-- ============================================================
-- deal_scores テーブル
-- ============================================================
create table if not exists deal_scores (
  id                            uuid        default uuid_generate_v4() primary key,
  deal_id                       uuid        references deals(id) on delete cascade not null,
  transcript_id                 uuid        references transcripts(id) on delete set null,
  seller_motivation_score       integer     check (seller_motivation_score between 0 and 100),
  seller_motivation_reasoning   text,
  seller_motivation_signals     text[],
  buyer_seriousness_score       integer     check (buyer_seriousness_score between 0 and 100),
  buyer_seriousness_reasoning   text,
  buyer_seriousness_signals     text[],
  deal_feasibility_score        integer     check (deal_feasibility_score between 0 and 100),
  deal_feasibility_reasoning    text,
  deal_feasibility_signals      text[],
  process_stage_score           integer     check (process_stage_score between 0 and 100),
  process_stage_label           text,
  overall_score                 integer     check (overall_score between 0 and 100),
  risk_factors                  text[],
  next_actions                  text[],
  summary                       text,
  analyzed_at                   timestamptz default now() not null
);

-- ============================================================
-- インデックス
-- ============================================================
create index if not exists idx_deals_user_id       on deals(user_id);
create index if not exists idx_deals_status        on deals(status);
create index if not exists idx_deals_updated_at    on deals(updated_at desc);
create index if not exists idx_transcripts_deal_id on transcripts(deal_id);
create index if not exists idx_scores_deal_id      on deal_scores(deal_id);
create index if not exists idx_scores_analyzed_at  on deal_scores(analyzed_at desc);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- deals
alter table deals enable row level security;

create policy "deals_select_own"  on deals for select  using (auth.uid() = user_id);
create policy "deals_insert_own"  on deals for insert  with check (auth.uid() = user_id);
create policy "deals_update_own"  on deals for update  using (auth.uid() = user_id);
create policy "deals_delete_own"  on deals for delete  using (auth.uid() = user_id);

-- transcripts（deals 経由でオーナーを確認）
alter table transcripts enable row level security;

create policy "transcripts_select_own" on transcripts for select using (
  exists (select 1 from deals where deals.id = transcripts.deal_id and deals.user_id = auth.uid())
);
create policy "transcripts_insert_own" on transcripts for insert with check (
  exists (select 1 from deals where deals.id = transcripts.deal_id and deals.user_id = auth.uid())
);
create policy "transcripts_delete_own" on transcripts for delete using (
  exists (select 1 from deals where deals.id = transcripts.deal_id and deals.user_id = auth.uid())
);

-- deal_scores（deals 経由でオーナーを確認）
alter table deal_scores enable row level security;

create policy "scores_select_own" on deal_scores for select using (
  exists (select 1 from deals where deals.id = deal_scores.deal_id and deals.user_id = auth.uid())
);
create policy "scores_insert_own" on deal_scores for insert with check (
  exists (select 1 from deals where deals.id = deal_scores.deal_id and deals.user_id = auth.uid())
);
create policy "scores_delete_own" on deal_scores for delete using (
  exists (select 1 from deals where deals.id = deal_scores.deal_id and deals.user_id = auth.uid())
);
