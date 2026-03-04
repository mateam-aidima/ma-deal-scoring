import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * APIルート（Route Handler）から呼び出すサーバーサイド Supabase クライアント。
 * ユーザーのセッション Cookie を引き継いで RLS が正しく機能する。
 */
export async function createApiClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route Handler 以外（Server Component など）から呼ばれた場合は無視
          }
        },
      },
    }
  );
}

/**
 * 現在ログイン中のユーザーを取得する。
 * 未認証の場合は null を返す。
 */
export async function getCurrentUser() {
  const supabase = await createApiClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
