"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readJSON, writeJSON } from "@/lib/storage";
import type { MenuItem, Restaurant } from "@/lib/types";

// Cart lives in localStorage for now (no auth). Each line carries a snapshot
// of the dish so the cart renders without refetching menus; the checkout
// phase should re-price against menu_items server-side before charging.

export type CartLine = {
  item: Pick<MenuItem, "id" | "name" | "price_minor" | "currency" | "is_veg" | "image_url">;
  qty: number;
};

export type CartRestaurant = Pick<Restaurant, "id" | "slug" | "name" | "delivery_min_minutes" | "delivery_max_minutes" | "lat" | "lng">;

type CartState = { restaurant: CartRestaurant | null; lines: CartLine[] };

type CartContextValue = CartState & {
  ready: boolean;
  count: number;
  total_minor: number;
  qtyOf: (itemId: string) => number;
  /** Returns false (and changes nothing) when the cart holds another restaurant's food. */
  add: (item: MenuItem, restaurant: CartRestaurant) => boolean;
  /** Empties the cart and adds the item — the "replace cart" confirmation path. */
  replaceWith: (item: MenuItem, restaurant: CartRestaurant) => void;
  setQty: (itemId: string, qty: number) => void;
  clear: () => void;
};

const KEY = "cart";
const EMPTY: CartState = { restaurant: null, lines: [] };
const CartContext = createContext<CartContextValue | null>(null);

const snapshot = (m: MenuItem): CartLine["item"] => ({
  id: m.id,
  name: m.name,
  price_minor: m.price_minor,
  currency: m.currency,
  is_veg: m.is_veg,
  image_url: m.image_url,
});

function addLine(state: CartState, item: MenuItem, restaurant: CartRestaurant): CartState {
  const existing = state.lines.find((l) => l.item.id === item.id);
  const lines = existing
    ? state.lines.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l))
    : [...state.lines, { item: snapshot(item), qty: 1 }];
  return { restaurant, lines };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrating from localStorage (client-only) — see use-veg-preference.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readJSON<CartState>(KEY, EMPTY));
    setReady(true);
  }, []);

  const commit = useCallback((next: CartState) => {
    const normalised = next.lines.length ? next : EMPTY;
    setState(normalised);
    writeJSON(KEY, normalised);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const total_minor = state.lines.reduce((n, l) => n + l.qty * l.item.price_minor, 0);
    return {
      ...state,
      ready,
      count,
      total_minor,
      qtyOf: (id) => state.lines.find((l) => l.item.id === id)?.qty ?? 0,
      add: (item, restaurant) => {
        if (state.restaurant && state.restaurant.id !== restaurant.id) return false;
        commit(addLine(state, item, restaurant));
        return true;
      },
      replaceWith: (item, restaurant) => commit(addLine(EMPTY, item, restaurant)),
      setQty: (id, qty) =>
        commit({
          ...state,
          lines: qty <= 0 ? state.lines.filter((l) => l.item.id !== id) : state.lines.map((l) => (l.item.id === id ? { ...l, qty } : l)),
        }),
      clear: () => commit(EMPTY),
    };
  }, [state, ready, commit]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
