"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Inbox } from "lucide-react";
import { ScoreBadge } from "@/components/score/score-badge";
import { STATUS_LABELS, type DealWithLatestScore } from "@/lib/types";

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithLatestScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals")
      .then(async (res) => {
        const json = await res.json();
        const list =
          Array.isArray(json) ? json :
          Array.isArray(json?.deals) ? json.deals :
          Array.isArray(json?.data) ? json.data :
          [];
        setDeals(list);
      })
      .catch((e) => {
        console.error(e);
        setDeals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダ */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">案件一覧</h2>
          <p className="text-sm text-gray-500 mt-1">
            進行中のM&A案件を管理します
          </p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          新規案件
        </Link>
      </div>

      {/* 空状態 */}
      {deals.length === 0 ? (
        <div className="border rounded-xl p-8 bg-white shadow-sm text-center">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-4">まだ案件がありません</p>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-3"
          >
            <Plus size={16} />
            最初の案件を登録する
          </Link>
          <div className="mt-3">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
            >
              ダッシュボードへ
            </Link>
          </div>
        </div>
      ) : (
        /* テーブル */
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  案件名
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  売り手
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  買い手
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  スコア
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  ステージ
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  状態
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {deal.deal_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {deal.seller_company || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {deal.buyer_company || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={deal.latest_score} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {deal.latest_stage || "-"}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
