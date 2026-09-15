import seed from "@/data/seed.json";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Restaurant } from "@/lib/types";

// The bundled catalogue, given stable synthetic ids so it has the same shape
// as a Supabase result. Used when no credentials are configured or the
// query fails — the homepage should never render empty because of setup.
function seedRestaurants(): Restaurant[] {
  return seed.restaurants.map((r) => ({
    id: `seed-${r.slug}`,
    slug: r.slug,
    name: r.name,
    cuisine_tags: r.cuisine_tags,
    rating: r.rating,
    rating_count: r.rating_count,
    delivery_min_minutes: r.delivery_min_minutes,
    delivery_max_minutes: r.delivery_max_minutes,
    is_veg_only: r.is_veg_only,
    area: r.area,
    lat: r.lat,
    lng: r.lng,
    menu_items: r.menu_items.map((m, i) => ({
      id: `seed-${r.slug}-${i}`,
      restaurant_id: `seed-${r.slug}`,
      name: m.name,
      price_minor: m.price_minor,
      currency: "INR",
      is_veg: m.is_veg,
      is_featured: m.is_featured,
      sort_order: m.sort_order,
      image_url: m.image_url,
    })),
  }));
}

const SELECT =
  "id, slug, name, cuisine_tags, rating, rating_count, delivery_min_minutes, delivery_max_minutes, is_veg_only, area, lat, lng, " +
  "menu_items (id, restaurant_id, name, price_minor, currency, is_veg, is_featured, sort_order, image_url)";

// No generated Database types in this phase, so the embedded select is
// untyped — this cast pins it to the row shape from schema.sql. numeric(2,1)
// arrives as a string from PostgREST, hence the Number().
type Row = Omit<Restaurant, "rating"> & { rating: string | number };
const fromRow = (r: Row): Restaurant => ({ ...r, rating: Number(r.rating) });

export async function getRestaurants(): Promise<{ restaurants: Restaurant[]; source: "supabase" | "seed" }> {
  if (!hasSupabaseEnv()) return { restaurants: seedRestaurants(), source: "seed" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select(SELECT)
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .order("sort_order", { referencedTable: "menu_items", ascending: true });

  if (error || !data) {
    console.warn("[restaurants] Supabase query failed, serving seed catalogue:", error?.message);
    return { restaurants: seedRestaurants(), source: "seed" };
  }
  return { restaurants: (data as unknown as Row[]).map(fromRow), source: "supabase" };
}

/** One restaurant with its full menu, or null when the slug is unknown. */
export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  if (!hasSupabaseEnv()) return seedRestaurants().find((r) => r.slug === slug) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "menu_items", ascending: true })
    .maybeSingle();

  if (error) {
    console.warn("[restaurants] Supabase query failed, falling back to seed:", error.message);
    return seedRestaurants().find((r) => r.slug === slug) ?? null;
  }
  return data ? fromRow(data as unknown as Row) : null;
}
