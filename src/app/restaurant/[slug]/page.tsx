import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClockIcon, LeafIcon, StarIcon } from "@/components/icons";
import { MenuList } from "@/components/menu-list";
import { RestaurantHeader } from "@/components/restaurant-header";
import { getRestaurant } from "@/lib/restaurants";

export async function generateMetadata(props: PageProps<"/restaurant/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = await getRestaurant(slug);
  return { title: r ? `${r.name} — Doorstep` : "Restaurant not found" };
}

export default async function RestaurantPage(props: PageProps<"/restaurant/[slug]">) {
  const { slug } = await props.params;
  const r = await getRestaurant(slug);
  if (!r) notFound();

  return (
    <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-10">
      <RestaurantHeader name={r.name}>
        <div className="flex items-start justify-between gap-3">
          <h1 className="collapsing-title text-2xl font-bold leading-tight">{r.name}</h1>
          {r.is_veg_only && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-veg/10 px-2 py-0.5 text-xs font-semibold text-veg-deep">
              <LeafIcon width={12} height={12} strokeWidth={2.5} />
              Pure veg
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">
          {r.cuisine_tags.join(" · ")}
          {r.area && <span> · {r.area}</span>}
        </p>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 rounded-md bg-veg-deep px-1.5 py-0.5 text-xs font-semibold text-white">
            <StarIcon width={12} height={12} />
            {r.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted">{r.rating_count.toLocaleString("en-IN")} ratings</span>
          <span className="text-muted">·</span>
          <span className="inline-flex items-center gap-1 text-muted">
            <ClockIcon width={14} height={14} />
            {r.delivery_min_minutes}–{r.delivery_max_minutes} min
          </span>
        </div>
      </RestaurantHeader>

      <MenuList restaurant={r} />
    </main>
  );
}
