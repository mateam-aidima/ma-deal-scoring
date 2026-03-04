"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DealScore } from "@/lib/types";

interface ScoreChartProps {
  scores: DealScore[];
}

export function ScoreChart({ scores }: ScoreChartProps) {
  if (scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        分析データがありません
      </div>
    );
  }

  // 古い順に並べ替え
  const chartData = [...scores]
    .sort(
      (a, b) =>
        new Date(a.analyzed_at).getTime() - new Date(b.analyzed_at).getTime()
    )
    .map((s) => ({
      date: new Date(s.analyzed_at).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      総合: s.overall_score,
      売り手: s.seller_motivation_score,
      買い手: s.buyer_seriousness_score,
      成約性: s.deal_feasibility_score,
      進捗: s.process_stage_score,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis domain={[0, 100]} fontSize={12} />
        <Tooltip />
        <Legend fontSize={12} />
        <Line
          type="monotone"
          dataKey="総合"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
        <Line type="monotone" dataKey="売り手" stroke="#16a34a" strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="買い手" stroke="#d97706" strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="成約性" stroke="#9333ea" strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="進捗" stroke="#64748b" strokeWidth={1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
