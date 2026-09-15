"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { activeOrder, mockStatus, type Order } from "@/lib/orders";
import { isClientMounted, markClientMounted } from "@/lib/storage";
import { DrivingScooter, XIcon } from "./icons";

const CALLOUT_KEY = "track-callout-shown"; // sessionStorage: order id
const CALLOUT_MS = 8000;

/**
 * "Track order" pill next to the address chip while an order is in
 * progress: delivery scooter + label + live ETA. Tapping it opens the map.
 * The first time it shows up for an order, a callout bubble explains it.
 */
export function RiderBadge() {
  const [order, setOrder] = useState<Order | null>(() => (isClientMounted() ? activeOrder() : null));
  const [callout, setCallout] = useState(false);

  useEffect(() => {
    markClientMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(activeOrder());
    // Re-check as the mock timeline advances so the badge retires itself.
    const t = setInterval(() => setOrder(activeOrder()), 15_000);
    return () => clearInterval(t);
  }, []);

  // One callout per order, auto-dismissed.
  useEffect(() => {
    if (!order) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(CALLOUT_KEY) === order.id;
      if (!shown) sessionStorage.setItem(CALLOUT_KEY, order.id);
    } catch {
      /* storage unavailable — just show it */
    }
    if (shown) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCallout(true);
    const t = setTimeout(() => setCallout(false), CALLOUT_MS);
    return () => clearTimeout(t);
  }, [order]);

  if (!order) return null;
  const status = mockStatus(order);
  const driving = status === "on_the_way";
  const eta = new Date(order.placed_at).getTime() + order.eta_max_minutes * 60_000;
  const minsLeft = Math.max(1, Math.round((eta - Date.now()) / 60_000));
  const sub = driving ? `${minsLeft} min away` : "Preparing";
  const label = driving ? `Rider is on the way, about ${minsLeft} minutes` : "Order is being prepared";

  return (
    <div className="relative shrink-0">
      <Link
        href={`/track/${order.id}`}
        aria-label={`Track order — ${label}`}
        onClick={() => setCallout(false)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-veg pl-2 pr-3 text-white shadow-md shadow-veg/30 hover:opacity-90 active:scale-95"
      >
        <DrivingScooter size={24} driving={driving} />
        <span className="leading-none">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/85">Track order</span>
          <span className="mt-0.5 block text-sm font-bold tabular-nums">{sub}</span>
        </span>
      </Link>

      {callout && (
        <div
          role="status"
          className="pop-in absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl bg-veg-deep p-3 text-white shadow-xl shadow-veg/30"
        >
          {/* arrow */}
          <span className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 bg-veg-deep" aria-hidden />
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm leading-snug">
              <span className="font-semibold">{driving ? "Your food is on its way!" : "Your order is being prepared."}</span>{" "}
              Tap here to watch the rider on the map.
            </p>
            <button
              type="button"
              onClick={() => setCallout(false)}
              aria-label="Dismiss"
              className="-m-1 rounded-full p-1 opacity-70 hover:opacity-100"
            >
              <XIcon width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
