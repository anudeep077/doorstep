// Remembers where the user was in the home feed when they opened a
// restaurant, so coming back lands them on the same card. sessionStorage:
// survives the round trip, dies with the tab.
//
// Needed because (a) the ‹ button would otherwise be a forward navigation,
// which scrolls to top, and (b) even on browser-back the feed briefly shows
// skeletons while the veg preference hydrates, so native restoration would
// clamp against a too-short page.

import { scrollTop } from "@/lib/scroller";

const SCROLL_KEY = "home-scroll";
const FROM_HOME_KEY = "nav-from-home";

export function rememberHomeScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(scrollTop()));
    sessionStorage.setItem(FROM_HOME_KEY, "1");
  } catch {
    // Storage unavailable — back just lands at the top.
  }
}

/** Returns the saved position (and forgets it) or null. */
export function consumeHomeScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/** True when this restaurant page was reached from the home feed in-app. */
export function cameFromHome() {
  try {
    return sessionStorage.getItem(FROM_HOME_KEY) === "1";
  } catch {
    return false;
  }
}
