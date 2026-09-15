"use client";

import { useMemo } from "react";
import type { Restaurant } from "@/lib/types";
import { useVegPreference } from "@/lib/use-veg-preference";
import { DishCard } from "./dish-card";
import { LeafIcon } from "./icons";

/**
 * The full menu. Honours the persisted veg preference: with veg mode on
 * (either flavour) only veg dishes are listed, with a note saying so —
 * the user opted out of seeing non-veg food, so we don't show it here either.
 */
export function MenuList({ restaurant }: { restaurant: Restaurant }) {
  const { pref, ready } = useVegPreference();
  const vegOnly = pref !== "off";

  const items = useMemo(() => {
    const sorted = [...restaurant.menu_items].sort(
      // Popular dishes first, then menu order.
      (a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order
    );
    return vegOnly ? sorted.filter((m) => m.is_veg) : sorted;
  }, [restaurant.menu_items, vegOnly]);

  const hidden = restaurant.menu_items.length - items.length;

  return (
    <section aria-label="Menu" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Menu</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {ready ? `${items.length} item${items.length === 1 ? "" : "s"}` : ""}
        </span>
      </div>

      {ready && vegOnly && (
        <p className="flex items-center gap-2 rounded-2xl bg-veg/10 px-3 py-2 text-sm text-veg-deep">
          <LeafIcon width={16} height={16} className="shrink-0" />
          Veg mode is on{hidden > 0 ? ` · ${hidden} non-veg item${hidden === 1 ? "" : "s"} hidden` : ""}
        </p>
      )}

      {!ready ? (
        Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="aspect-[3/2] animate-pulse rounded-3xl border border-line bg-line" />
        ))
      ) : items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
          {vegOnly ? "This restaurant has no veg dishes yet." : "No dishes listed yet."}
        </p>
      ) : (
        items.map((item) => (
          <DishCard key={item.id} item={item} restaurant={{
              id: restaurant.id,
              slug: restaurant.slug,
              name: restaurant.name,
              delivery_min_minutes: restaurant.delivery_min_minutes,
              delivery_max_minutes: restaurant.delivery_max_minutes,
              lat: restaurant.lat,
              lng: restaurant.lng,
            }} />
        ))
      )}
    </section>
  );
}
