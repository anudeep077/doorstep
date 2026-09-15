"use client";

import Link from "next/link";
import { useState } from "react";
import type { FeedEntry } from "@/lib/feed";
import { formatPrice } from "@/lib/feed";
import { rememberHomeScroll } from "@/lib/scroll-memory";
import { FadeImg } from "./fade-img";
import { ClockIcon, LeafIcon, StarIcon, VegMark } from "./icons";

export function RestaurantCard({ entry }: { entry: FeedEntry }) {
  const { restaurant: r, dish, matchedDish } = entry;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = dish?.image_url && !imgFailed;

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      onClick={rememberHomeScroll}
      className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
    >
      <article className="feed-card overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition-transform active:scale-[0.99]">
        {/* Image area: the featured dish's photo, never a generic storefront. */}
        <div className="relative aspect-[3/2] w-full bg-line">
          {showImage ? (
            // Plain <img> (via FadeImg): the seed uses arbitrary external hosts
            // with an on-error fallback, which next/image's optimizer and
            // remotePatterns fight.
            <FadeImg src={dish.image_url!} alt={dish.name} loading="lazy" onFail={() => setImgFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/20 via-line to-veg/20 text-muted">
              <span className="text-sm">
                {dish ? "Photo coming soon" : "No veg dishes yet"}
              </span>
            </div>
          )}

          {dish && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10 text-white">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/75">
                <VegMark veg={dish.is_veg} />
                {matchedDish ? "Matches your search" : "Popular dish"}
              </p>
              <p className="flex items-baseline justify-between gap-3">
                <span className="truncate text-lg font-semibold leading-tight">
                  {dish.name}
                </span>
                <span className="shrink-0 text-sm font-medium text-white/90">
                  {formatPrice(dish.price_minor, dish.currency)}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 truncate text-base font-semibold">
              {r.name}
            </h3>
            {r.is_veg_only && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-veg/10 px-2 py-0.5 text-xs font-semibold text-veg-deep">
                <LeafIcon width={12} height={12} strokeWidth={2.5} />
                Pure veg
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-veg-deep px-1.5 py-0.5 text-xs font-semibold text-white">
              <StarIcon width={12} height={12} />
              {r.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted">
              ({compact(r.rating_count)})
            </span>
            <span className="text-muted">·</span>
            <span className="inline-flex items-center gap-1 text-muted">
              <ClockIcon width={14} height={14} />
              {r.delivery_min_minutes}–{r.delivery_max_minutes} min
            </span>
          </div>

          <p className="truncate text-sm text-muted">
            {r.cuisine_tags.join(" · ")}
            {r.area && <span> · {r.area}</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}

function compact(n: number) {
  return n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(n);
}
