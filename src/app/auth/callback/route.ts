import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google) lands here with a `code`; exchange it for a session cookie
// and send the user back to where they started (`next`, default home).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    // Landed here without a code: usually the link was opened on a different
    // device/browser than the one that requested it (the PKCE verifier lives
    // in that browser). Explain rather than silently going home.
    const err = searchParams.get("error_description") ?? searchParams.get("error");
    if (err) return NextResponse.redirect(`${origin}/settings?auth_error=${encodeURIComponent(err)}`);
  }
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/settings?auth_error=${encodeURIComponent(error.message)}`);
  }
  // Only allow same-origin relative paths for `next`.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
