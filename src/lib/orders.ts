import type { CartLine, CartRestaurant } from "@/lib/cart";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Address } from "@/lib/types";

// Orders live in localStorage until auth lands; the shape mirrors
// orders + order_items in schema.sql so the swap is a storage change.

export type PaymentMethod = "cod" | "upi" | "card";
export type OrderStatus = "placed" | "preparing" | "on_the_way" | "delivered";

export type Bill = {
  item_total_minor: number;
  delivery_fee_minor: number;
  platform_fee_minor: number;
  tax_minor: number;
  total_minor: number;
  currency: string;
  free_delivery: boolean;
};

export type Order = {
  id: string;
  code: string;
  placed_at: string;
  restaurant: CartRestaurant;
  lines: CartLine[];
  address: Address;
  payment_method: PaymentMethod;
  /** Human form, e.g. "UPI · ravi@okaxis" or "Visa •••• 4242". Never full card data. */
  payment_label: string;
  bill: Bill;
  eta_min_minutes: number;
  eta_max_minutes: number;
};

// Pricing rules (mock — would be config/DB later).
const DELIVERY_FEE_MINOR = 3500;
const FREE_DELIVERY_ABOVE_MINOR = 49900;
const PLATFORM_FEE_MINOR = 500;
const TAX_RATE = 0.05; // GST on food

export function computeBill(lines: CartLine[]): Bill {
  const item_total_minor = lines.reduce((n, l) => n + l.qty * l.item.price_minor, 0);
  const free_delivery = item_total_minor >= FREE_DELIVERY_ABOVE_MINOR;
  const delivery_fee_minor = free_delivery ? 0 : DELIVERY_FEE_MINOR;
  const platform_fee_minor = lines.length ? PLATFORM_FEE_MINOR : 0;
  const tax_minor = Math.round(item_total_minor * TAX_RATE);
  return {
    item_total_minor,
    delivery_fee_minor,
    platform_fee_minor,
    tax_minor,
    total_minor: item_total_minor + delivery_fee_minor + platform_fee_minor + tax_minor,
    currency: lines[0]?.item.currency ?? "INR",
    free_delivery,
  };
}

export const FREE_DELIVERY_ABOVE = FREE_DELIVERY_ABOVE_MINOR;

const KEY = "orders";

function orderCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `DS-${s}`;
}

export function placeOrder(input: {
  restaurant: CartRestaurant;
  lines: CartLine[];
  address: Address;
  payment_method: PaymentMethod;
  payment_label: string;
}): Order {
  const order: Order = {
    id: crypto.randomUUID(),
    code: orderCode(),
    placed_at: new Date().toISOString(),
    restaurant: input.restaurant,
    lines: input.lines,
    address: input.address,
    payment_method: input.payment_method,
    payment_label: input.payment_label,
    bill: computeBill(input.lines),
    eta_min_minutes: input.restaurant.delivery_min_minutes,
    eta_max_minutes: input.restaurant.delivery_max_minutes,
  };
  writeJSON(KEY, [order, ...readJSON<Order[]>(KEY, [])]);
  return order;
}

export function listOrders(): Order[] {
  return readJSON<Order[]>(KEY, []);
}

export function getOrder(id: string): Order | null {
  return listOrders().find((o) => o.id === id) ?? null;
}

/**
 * Mock progression: with no restaurant/rider apps yet, status is derived
 * from time since placement so the tracking screen has something to show.
 * Real status comes from orders.status once those phases exist.
 */
export function mockStatus(order: Order, now = Date.now()): OrderStatus {
  const mins = (now - new Date(order.placed_at).getTime()) / 60_000;
  if (mins < 1) return "placed";
  if (mins < 3) return "preparing";
  if (mins < order.eta_min_minutes) return "on_the_way";
  return "delivered";
}

export const STATUS_STEPS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: "placed", label: "Order placed", hint: "The restaurant has your order" },
  { key: "preparing", label: "Preparing", hint: "Your food is being cooked" },
  { key: "on_the_way", label: "On the way", hint: "A rider has picked it up" },
  { key: "delivered", label: "Delivered", hint: "Enjoy your meal" },
];

// ---------------------------------------------------------------------------
// Rider simulation. No rider app exists yet, so the rider's position is
// derived from the order's mock timeline: waits at the restaurant while
// "placed"/"preparing", travels restaurant → address during "on_the_way"
// (with a gentle curve so it doesn't look like a ruler line), then parks at
// the door. Swap for live positions when the rider phase lands.
// ---------------------------------------------------------------------------

export type LatLng = { lat: number; lng: number };

const PREP_MINUTES = 3; // must match mockStatus's "preparing" window

// Fallback when an address has no coordinates (typed by hand, not picked):
// ~1.5 km north-east of the restaurant so there's still a route to draw.
export function orderEndpoints(order: Order): { from: LatLng; to: LatLng } {
  const from = { lat: order.restaurant.lat ?? 17.4325, lng: order.restaurant.lng ?? 78.4073 };
  const to =
    order.address.lat != null && order.address.lng != null
      ? { lat: order.address.lat, lng: order.address.lng }
      : { lat: from.lat + 0.01, lng: from.lng + 0.01 };
  return { from, to };
}

/** Point along the curved route at t ∈ [0,1]. */
export function routePoint(from: LatLng, to: LatLng, t: number): LatLng {
  const dLat = to.lat - from.lat;
  const dLng = to.lng - from.lng;
  // Perpendicular bulge, strongest mid-route.
  const bulge = Math.sin(t * Math.PI) * 0.18;
  return { lat: from.lat + dLat * t - dLng * bulge, lng: from.lng + dLng * t + dLat * bulge };
}

export function routePolyline(from: LatLng, to: LatLng, steps = 40): LatLng[] {
  return Array.from({ length: steps + 1 }, (_, i) => routePoint(from, to, i / steps));
}

/** Rider progress 0→1 along the route for this moment. */
export function riderProgress(order: Order, now = Date.now()): number {
  const mins = (now - new Date(order.placed_at).getTime()) / 60_000;
  const travel = Math.max(1, order.eta_min_minutes - PREP_MINUTES);
  return Math.min(1, Math.max(0, (mins - PREP_MINUTES) / travel));
}

export function riderPosition(order: Order, now = Date.now()): LatLng {
  const { from, to } = orderEndpoints(order);
  return routePoint(from, to, riderProgress(order, now));
}

/** Most recent order that hasn't been delivered yet, if any. */
export function activeOrder(now = Date.now()): Order | null {
  return listOrders().find((o) => mockStatus(o, now) !== "delivered") ?? null;
}
