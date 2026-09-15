// Which routes show the bottom tab bar. Detail/flow screens (restaurant,
// checkout, order, track) hide it so their own bottom actions own the edge.
export const BOTTOM_NAV_ROUTES = ["/", "/settings", "/orders"];

export function hasBottomNav(pathname: string) {
  return BOTTOM_NAV_ROUTES.includes(pathname);
}

/** Tailwind class for the tab bar's height (kept in one place for the cart bar offset). */
export const BOTTOM_NAV_H = "h-14";
