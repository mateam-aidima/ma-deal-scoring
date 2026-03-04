"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { TranscriptInput } from "@/components/transcript/transcript-input";
import type { Transcript } from "@/lib/types";

export default function AnalyzePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [meetingType, setMeetingType] =
    useState<Transcript["meeting_type"]>("general");
  const [participants, setParticipants] = useState("");
  const [source, setSource] = useState<Transcript["source"]>("manual");
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim() || !meetingDate) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: id,
          meeting_date: meetingDate,
          meeting_type: meetingType,
          participants: participants || null,
          source,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/deals/${id}`);
      } else {
        setError(data.error || "分析に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        議事録を分析
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              面談日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              面談種別
            </label>
            <select
              value={meetingType}
              onChange={(e) =>
                setMeetingType(e.target.value as Transcript["meeting_type"])
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">一般</option>
              <option value="initial">初回面談</option>
              <option value="top_meeting">トップ面談</option>
              <option value="dd">デューデリジェンス</option>
              <option value="negotiation">条件交渉</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              参加者
            </label>
            <input
              type="text"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="例：山田社長、田中CFO"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              入力ソース
            </label>
            <select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as Transcript["source"])
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manual">手動入力</option>
              <option value="zoom_vtt">Zoom字幕 (VTT)</option>
              <option value="teams_vtt">Teams字幕 (VTT)</option>
            </select>
          </div>
        </div>

        <TranscriptInput value={content} onChange={setContent} />

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim() || !meetingDate}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AI分析中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                AI分析を実行
              </>
            )}
          </button>
          <button
            onClick={() => router.back()}
            disabled={analyzing}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            戻る
          </button>
        </div>

        {analyzing && (
          <p className="text-xs text-gray-400">
            Gemini AIが議事録を分析しています。通常5〜10秒程度かかります...
          </p>
        )}
      </div>
    </div>
  );
}
