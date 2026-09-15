"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Sticky "‹ Title" bar for secondary screens (checkout, order).
 * `back="history"` (default) pops the previous screen so it keeps its
 * state; `back="href"` always navigates to `backHref` — for screens like
 * the order confirmation where "back" into a finished checkout makes no sense.
 */
export function PageBar({
  title,
  backHref = "/",
  back = "history",
}: {
  title: string;
  backHref?: string;
  back?: "history" | "href";
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 bg-background/85 px-4 backdrop-blur-md">
      <Link
        href={backHref}
        onClick={(e) => {
          if (back === "href") return;
          // Prefer real history-back so the previous screen keeps its state.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          if (window.history.length <= 1) return;
          e.preventDefault();
          router.back();
        }}
        aria-label="Back"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface shadow-sm hover:bg-line/40"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="truncate text-base font-bold">{title}</h1>
    </div>
  );
}
