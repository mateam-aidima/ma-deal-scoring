// === Database Types ===

export interface Deal {
  id: string;
  deal_name: string;
  seller_company: string | null;
  buyer_company: string | null;
  industry: string | null;
  deal_size_estimate: number | null;
  assigned_broker: string | null;
  status: "active" | "closed_won" | "closed_lost" | "on_hold";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transcript {
  id: string;
  deal_id: string;
  meeting_date: string;
  meeting_type: "initial" | "top_meeting" | "dd" | "negotiation" | "general";
  participants: string | null;
  source: "zoom_vtt" | "teams_vtt" | "manual" | "audio_upload";
  content: string;
  created_at: string;
}

export interface DealScore {
  id: string;
  deal_id: string;
  transcript_id: string;
  seller_motivation_score: number;
  seller_motivation_reasoning: string;
  seller_motivation_signals: string[];
  buyer_seriousness_score: number;
  buyer_seriousness_reasoning: string;
  buyer_seriousness_signals: string[];
  deal_feasibility_score: number;
  deal_feasibility_reasoning: string;
  deal_feasibility_signals: string[];
  process_stage_score: number;
  process_stage_label: string;
  overall_score: number;
  risk_factors: string[];
  next_actions: string[];
  summary: string;
  analyzed_at: string;
}

// === AI Response Type ===

export interface AIScoreResponse {
  seller_motivation: {
    score: number;
    reasoning: string;
    key_signals: string[];
  };
  buyer_seriousness: {
    score: number;
    reasoning: string;
    key_signals: string[];
  };
  deal_feasibility: {
    score: number;
    reasoning: string;
    key_signals: string[];
  };
  process_stage: {
    score: number;
    label: string;
  };
  overall_score: number;
  risk_factors: string[];
  next_actions: string[];
  summary: string;
}

// === Form Types ===

export interface DealFormData {
  deal_name: string;
  seller_company: string;
  buyer_company: string;
  industry: string;
  deal_size_estimate: string;
  assigned_broker: string;
  notes: string;
}

export interface TranscriptFormData {
  meeting_date: string;
  meeting_type: Transcript["meeting_type"];
  participants: string;
  source: Transcript["source"];
  content: string;
}

// === Dashboard Types ===

export interface DashboardSummary {
  activeDeals: number;
  analyzedThisMonth: number;
  averageScore: number;
  alertDeals: number;
}

export interface DealWithLatestScore extends Deal {
  latest_score: number | null;
  latest_stage: string | null;
}

// === Constants ===

export const MEETING_TYPE_LABELS: Record<Transcript["meeting_type"], string> = {
  initial: "初回面談",
  top_meeting: "トップ面談",
  dd: "デューデリジェンス",
  negotiation: "条件交渉",
  general: "一般",
};

export const STATUS_LABELS: Record<Deal["status"], string> = {
  active: "進行中",
  closed_won: "成約",
  closed_lost: "失注",
  on_hold: "保留",
};

export const SOURCE_LABELS: Record<Transcript["source"], string> = {
  zoom_vtt: "Zoom字幕",
  teams_vtt: "Teams字幕",
  manual: "手動入力",
  audio_upload: "音声アップロード",
};

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBgColor(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-700";
  if (score >= 40) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}
