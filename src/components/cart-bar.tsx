"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { hasBottomNav } from "@/lib/bottom-nav";
import { useCart } from "@/lib/cart";
import { useScrollHidden } from "@/lib/use-scroll-hidden";
import { formatPrice } from "@/lib/feed";
import { BagIcon, ChevronRightIcon, VegMark } from "./icons";
import { QtyStepper } from "./qty-stepper";
import { Sheet } from "./sheet";

/**
 * Fixed bar along the bottom of the screen whenever the cart has something
 * in it, plus the cart sheet it opens. Rendered once from the root layout so
 * it follows the user between the feed and restaurant pages.
 */
type Summary = { count: number; total: string; restaurant: string };

export function CartBar() {
  const cart = useCart();
  const pathname = usePathname();
  const scrollHidden = useScrollHidden();
  const [open, setOpen] = useState(false);

  // The bar slides out when the cart empties, so it has to keep rendering
  // the last summary for the length of that animation. `last` is derived
  // from cart state during render (React's sanctioned pattern for this)
  // and cleared once the exit animation finishes.
  const [last, setLast] = useState<Summary | null>(null);
  const live: Summary | null =
    cart.count > 0
      ? {
          count: cart.count,
          total: formatPrice(cart.total_minor, cart.lines[0].item.currency),
          restaurant: cart.restaurant?.name ?? "",
        }
      : null;
  if (
    live &&
    (live.count !== last?.count ||
      live.total !== last?.total ||
      live.restaurant !== last?.restaurant)
  ) {
    setLast(live);
  }

  const summary = live ?? last;
  // Checkout has its own bottom action; order screens are post-cart.
  const hiddenHere =
    pathname.startsWith("/checkout") || pathname.startsWith("/order");
  if (!cart.ready || !summary || hiddenHere) return null;
  const leaving = !live;
  const aboveNav = hasBottomNav(pathname);
  // Only tuck away on tab screens (feed/settings). Inside a restaurant menu
  // the cart is the whole point — it stays put while you scroll the dishes.
  const hidden = aboveNav && scrollHidden;

  return (
    <>
      {/* In-flow spacer so page content can scroll clear of the fixed bar. */}
      <div className="h-20" aria-hidden />
      <div
        className={`${leaving ? "cart-bar-exit" : "cart-bar-enter"} fixed inset-x-0 z-30 mx-auto w-full max-w-md px-4 ${
          aboveNav
            ? "bottom-[calc(3.5rem+env(safe-area-inset-bottom))] pb-2"
            : "bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
        }`}
        aria-hidden={leaving}
        onAnimationEnd={(e) => {
          if (leaving && e.target === e.currentTarget) setLast(null);
        }}
      >
        <div
          className={`transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${hidden ? "translate-y-[300%]" : "translate-y-0"}`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={leaving}
            className="flex w-full items-center gap-3 rounded-2xl bg-veg px-4 py-3 text-left text-white shadow-xl shadow-veg/30 hover:opacity-95 active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
              <BagIcon />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-xs font-medium text-white/80">
                {summary.count} item{summary.count === 1 ? "" : "s"} ·{" "}
                {summary.restaurant}
              </span>
              <span className="block font-bold">{summary.total}</span>
            </span>
            <span className="inline-flex items-center gap-0.5 font-semibold">
              View cart
              <ChevronRightIcon width={18} height={18} />
            </span>
          </button>
        </div>
      </div>

      <Sheet
        open={open && !leaving}
        onClose={() => setOpen(false)}
        title="Your cart"
      >
        <Link
          href={`/restaurant/${cart.restaurant?.slug}`}
          onClick={() => setOpen(false)}
          className="mb-3 block text-sm text-muted hover:underline"
        >
          From{" "}
          <span className="font-semibold text-foreground">
            {cart.restaurant?.name}
          </span>{" "}
          · add more ›
        </Link>
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {cart.lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-3">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="h-12 w-12 shrink-0 rounded-xl bg-line" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <VegMark veg={item.is_veg} />
                  <span className="truncate font-medium">{item.name}</span>
                </span>
                <span className="block text-xs text-muted">
                  {formatPrice(item.price_minor * qty, item.currency)}
                </span>
              </span>
              <QtyStepper
                size="sm"
                qty={qty}
                onAdd={() => cart.setQty(item.id, 1)}
                onChange={(q) => cart.setQty(item.id, q)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Item total</span>
          <span className="font-bold">{summary.total}</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Delivery fee and taxes are worked out at checkout.
        </p>
        <Link
          href="/checkout"
          onClick={() => setOpen(false)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-veg px-5 py-3 font-semibold text-white hover:opacity-95"
        >
          <span>Checkout</span>
          <span className="inline-flex items-center">
            {summary.total}
            <ChevronRightIcon width={18} height={18} />
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            cart.clear();
            setOpen(false);
          }}
          className="mt-2 w-full py-2 text-sm font-medium text-muted hover:text-red-600"
        >
          Clear cart
        </button>
      </Sheet>
    </>
  );
}
