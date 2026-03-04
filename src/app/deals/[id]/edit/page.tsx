"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deal, DealFormData } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

export default function EditDealPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Deal["status"]>("active");
  const [form, setForm] = useState<DealFormData>({
    deal_name: "",
    seller_company: "",
    buyer_company: "",
    industry: "",
    deal_size_estimate: "",
    assigned_broker: "",
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((res) => res.json())
      .then(({ deal }: { deal: Deal }) => {
        setForm({
          deal_name: deal.deal_name,
          seller_company: deal.seller_company || "",
          buyer_company: deal.buyer_company || "",
          industry: deal.industry || "",
          deal_size_estimate: deal.deal_size_estimate
            ? String(deal.deal_size_estimate)
            : "",
          assigned_broker: deal.assigned_broker || "",
          notes: deal.notes || "",
        });
        setStatus(deal.status);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deal_name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/deals/${id}`);
      } else {
        alert(`エラー: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof DealFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">案件を編集</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            案件名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.deal_name}
            onChange={(e) => update("deal_name", e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              売り手企業
            </label>
            <input
              type="text"
              value={form.seller_company}
              onChange={(e) => update("seller_company", e.target.value)}
              placeholder="企業名"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              買い手企業
            </label>
            <input
              type="text"
              value={form.buyer_company}
              onChange={(e) => update("buyer_company", e.target.value)}
              placeholder="企業名"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              業種
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="例：IT、製造業、飲食"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              想定取引額（万円）
            </label>
            <input
              type="text"
              value={form.deal_size_estimate}
              onChange={(e) => update("deal_size_estimate", e.target.value)}
              placeholder="例：50000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当ブローカー
            </label>
            <input
              type="text"
              value={form.assigned_broker}
              onChange={(e) => update("assigned_broker", e.target.value)}
              placeholder="担当者名"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Deal["status"])}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(STATUS_LABELS) as Deal["status"][]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="補足情報があれば..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !form.deal_name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/deals/${id}`)}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
