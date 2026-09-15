import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-semibold">We couldn&apos;t find that restaurant.</p>
      <p className="text-sm text-muted">It may have closed or the link is wrong.</p>
      <Link href="/" className="mt-2 rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">
        Back to restaurants
      </Link>
    </main>
  );
}
