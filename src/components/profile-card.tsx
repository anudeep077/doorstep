"use client";

import { useState } from "react";
import { signOut, useUser } from "@/lib/use-user";
import { UserIcon } from "./icons";
import { SignInSheet } from "./sign-in-sheet";

/** Guest / signed-in header used by Settings and the account sheet. */
export function ProfileCard({ compact = false }: { compact?: boolean }) {
  const user = useUser();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const avatar = user?.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className="h-12 w-12 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
      <UserIcon width={24} height={24} />
    </span>
  );

  return (
    <>
      <section className={`flex items-center gap-3 rounded-3xl ${compact ? "bg-line/40 p-4" : "border border-line bg-surface p-4 shadow-sm"}`}>
        {avatar}
        <div className="min-w-0 flex-1">
          {user === undefined ? (
            <div className="h-4 w-24 animate-pulse rounded bg-line" />
          ) : user ? (
            <>
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email ?? user.phone}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Guest</p>
              <p className="text-sm text-muted">Sign in to sync across devices</p>
            </>
          )}
        </div>
        {user ? (
          <button
            type="button"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await signOut();
              setSigningOut(false);
            }}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-line/40 disabled:opacity-50"
          >
            {signingOut ? "…" : "Sign out"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Sign in
          </button>
        )}
      </section>
      <SignInSheet open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
