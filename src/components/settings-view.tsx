"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import type { VegPreference } from "@/lib/types";
import { useAddress } from "@/lib/use-address";
import { useTheme } from "@/lib/use-theme";
import { useVegPreference } from "@/lib/use-veg-preference";
import type { Theme } from "@/lib/theme";
import { AddressSheet } from "./address-sheet";
import { BagIcon, ChevronRightIcon, MapPinIcon, MoonIcon, SunIcon, SystemIcon } from "./icons";
import { Wordmark } from "./logo";
import { ProfileCard } from "./profile-card";
import { Sheet } from "./sheet";
import { VegModeRow } from "./veg-mode";

export function SettingsView() {
  const address = useAddress();
  const { pref, setPref } = useVegPreference();
  const { theme, setTheme } = useTheme();
  const cart = useCart();
  const [addressOpen, setAddressOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // /auth/callback redirects here with ?auth_error= when a sign-in link
  // couldn't be completed. Read once, then clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (!err) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL (external) once on mount
    setAuthError(err);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const resetAll = () => {
    try {
      for (const k of ["cart", "orders", "current_address", "saved_addresses", "veg_preference"]) localStorage.removeItem(k);
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    cart.clear();
    setPref("off");
    setResetOpen(false);
    window.location.href = "/";
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-3">
      <h1 className="px-1 text-2xl font-bold">Settings</h1>

      {authError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-600/30 bg-red-600/10 p-3 text-sm">
          <p className="flex-1">
            <span className="font-semibold">Sign-in link didn&apos;t work.</span> {friendlyAuthError(authError)}
          </p>
          <button type="button" onClick={() => setAuthError(null)} aria-label="Dismiss" className="text-muted">
            ✕
          </button>
        </div>
      )}

      {/* Profile */}
      <ProfileCard />

      {/* Preferences */}
      <SectionLabel>Preferences</SectionLabel>
      <VegModeRow pref={pref} ready onTurnOn={(mode: Exclude<VegPreference, "off">) => setPref(mode)} onTurnOff={() => setPref("off")} />

      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <p className="font-semibold">Appearance</p>
        <p className="mb-3 text-xs text-muted">System follows your phone&apos;s setting.</p>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2 rounded-2xl bg-line/60 p-1">
          {THEMES.map(({ key, label, Icon }) => {
            const on = theme === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(key)}
                className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-colors ${
                  on ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon width={20} height={20} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <SectionLabel>Delivery</SectionLabel>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <li>
          <button type="button" onClick={() => setAddressOpen(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-line/40">
            <MapPinIcon className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Addresses</span>
              <span className="block truncate text-xs text-muted">
                {address.current ? `Delivering to ${address.current.short_label}` : "No address set"}
                {address.saved.length > 0 && ` · ${address.saved.length} saved`}
              </span>
            </span>
            <ChevronRightIcon className="shrink-0 text-muted" />
          </button>
        </li>
        <li>
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3.5 hover:bg-line/40">
            <BagIcon className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Orders</span>
              <span className="block text-xs text-muted">Track and reorder</span>
            </span>
            <ChevronRightIcon className="shrink-0 text-muted" />
          </Link>
        </li>
      </ul>

      <SectionLabel>About</SectionLabel>
      <section className="rounded-3xl border border-line bg-surface p-4 text-sm shadow-sm">
        <div className="flex items-center justify-between">
          <Wordmark size={22} />
          <span className="text-xs text-muted">portfolio build</span>
        </div>
        <p className="mt-1 text-muted">
          Restaurants and dishes are sample data. Orders, addresses and preferences are stored on this device until accounts are added.
        </p>
        <button type="button" onClick={() => setResetOpen(true)} className="mt-3 text-sm font-semibold text-red-600 hover:underline">
          Reset app data
        </button>
      </section>

      <AddressSheet
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        status={address.status}
        error={address.error}
        current={address.current}
        saved={address.saved}
        onLocate={address.locate}
        onChoose={address.choose}
        onSave={address.save}
        onRemove={address.remove}
      />

      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Reset app data?">
        <p className="mb-5 text-sm text-muted">Clears your cart, orders, saved addresses and veg preference on this device.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setResetOpen(false)} className="rounded-2xl border border-line py-3 font-semibold hover:bg-line/40">
            Cancel
          </button>
          <button type="button" onClick={resetAll} className="rounded-2xl bg-red-600 py-3 font-semibold text-white hover:opacity-90">
            Reset
          </button>
        </div>
      </Sheet>
    </main>
  );
}

function friendlyAuthError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("code verifier") || m.includes("pkce") || m.includes("both auth code and code verifier"))
    return "Open the link on the same device and browser where you asked for it, then try again.";
  if (m.includes("expired") || m.includes("invalid")) return "The link has expired or was already used. Request a new one.";
  return msg;
}

const THEMES: { key: Theme; label: string; Icon: typeof SunIcon }[] = [
  { key: "system", label: "System", Icon: SystemIcon },
  { key: "light", label: "Light", Icon: SunIcon },
  { key: "dark", label: "Dark", Icon: MoonIcon },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="-mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{children}</h2>;
}
