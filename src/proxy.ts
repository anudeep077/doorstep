import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "@/lib/supabase/env";

// Refreshes the Supabase session cookie on every request so server
// components see a valid user. No route protection: every screen works
// signed-out (guest mode), sign-in only adds sync — so this is purely the
// token-refresh half of the usual Supabase middleware.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv()) return response;

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT locally and refreshes it when near expiry
  // — no auth-server round trip per request (same reasoning as Momentum).
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
