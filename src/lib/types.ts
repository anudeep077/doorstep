// Row shapes mirror supabase/schema.sql. Keep the two in sync by hand — no
// codegen in this phase.

export type VegPreference = "off" | "veg_restaurants" | "veg_dishes";

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  price_minor: number;
  currency: string;
  is_veg: boolean;
  is_featured: boolean;
  sort_order: number;
  image_url: string | null;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisine_tags: string[];
  rating: number;
  rating_count: number;
  delivery_min_minutes: number;
  delivery_max_minutes: number;
  is_veg_only: boolean;
  area: string | null;
  lat: number | null;
  lng: number | null;
  menu_items: MenuItem[];
};

export type AddressLabel = "home" | "work" | "other";

export type Address = {
  id: string;
  label: AddressLabel;
  short_label: string;
  formatted: string;
  lat: number | null;
  lng: number | null;
};

/** One candidate from /api/geocode — what the address sheet turns into an Address. */
export type GeocodeResult = {
  id: string;
  short_label: string;
  formatted: string;
  lat: number;
  lng: number;
};
