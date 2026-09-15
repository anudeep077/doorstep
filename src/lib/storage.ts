// localStorage stands in for the profiles/addresses tables until the auth
// phase; the shapes stored here match those rows so the swap is a one-file
// change. Every access is guarded — storage can throw in private windows.

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota/private mode — the preference just won't survive a reload.
  }
}

// True once any client component has mounted. Hooks that hydrate from
// localStorage must start from a server-safe default during the *first*
// hydration (or React reports a mismatch), but on every later mount — e.g.
// navigating back to the feed — they can read storage synchronously and skip
// the skeleton frame that otherwise flashes before the real content.
let clientMounted = false;
export function isClientMounted() {
  return clientMounted;
}
export function markClientMounted() {
  clientMounted = true;
}
