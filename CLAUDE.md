# Doorstep — food delivery app

Learning/portfolio project — a Swiggy/Zomato-style customer app. Optimised for demonstrating full-stack skills, not market fit. No real restaurants are scraped; the catalogue is hand-seeded mock data.

Stack: Next.js App Router + TypeScript, Tailwind v4, Supabase (Postgres, later auth via `@supabase/ssr`). Same conventions as Momentum and traackerr.

## Status

**Phase 1 — customer homepage (done):** geolocation → reverse-geocoded address with manual fallback, veg-mode toggle with confirm modals and full-screen splash, search over restaurants + dishes, restaurant feed fronted by each restaurant's featured dish, account sheet (signed-out shell).

**Phase 2 — menu, cart, checkout (done, no real payments):** `/restaurant/[slug]` with collapsing header and ADD/stepper on every dish; one-restaurant cart (`src/lib/cart.tsx`, localStorage) with a bottom bar; `/checkout` (address, items, bill with mock fee rules in `src/lib/orders.ts`, cash-on-delivery only); `/order/[id]` confirmation with a *simulated* status timeline; `/orders` history; `/track/[id]` live map (Leaflet + OSM tiles) with a *simulated* rider position — reachable from the scooter badge beside the address chip while an order is active.

**Phase 3 — auth (sign-in only, in progress):** Supabase Auth via `src/lib/use-user.ts` + `sign-in-sheet.tsx` (Google OAuth → `/auth/callback`; email and phone one-time codes). `src/proxy.ts` only refreshes the session cookie — every screen still works signed-out. A `profiles` row is upserted on first sign-in. **Not yet done:** moving cart/orders/addresses/veg preference from localStorage to Supabase for signed-in users.

Later phases (not started): that data sync, real payment gateway (`src/lib/payments.ts` `mockCharge` is the seam), restaurant dashboard, rider app.

## Layout

- `supabase/schema.sql` — tables + RLS. `supabase/seed.sql` is **generated** from `src/data/seed.json` by `node scripts/generate-seed-sql.mjs`; edit the JSON, not the SQL.
- `src/lib/restaurants.ts` — server-side loader; falls back to the bundled seed when `.env.local` has no Supabase credentials, so a fresh clone runs with zero setup.
- `src/lib/feed.ts` — pure veg-mode + search rules (no React). Change filtering behaviour here.
- `src/lib/use-veg-preference.ts`, `src/lib/use-address.ts` — client state, persisted to localStorage in the shapes of `profiles.veg_preference` / `addresses` so the auth phase swaps storage without touching components.
- `src/app/api/geocode/route.ts` — Nominatim proxy (reverse + forward). Swap providers here.
- `src/components/home-feed.tsx` — composes the homepage; `page.tsx` is a thin server component.
- `src/lib/storage.ts` — localStorage helpers plus `isClientMounted()`: hooks that hydrate from storage start server-safe only on the *first* hydration and read synchronously on later mounts (avoids skeleton flashes on back navigation).
- `src/lib/scroller.ts` — the app scrolls inside a phone-width container (`#app-scroll` in layout.tsx), not the window. Read/set scroll through this helper; never `window.scrollY`. `ScrollReset` scrolls to top on route change.
- `src/lib/scroll-memory.ts` + `back-to-home.tsx` — feed scroll position survives the restaurant round-trip.

## Setup

Copy `.env.local.example` to `.env.local` with real credentials, run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL editor, then `npm run dev`. Without credentials the app shows a banner and serves seed data.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
