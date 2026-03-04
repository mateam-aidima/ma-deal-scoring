"use client";

import { getScoreColor } from "@/lib/types";

interface ScoreCardProps {
  label: string;
  score: number;
  reasoning: string;
  signals: string[];
}

export function ScoreCard({ label, score, reasoning, signals }: ScoreCardProps) {
  const colorClass = getScoreColor(score);
  const barWidth = `${score}%`;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 70
              ? "bg-green-500"
              : score >= 40
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: barWidth }}
        />
      </div>
      <p className="text-xs text-gray-600 mb-2">{reasoning}</p>
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {signals.map((signal, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
            >
              {signal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
