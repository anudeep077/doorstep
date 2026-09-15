"use client";

import { useState } from "react";
import { useCart, type CartRestaurant } from "@/lib/cart";
import { formatPrice } from "@/lib/feed";
import type { MenuItem } from "@/lib/types";
import { FadeImg } from "./fade-img";
import { VegMark } from "./icons";
import { QtyStepper } from "./qty-stepper";
import { Sheet } from "./sheet";

/** Same visual as the homepage restaurant card's image area, one per dish,
 *  with the ADD button / quantity stepper sitting above the price. */
export function DishCard({ item, restaurant }: { item: MenuItem; restaurant: CartRestaurant }) {
  const cart = useCart();
  const [imgFailed, setImgFailed] = useState(false);
  const [conflict, setConflict] = useState(false);
  const showImage = item.image_url && !imgFailed;
  const qty = cart.qtyOf(item.id);

  const add = () => {
    // Refused when the cart holds another restaurant's food — one order,
    // one kitchen — so ask before wiping it.
    if (!cart.add(item, restaurant)) setConflict(true);
  };

  return (
    <article className="feed-card overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="relative aspect-[3/2] w-full bg-line">
        {showImage ? (
          <FadeImg src={item.image_url!} alt={item.name} loading="lazy" onFail={() => setImgFailed(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/20 via-line to-veg/20 text-sm text-muted">
            Photo coming soon
          </div>
        )}
        {item.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
            Popular
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-3 pt-12 text-white">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/75">
              <VegMark veg={item.is_veg} />
              {item.is_veg ? "Veg" : "Non-veg"}
            </p>
            <p className="truncate text-lg font-semibold leading-tight">{item.name}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <QtyStepper qty={qty} onAdd={add} onChange={(q) => cart.setQty(item.id, q)} />
            <span className="text-sm font-medium text-white/90">{formatPrice(item.price_minor, item.currency)}</span>
          </div>
        </div>
      </div>

      <Sheet open={conflict} onClose={() => setConflict(false)} title="Replace cart items?">
        <p className="mb-5 text-sm text-muted">
          Your cart has items from <span className="font-semibold text-foreground">{cart.restaurant?.name}</span>. Adding from{" "}
          <span className="font-semibold text-foreground">{restaurant.name}</span> will clear it.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setConflict(false)} className="rounded-2xl border border-line py-3 font-semibold hover:bg-line/40">
            Keep cart
          </button>
          <button
            type="button"
            onClick={() => {
              cart.replaceWith(item, restaurant);
              setConflict(false);
            }}
            className="rounded-2xl bg-veg py-3 font-semibold text-white hover:opacity-90"
          >
            Replace
          </button>
        </div>
      </Sheet>
    </article>
  );
}
