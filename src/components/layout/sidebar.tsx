"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Briefcase, Plus, LogOut, User } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/deals", label: "案件一覧", icon: Briefcase },
  { href: "/deals/new", label: "新規案件", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // 初回取得
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // 認証状態変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "ユーザー";

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* ロゴ */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">M&A スコアリング</h1>
        <p className="text-xs text-gray-400 mt-1">見込み度自動判定</p>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報・ログアウト */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-gray-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-gray-200 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut size={14} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
