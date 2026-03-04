"use client";

import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { parseVTT } from "@/lib/vtt-parser";

interface TranscriptInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function TranscriptInput({ value, onChange }: TranscriptInputProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    if (file.name.endsWith(".vtt")) {
      onChange(parseVTT(text));
    } else {
      onChange(text);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        議事録テキスト
      </label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Upload size={14} />
          VTTファイルをアップロード
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vtt,.txt,.srt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <span className="text-xs text-gray-400 self-center">
          .vtt / .txt / .srt に対応
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative ${dragOver ? "ring-2 ring-blue-400" : ""}`}
      >
        {dragOver && (
          <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
            <div className="flex items-center gap-2 text-blue-600">
              <FileText size={24} />
              <span className="font-medium">ファイルをドロップ</span>
            </div>
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="議事録テキストを貼り付けるか、VTTファイルをドラッグ&ドロップしてください..."
          rows={12}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>
      {value && (
        <p className="text-xs text-gray-400">
          {value.length.toLocaleString()} 文字
        </p>
      )}
    </div>
  );
}
