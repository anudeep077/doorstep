"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { scrollTo } from "@/lib/scroller";

/**
 * The scroll container lives in the root layout and survives navigation,
 * so — unlike the window — it wouldn't reset by itself. Scroll to top on
 * every route change. Rendered *before* page content so a page's own
 * layout effect (e.g. the feed restoring a saved position) runs after
 * this and wins.
 */
export function ScrollReset() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    scrollTo(0);
  }, [pathname]);
  return null;
}
