"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { DISH_CATEGORIES } from "@/data/categories";
import { buildFeed, searchSuggestions } from "@/lib/feed";
import type { Restaurant, VegPreference } from "@/lib/types";
import { consumeHomeScroll } from "@/lib/scroll-memory";
import { scrollTo } from "@/lib/scroller";
import { useAddress } from "@/lib/use-address";
import { useUser } from "@/lib/use-user";
import { useVegPreference } from "@/lib/use-veg-preference";
import { AddressBar } from "./address-bar";
import { AddressSheet } from "./address-sheet";
import { CategoryRow } from "./category-row";
import { AccountSheet } from "./account-sheet";
import { UserIcon } from "./icons";
import { LogoMark } from "./logo";
import { RiderBadge } from "./rider-badge";
import { RestaurantCard } from "./restaurant-card";
import { SearchBar } from "./search-bar";
import { VegModeOverlay, VegModeRow } from "./veg-mode";

// How far into the 1.2s splash the feed re-filters: the overlay is fully
// opaque from ~20% to 75%, so 450ms swaps the list while it's hidden.
const SPLASH_REFILTER_MS = 450;

// The "location denied — enter an address" sheet auto-opens once per page
// session, not every time the feed re-mounts or the user closes it.
let manualPromptDismissed = false;

export function HomeFeed({ restaurants }: { restaurants: Restaurant[] }) {
  const { pref, setPref, ready } = useVegPreference();
  const address = useAddress();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(manualPromptDismissed);
  const [accountOpen, setAccountOpen] = useState(false);
  const [splash, setSplash] = useState(false);

  const turnOn = useCallback(
    (mode: Exclude<VegPreference, "off">) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (mode === "veg_restaurants" && !reduceMotion) {
        setSplash(true);
        setTimeout(() => setPref(mode), SPLASH_REFILTER_MS);
      } else {
        setPref(mode);
      }
    },
    [setPref]
  );

  const feed = useMemo(() => buildFeed(restaurants, pref, query), [restaurants, pref, query]);
  const suggestions = useMemo(() => searchSuggestions(restaurants, pref), [restaurants, pref]);
  // Only offer categories that would actually return something under the
  // current veg mode — no dead-end chips.
  const categories = useMemo(
    () => DISH_CATEGORIES.filter((c) => buildFeed(restaurants, pref, c.query).length > 0),
    [restaurants, pref]
  );

  // Returning from a restaurant: put the user back on the card they left.
  // Layout effect so it lands before the first paint (no top-of-page frame),
  // and only once the real cards are in the DOM — a skeleton page is too
  // short to scroll that far.
  useLayoutEffect(() => {
    if (!ready) return;
    const y = consumeHomeScroll();
    if (y !== null) scrollTo(y);
  }, [ready]);

  // Address sheet opens itself when permission was denied or lookup failed,
  // so a "no" at the browser prompt doesn't leave the app stuck.
  const needsManual = !address.current && (address.status === "denied" || address.status === "unavailable");
  const sheetOpen = addressOpen || (needsManual && !promptDismissed);
  const closeAddressSheet = () => {
    setAddressOpen(false);
    setPromptDismissed(true);
    manualPromptDismissed = true;
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 pb-10 pt-3">
      {/* Row 0: brand + account */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2" aria-label="Doorstep">
          <LogoMark size={28} />
          <span className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">doorstep</span>
        </span>
        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          aria-label="Account"
          className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface text-foreground shadow-sm hover:bg-line/40"
        >
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <UserIcon width={18} height={18} />
          )}
        </button>
      </div>

      {/* Row 1: address chip + live order badge */}
      <div className="flex items-center gap-2">
        <AddressBar address={address.current} status={address.status} onClick={() => setAddressOpen(true)} />
        <RiderBadge />
      </div>

      {/* Row 2: veg mode (own row, deliberately not sharing the address line) */}
      <VegModeRow pref={pref} ready={ready} onTurnOn={turnOn} onTurnOff={() => setPref("off")} />

      {/* Row 3: dish categories + search — this block sticks to the top of
          the viewport once the address and veg rows have scrolled away, so
          both are always one tap up. */}
      <div className="sticky top-0 z-30 -mx-4 space-y-2 bg-background/85 px-4 pt-2 pb-2 backdrop-blur-md">
        <CategoryRow categories={categories} active={query} onSelect={setQuery} />
        <SearchBar value={query} onChange={setQuery} suggestions={suggestions} />
      </div>

      {/* Feed */}
      <section aria-label="Restaurants" className="mt-1 flex flex-col gap-4">
        {!ready ? (
          Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)
        ) : feed.length === 0 ? (
          <EmptyState query={query} pref={pref} />
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {feed.length} restaurant{feed.length === 1 ? "" : "s"}
              {pref === "veg_restaurants" && " · pure veg"}
              {query.trim() && ` · “${query.trim()}”`}
            </p>
            {feed.map((entry) => (
              <RestaurantCard key={entry.restaurant.id} entry={entry} />
            ))}
          </>
        )}
      </section>

      <AddressSheet
        open={sheetOpen}
        onClose={closeAddressSheet}
        status={address.status}
        error={address.error}
        current={address.current}
        saved={address.saved}
        onLocate={address.locate}
        onChoose={address.choose}
        onSave={address.save}
        onRemove={address.remove}
      />

      <AccountSheet
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        address={address.current}
        savedCount={address.saved.length}
        pref={pref}
        onManageAddresses={() => setAddressOpen(true)}
      />

      {splash && <VegModeOverlay onDone={() => setSplash(false)} />}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="aspect-[3/2] bg-line" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-1/2 rounded bg-line" />
        <div className="h-3 w-1/3 rounded bg-line" />
        <div className="h-3 w-2/3 rounded bg-line" />
      </div>
    </div>
  );
}

function EmptyState({ query, pref }: { query: string; pref: VegPreference }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-semibold">No restaurants found</p>
      <p className="mt-1 text-sm text-muted">
        {query.trim()
          ? `Nothing matches “${query.trim()}”${pref === "veg_restaurants" ? " among pure-veg restaurants" : ""}. Try another dish or cuisine.`
          : "Nothing to show here yet."}
      </p>
    </div>
  );
}
