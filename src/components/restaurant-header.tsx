"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getScroller } from "@/lib/scroller";
import { BackToHome } from "./back-to-home";

// Scroll distance over which the header collapses (px).
const COLLAPSE_PX = 96;

/**
 * Collapsing header for the restaurant page. Publishes scroll progress
 * 0→1 as the CSS variable `--p`; the big title (`.collapsing-title`, in the
 * server-rendered card) and the bar labels read it, so the name shrinks
 * smoothly as you scroll and "settles" beside the ‹ button while
 * "Restaurants" slides out of the way. Pure CSS math, one scroll listener.
 */
export function RestaurantHeader({ name, children }: { name: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scroller = getScroller();
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scroller.scrollTop / COLLAPSE_PX));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="contents" style={{ "--p": 0 } as React.CSSProperties}>
      <div className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 bg-background/85 px-4 backdrop-blur-md">
        <BackToHome
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface shadow-sm hover:bg-line/40"
          aria-label="Back to restaurants"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </BackToHome>
        {/* Both labels share one grid cell and crossfade with --p. */}
        <div className="grid min-w-0 flex-1">
          <BackToHome className="bar-label-out col-start-1 row-start-1 truncate text-sm font-medium text-muted" tabIndex={-1}>
            Restaurants
          </BackToHome>
          <span className="bar-label-in col-start-1 row-start-1 truncate text-base font-bold">{name}</span>
        </div>
      </div>
      <header className="rounded-3xl border border-line bg-surface p-4 shadow-sm">{children}</header>
    </div>
  );
}
