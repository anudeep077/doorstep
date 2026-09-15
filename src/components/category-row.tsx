"use client";

import { useState } from "react";
import type { DishCategory } from "@/data/categories";
import { FadeImg } from "./fade-img";

/**
 * Horizontally scrolling dish categories. Selecting one runs it as a
 * search (so results, veg-mode rules and the "matches your search" badge
 * all behave exactly as if the user typed it); tapping the active chip
 * clears the search again.
 */
export function CategoryRow({
  categories,
  active,
  onSelect,
}: {
  categories: DishCategory[];
  /** Current search query, to highlight the matching chip. */
  active: string;
  onSelect: (query: string) => void;
}) {
  const current = active.trim().toLowerCase();
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="Popular dishes">
      <div className="flex w-max gap-3 pb-1">
        {categories.map((c) => {
          const on = current === c.query;
          return (
            <button
              key={c.query}
              type="button"
              role="listitem"
              aria-pressed={on}
              onClick={() => onSelect(on ? "" : c.query)}
              className="group flex w-[68px] shrink-0 flex-col items-center gap-1.5 active:scale-95"
            >
              <span
                className={`grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-line ring-offset-2 ring-offset-background transition-all ${
                  on ? "ring-[3px] ring-brand" : "ring-0 group-hover:ring-2 group-hover:ring-line"
                }`}
              >
                <CategoryImage c={c} />
              </span>
              <span className={`max-w-full truncate text-xs ${on ? "font-bold text-brand" : "font-medium text-foreground/80"}`}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryImage({ c }: { c: DishCategory }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/25 to-veg/20 text-2xl" aria-hidden>
        {c.emoji}
      </span>
    );
  }
  return <FadeImg src={c.image_url} alt="" referrerPolicy="no-referrer" onFail={() => setFailed(true)} className="h-full w-full object-cover" />;
}
