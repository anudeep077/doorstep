import type { MenuItem, Restaurant, VegPreference } from "@/lib/types";

// Pure feed logic — no React, no IO — so the veg-mode and search rules are
// easy to reason about (and test) in one place.

const bySort = (a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order;

/**
 * The dish whose photo fronts the card. Normally the lowest-sorted featured
 * item; in veg-dishes mode the lowest-sorted featured *veg* item, falling
 * back to any veg item, and finally to null when the restaurant has no veg
 * dish at all (the card then renders a "no veg dishes" state).
 */
export function featuredDish(r: Restaurant, pref: VegPreference): MenuItem | null {
  const items = [...r.menu_items].sort(bySort);
  const pool = pref === "veg_dishes" ? items.filter((m) => m.is_veg) : items;
  return pool.find((m) => m.is_featured) ?? pool[0] ?? null;
}

export type FeedEntry = {
  restaurant: Restaurant;
  dish: MenuItem | null;
  /** Set when the search query matched a dish rather than the restaurant itself. */
  matchedDish: MenuItem | null;
};

function normalise(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * Applies veg preference then search. Search covers restaurant name, cuisine
 * tags, and dish names — a dish hit surfaces that dish as the card image so
 * the user sees *why* the restaurant matched.
 */
export function buildFeed(restaurants: Restaurant[], pref: VegPreference, query: string): FeedEntry[] {
  const q = normalise(query.trim());
  const visible = pref === "veg_restaurants" ? restaurants.filter((r) => r.is_veg_only) : restaurants;

  return visible.flatMap((restaurant) => {
    const dish = featuredDish(restaurant, pref);
    if (!q) return [{ restaurant, dish, matchedDish: null }];

    const nameHit = normalise(restaurant.name).includes(q);
    const tagHit = restaurant.cuisine_tags.some((t) => normalise(t).includes(q));
    // In veg-dishes mode only veg dishes are searchable; the user asked not
    // to see non-veg food, so a non-veg match shouldn't pull a card in.
    const searchable =
      pref === "veg_dishes" ? restaurant.menu_items.filter((m) => m.is_veg) : restaurant.menu_items;
    const matchedDish = [...searchable].sort(bySort).find((m) => normalise(m.name).includes(q)) ?? null;

    if (!nameHit && !tagHit && !matchedDish) return [];
    return [{ restaurant, dish: matchedDish ?? dish, matchedDish }];
  });
}

export function formatPrice(minor: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    minor / 100
  );
}

/**
 * Words for the search placeholder, drawn from the catalogue so they're
 * always things you can actually find — and only veg dishes while veg mode
 * is on, so the hint never suggests "chicken momos" to someone who asked
 * not to see non-veg food.
 */
export function searchSuggestions(restaurants: Restaurant[], pref: VegPreference): string[] {
  const visible = pref === "veg_restaurants" ? restaurants.filter((r) => r.is_veg_only) : restaurants;
  const seen = new Set<string>();
  const words: string[] = [];
  for (const r of visible) {
    const dish = featuredDish(r, pref);
    if (!dish || (pref !== "off" && !dish.is_veg)) continue;
    // "Ghee Podi Masala Dosa" → "dosa": the last word is usually the dish
    // type, once any "with makhan"-style suffix is dropped.
    const word = dish.name.toLowerCase().replace(/\s+with\s+.*$/, "").split(/\s+/).at(-1) ?? "";
    if (word.length > 2 && !seen.has(word)) {
      seen.add(word);
      words.push(word);
    }
  }
  return words;
}
