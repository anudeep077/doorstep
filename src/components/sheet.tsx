"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getScroller } from "@/lib/scroller";
import { XIcon } from "./icons";

/**
 * Bottom sheet at every screen size (never a centred dialog — the app is
 * phone-shaped even on desktop, and all pop-ups should feel the same).
 * Closes on backdrop tap and Escape; locks body scroll while open; moves
 * focus into the panel so keyboard users land inside it.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** false for confirmations the user must answer with a button. */
  dismissible?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  // Stay mounted through the close animation: `shown` lags `open` by one
  // animation. Derived during render (React's sanctioned pattern).
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  const closing = !open && shown;

  useEffect(() => {
    if (!open) return;
    const scroller = getScroller();
    const prev = scroller.style.overflow;
    scroller.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      scroller.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dismissible]);

  if (!shown) return null;

  return (
    <div className={`fixed inset-0 z-40 flex items-end justify-center ${closing ? "pointer-events-none" : ""}`}>
      <div
        className={`${closing ? "backdrop-exit" : "backdrop-enter"} absolute inset-0 bg-black/50`}
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        tabIndex={-1}
        aria-hidden={closing}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) setShown(false);
        }}
        className={`${closing ? "sheet-exit" : "sheet-enter"} relative w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="sheet-title" className="text-lg font-semibold">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-m-2 rounded-full p-2 text-muted hover:bg-line/60"
            >
              <XIcon />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
