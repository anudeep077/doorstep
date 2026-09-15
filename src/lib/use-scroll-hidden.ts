"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getScroller } from "@/lib/scroller";

// Asymmetric on purpose: hiding needs a deliberate downward scroll so the
// bars don't vanish on a small nudge, but showing is instant so they're
// back the moment the user wants them.
const HIDE_AFTER_PX = 120;  // continuous downward distance before hiding
const SHOW_AFTER_PX = 10;   // upward distance before showing
const HIDE_MIN_Y = 160;     // never hide while still near the top of the page

/**
 * True while the user is scrolling *down*, false as soon as they scroll up
 * or reach either end of the page. Used to tuck the bottom bars away while
 * reading the feed and bring them back on the first upward flick.
 *
 * State carries the pathname it was computed for, so a route change
 * implicitly resets to "shown" without a setState-in-effect.
 */
export function useScrollHidden() {
  const pathname = usePathname();
  const [state, setState] = useState<{ hidden: boolean; path: string }>({ hidden: false, path: pathname });

  useEffect(() => {
    const scroller = getScroller();
    let last = scroller.scrollTop;
    let downRun = 0; // accumulated downward distance since the last upward move
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = scroller.scrollTop;
        const max = scroller.scrollHeight - scroller.clientHeight;
        const delta = y - last;
        last = y;
        let next: boolean | null = null;
        if (y <= 0 || y >= max - 2) {
          downRun = 0;
          next = false;
        } else if (delta > 0) {
          downRun += delta;
          if (downRun >= HIDE_AFTER_PX && y > HIDE_MIN_Y) next = true;
        } else if (delta < -SHOW_AFTER_PX) {
          downRun = 0;
          next = false;
        }
        if (next !== null) {
          setState((s) => (s.hidden === next && s.path === pathname ? s : { hidden: next, path: pathname }));
        }
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return state.path === pathname && state.hidden;
}
