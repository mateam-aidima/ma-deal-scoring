"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  TrendingUp,
  AlertTriangle,
  Plus,
  FolderOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ScoreBadge } from "@/components/score/score-badge";

interface DashboardData {
  activeDeals: number;
  analyzedThisMonth: number;
  averageScore: number;
  alertDeals: number;
  ranking: Array<{ deal_name: string; score: number }>;
  recentChanges: Array<{
    deal_name: string;
    score: number;
    stage: string;
    analyzed_at: string;
  }>;
}

const summaryCards = [
  { key: "activeDeals" as const, label: "アクティブ案件", icon: Briefcase },
  { key: "analyzedThisMonth" as const, label: "今月の分析数", icon: FileText },
  { key: "averageScore" as const, label: "平均スコア", icon: TrendingUp },
  { key: "alertDeals" as const, label: "要注意案件", icon: AlertTriangle },
];

function getBarColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ページヘッダ */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">M&Aスコアリング</h1>
          <p className="text-sm text-gray-500 mt-1">見込み案件を自動評価・管理</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            案件一覧
          </Link>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            新規案件
          </Link>
        </div>
      </div>

      {/* KPIカード 4列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="bg-white rounded-xl border shadow-sm p-6 flex items-start justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {data[key]}
              </p>
            </div>
            <Icon size={28} className="text-gray-300 mt-1" />
          </div>
        ))}
      </div>

      {/* スコアランキング */}
      {data.ranking.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">
            案件スコアランキング
          </h3>
          <ResponsiveContainer width="100%" height={Math.max(200, data.ranking.length * 44)}>
            <BarChart
              data={data.ranking}
              layout="vertical"
              margin={{ left: 120, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="deal_name"
                width={110}
                fontSize={12}
              />
              <Tooltip />
              <Bar dataKey="score" name="スコア" radius={[0, 4, 4, 0]}>
                {data.ranking.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 最近の分析結果 / 空状態 */}
      {data.recentChanges.length > 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">
            最近の分析結果
          </h3>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">案件名</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">スコア</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ステージ</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">分析日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentChanges.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm text-gray-900">{item.deal_name}</td>
                  <td className="py-3 text-center">
                    <ScoreBadge score={item.score} />
                  </td>
                  <td className="py-3 text-sm text-gray-600">{item.stage}</td>
                  <td className="py-3 text-sm text-gray-400">
                    {new Date(item.analyzed_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-5">まだデータがありません</p>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            <Plus size={16} />
            最初の案件を登録する
          </Link>
        </div>
      )}

    </div>
  );
}
