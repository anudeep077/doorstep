"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "./icons";

/**
 * "ADD" pill that turns into a − qty + stepper once the dish is in the cart.
 * The swap pops (scale + fade) and the count bumps on change — but only
 * after the user has interacted, so a menu full of ADD buttons doesn't all
 * pop on page load.
 */
export function QtyStepper({
  qty,
  onAdd,
  onChange,
  size = "md",
}: {
  qty: number;
  onAdd: () => void;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}) {
  const [touched, setTouched] = useState(false);
  const h = size === "sm" ? "h-8" : "h-9";
  const pop = touched ? "pop-in" : "";

  if (qty === 0) {
    return (
      <button
        key="add"
        type="button"
        onClick={() => {
          setTouched(true);
          onAdd();
        }}
        className={`${h} ${pop} rounded-xl border border-line bg-surface px-5 text-sm font-bold uppercase tracking-wide text-veg shadow-md hover:bg-veg/10 active:scale-95`}
      >
        Add
      </button>
    );
  }
  return (
    <div
      key="stepper"
      className={`${h} ${pop} inline-flex items-center rounded-xl bg-veg text-white shadow-md`}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => {
          setTouched(true);
          onChange(qty - 1);
        }}
        aria-label="Remove one"
        className="grid h-full w-9 place-items-center rounded-l-xl hover:bg-white/15 active:bg-white/25"
      >
        <MinusIcon width={16} height={16} strokeWidth={2.5} />
      </button>
      {/* Keyed on qty so each change re-mounts the number and replays the bump. */}
      <span key={qty} className={`min-w-6 text-center text-sm font-bold tabular-nums ${touched ? "qty-bump" : ""}`} aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => {
          setTouched(true);
          onChange(qty + 1);
        }}
        aria-label="Add one"
        className="grid h-full w-9 place-items-center rounded-r-xl hover:bg-white/15 active:bg-white/25"
      >
        <PlusIcon width={16} height={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
