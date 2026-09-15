export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md animate-pulse space-y-4 px-4 pt-3">
      <div className="h-9 w-32 rounded-full bg-line" />
      <div className="h-32 rounded-3xl bg-line" />
      <div className="aspect-[3/2] rounded-3xl bg-line" />
      <div className="aspect-[3/2] rounded-3xl bg-line" />
    </main>
  );
}
