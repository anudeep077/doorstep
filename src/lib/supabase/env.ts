// True when .env.local carries real Supabase credentials. Without them the
// homepage serves the bundled seed catalogue so `npm run dev` works on a
// fresh clone with zero setup.
export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project") && !key.includes("your-anon") && !key.includes("PASTE_KEY"));
}
