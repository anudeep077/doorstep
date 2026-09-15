"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasBottomNav } from "@/lib/bottom-nav";
import { useScrollHidden } from "@/lib/use-scroll-hidden";
import { HomeFilledIcon, HomeIcon, SettingsIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, ActiveIcon: HomeFilledIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon, ActiveIcon: SettingsIcon },
] as const;

/** YouTube-style bottom tab bar. Rendered from the root layout. */
export function BottomNav() {
  const pathname = usePathname();
  const hidden = useScrollHidden();
  if (!hasBottomNav(pathname)) return null;

  return (
    <>
      {/* In-flow spacer so content scrolls clear of the fixed bar. */}
      <div className="h-14" aria-hidden />
      <nav
        aria-label="Primary"
        // Fixed but confined to the phone-width column (left+right 0 with a
        // max-width and auto margins centres a fixed box), so on desktop the
        // bar is as wide as the app, not the window.
        className={`fixed inset-x-0 bottom-0 z-[31] mx-auto w-full max-w-md border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sm:rounded-t-2xl sm:border-x ${
          hidden ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <ul className="flex h-14 w-full items-stretch">
          {TABS.map(({ href, label, Icon, ActiveIcon }) => {
            // /orders lives under Settings in the information architecture.
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/settings" && pathname === "/orders");
            const Glyph = active ? ActiveIcon : Icon;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors active:scale-95 ${
                    active ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Glyph width={24} height={24} strokeWidth={active ? 2.25 : 2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
