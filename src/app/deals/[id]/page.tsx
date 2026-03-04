"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { ScoreBadge } from "@/components/score/score-badge";
import { ScoreCard } from "@/components/score/score-card";
import { ScoreChart } from "@/components/score/score-chart";
import {
  STATUS_LABELS,
  MEETING_TYPE_LABELS,
  getScoreBgColor,
  type Deal,
  type Transcript,
  type DealScore,
} from "@/lib/types";

interface DealDetail {
  deal: Deal;
  transcripts: Transcript[];
  scores: DealScore[];
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [id]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const { deal, transcripts, scores } = data;
  const latestScore = scores[0] || null;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {deal.deal_name}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {deal.seller_company && <span>売り手: {deal.seller_company}</span>}
            {deal.buyer_company && <span>買い手: {deal.buyer_company}</span>}
            {deal.industry && <span>業種: {deal.industry}</span>}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                deal.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : deal.status === "closed_won"
                    ? "bg-green-100 text-green-700"
                    : deal.status === "closed_lost"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
              }`}
            >
              {STATUS_LABELS[deal.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/deals/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Pencil size={16} />
            編集
          </Link>
          <Link
            href={`/deals/${id}/analyze`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <FileText size={16} />
            議事録を分析
          </Link>
        </div>
      </div>

      {/* 最新スコア概要 */}
      {latestScore ? (
        <>
          <div className="bg-white rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                最新スコア
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {latestScore.process_stage_label}
                </span>
                <span
                  className={`text-3xl font-bold ${
                    latestScore.overall_score >= 70
                      ? "text-green-600"
                      : latestScore.overall_score >= 40
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {latestScore.overall_score}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <ScoreCard
                label="売り手本気度"
                score={latestScore.seller_motivation_score}
                reasoning={latestScore.seller_motivation_reasoning}
                signals={latestScore.seller_motivation_signals}
              />
              <ScoreCard
                label="買い手本気度"
                score={latestScore.buyer_seriousness_score}
                reasoning={latestScore.buyer_seriousness_reasoning}
                signals={latestScore.buyer_seriousness_signals}
              />
              <ScoreCard
                label="案件成約しやすさ"
                score={latestScore.deal_feasibility_score}
                reasoning={latestScore.deal_feasibility_reasoning}
                signals={latestScore.deal_feasibility_signals}
              />
              <ScoreCard
                label="プロセス進捗"
                score={latestScore.process_stage_score}
                reasoning={latestScore.process_stage_label}
                signals={[]}
              />
            </div>

            {/* 要約 */}
            <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 mb-4">
              {latestScore.summary}
            </p>

            {/* リスク & アクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestScore.risk_factors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 flex items-center gap-1 mb-2">
                    <AlertTriangle size={14} />
                    リスク要因
                  </h4>
                  <ul className="space-y-1">
                    {latestScore.risk_factors.map((r: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-red-600 bg-red-50 rounded px-2 py-1"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {latestScore.next_actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-700 flex items-center gap-1 mb-2">
                    <CheckCircle size={14} />
                    推奨アクション
                  </h4>
                  <ul className="space-y-1">
                    {latestScore.next_actions.map((a: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-green-700 bg-green-50 rounded px-2 py-1"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* スコア推移チャート */}
          {scores.length > 1 && (
            <div className="bg-white rounded-lg border p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                スコア推移
              </h3>
              <ScoreChart scores={scores} />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">まだ分析データがありません</p>
          <Link
            href={`/deals/${id}/analyze`}
            className="text-blue-600 hover:underline text-sm"
          >
            最初の議事録を分析する
          </Link>
        </div>
      )}

      {/* 議事録一覧 */}
      {transcripts.length > 0 && (
        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            議事録履歴
          </h3>
          <div className="space-y-2">
            {transcripts.map((t) => {
              const score = scores.find((s) => s.transcript_id === t.id);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-900">
                      {new Date(t.meeting_date).toLocaleDateString("ja-JP")}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {MEETING_TYPE_LABELS[t.meeting_type]}
                    </span>
                    {t.participants && (
                      <span className="text-xs text-gray-400">
                        {t.participants}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {score && <ScoreBadge score={score.overall_score} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
