import { HomeFeed } from "@/components/home-feed";
import { getRestaurants } from "@/lib/restaurants";

export default async function Home() {
  const { restaurants, source } = await getRestaurants();

  return (
    <main className="flex-1">
      {source === "seed" && (
        <p className="bg-brand/10 px-4 py-1.5 text-center text-xs text-muted">
          Showing bundled sample data — add Supabase credentials to <code>.env.local</code> to read from the DB.
        </p>
      )}
      <HomeFeed restaurants={restaurants} />
    </main>
  );
}
