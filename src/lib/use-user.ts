"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type SessionUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

function toSessionUser(u: User): SessionUser {
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    name: meta.full_name ?? meta.name ?? u.email?.split("@")[0] ?? u.phone ?? "You",
    email: u.email ?? null,
    phone: u.phone ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
  };
}

// Module-level cache so every component sees the same answer immediately
// after the first resolution (no per-mount flash of "guest").
let cached: SessionUser | null | undefined;
const listeners = new Set<() => void>();
let started = false;

function start() {
  if (started) return;
  started = true;
  if (!hasSupabaseEnv()) {
    cached = null;
    return;
  }
  const supabase = createClient();
  supabase.auth.getUser().then(({ data }) => {
    cached = data.user ? toSessionUser(data.user) : null;
    listeners.forEach((l) => l());
  });
  supabase.auth.onAuthStateChange((event, session) => {
    cached = session?.user ? toSessionUser(session.user) : null;
    listeners.forEach((l) => l());
    // First sign-in: make sure a profiles row exists (RLS: insert own).
    if (event === "SIGNED_IN" && session?.user) {
      void supabase
        .from("profiles")
        .upsert({ id: session.user.id, full_name: toSessionUser(session.user).name }, { onConflict: "id", ignoreDuplicates: true });
    }
  });
}

/** `undefined` while resolving, `null` when signed out. */
export function useUser(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(() => cached);
  useEffect(() => {
    start();
    const sync = () => setUser(cached);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return user;
}

export async function signOut() {
  if (!hasSupabaseEnv()) return;
  await createClient().auth.signOut();
}
