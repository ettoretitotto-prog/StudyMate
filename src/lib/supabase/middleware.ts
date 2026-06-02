import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

import { hasSupabaseConfig, getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
