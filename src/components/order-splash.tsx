"use client";

import { useSyncExternalStore } from "react";
import { CheckIcon, DrivingScooter } from "./icons";

// Tiny external store so the splash can be triggered from checkout but
// rendered from the root layout — it has to survive the route change from
// /checkout to /order/[id] and fade out over the confirmation page.
let visible = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function showOrderSplash() {
  visible = true;
  emit();
}

/** How long the screen is fully covered before the fade — do the navigation inside this window. */
export const ORDER_SPLASH_COVER_MS = 900;

export function OrderSplash() {
  const on = useSyncExternalStore(subscribe, () => visible, () => false);
  if (!on) return null;
  return (
    <div
      className="order-splash fixed inset-0 z-50 grid place-items-center bg-veg text-white"
      role="status"
      aria-live="polite"
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        visible = false;
        emit();
      }}
    >
      {/* road + scooter racing across the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] h-px bg-white/30" aria-hidden />
      <div className="pointer-events-none absolute bottom-[18%] left-1/2 -ml-8 text-white" aria-hidden>
        <div className="order-splash-ride">
          <DrivingScooter size={64} />
        </div>
      </div>
      <div className="order-splash-content flex flex-col items-center gap-4">
        <span className="grid h-28 w-28 place-items-center rounded-full bg-white text-veg shadow-2xl">
          <CheckIcon width={64} height={64} strokeWidth={3} />
        </span>
        <p className="text-4xl font-extrabold tracking-tight">Order placed!</p>
        <p className="text-base text-white/90">Sit tight — the kitchen&apos;s on it.</p>
      </div>
    </div>
  );
}
