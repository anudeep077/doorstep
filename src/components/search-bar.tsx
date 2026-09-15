"use client";

import { useEffect, useState } from "react";
import { SearchIcon, XIcon } from "./icons";

const ROTATE_MS = 2200;
const FALLBACK = ["biryani", "pizza", "dosa"];

export function SearchBar({
  value,
  onChange,
  suggestions = FALLBACK,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Words cycled in the placeholder — "Search for 'biryani'". */
  suggestions?: string[];
}) {
  const [i, setI] = useState(0);
  const [focused, setFocused] = useState(false);
  const words = suggestions.length ? suggestions : FALLBACK;

  // Only rotate while the hint is actually visible (empty + unfocused).
  const showHint = !value && !focused;
  useEffect(() => {
    if (!showHint || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => n + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, [showHint, words.length]);
  const word = words[i % words.length];

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search for food or restaurants"
        enterKeyHint="search"
        className="w-full rounded-2xl border border-line bg-surface py-3.5 pl-12 pr-10 shadow-sm outline-none focus:border-brand [&::-webkit-search-cancel-button]:hidden"
      />
      {/* Animated placeholder: a real `placeholder` can't animate, so this
          overlay stands in for it while the field is empty and unfocused. */}
      {showHint && (
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-12 flex items-center gap-1 text-muted">
          <span>Search for</span>
          <span className="relative h-6 overflow-hidden">
            <span key={word} className="hint-word block leading-6">
              “{word}”
            </span>
          </span>
        </div>
      )}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:bg-line/60"
        >
          <XIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
