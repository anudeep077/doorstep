// The app scrolls inside a phone-width container (see layout.tsx), not the
// window — so the scrollbar sits at the edge of the "phone" on desktop and
// the frame around it stays put. Everything that reads or sets scroll
// position goes through here instead of `window`.

export const SCROLLER_ID = "app-scroll";

export function getScroller(): HTMLElement {
  // Falls back to <html> so code still works if rendered outside the shell.
  return document.getElementById(SCROLLER_ID) ?? document.documentElement;
}

export function scrollTop() {
  return getScroller().scrollTop;
}

export function scrollTo(top: number, behavior: ScrollBehavior = "instant") {
  getScroller().scrollTo({ top, behavior });
}
