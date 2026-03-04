/**
 * VTT (WebVTT) ファイルをプレーンテキストに変換する
 * タイムスタンプ、ヘッダー、空行を除去し、発話内容のみを抽出
 */
export function parseVTT(vttContent: string): string {
  const lines = vttContent.split("\n");
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // WEBVTTヘッダー行をスキップ
    if (trimmed === "WEBVTT" || trimmed.startsWith("NOTE")) continue;
    // 空行をスキップ
    if (!trimmed) continue;
    // タイムスタンプ行をスキップ (00:00:00.000 --> 00:00:05.000)
    if (/^\d{2}:\d{2}/.test(trimmed) && trimmed.includes("-->")) continue;
    // キュー番号をスキップ (純粋な数字行)
    if (/^\d+$/.test(trimmed)) continue;
    // 話者タグを除去 (<v Speaker Name>text</v>)
    const cleaned = trimmed.replace(/<v\s+[^>]*>/g, "").replace(/<\/v>/g, "");
    if (cleaned) textLines.push(cleaned);
  }

  // 重複行を除去（Zoomは同じテキストを繰り返すことがある）
  const deduplicated: string[] = [];
  for (const line of textLines) {
    if (deduplicated[deduplicated.length - 1] !== line) {
      deduplicated.push(line);
    }
  }

  return deduplicated.join("\n");
}
