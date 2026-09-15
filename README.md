# Doorstep — food delivery app

Portfolio project: a customer-facing food delivery app built with Next.js (App Router), Tailwind v4 and Supabase.

## Phase 1: homepage

- Asks for browser geolocation on load and reverse-geocodes it (OpenStreetMap Nominatim) into a "Deliver to" address. If permission is denied, an address sheet opens for manual entry with search suggestions and saved home/work/other addresses.
- **Veg mode** toggle with two flavours — *only veg restaurants* (hides everything that isn't 100% veg, with a full-screen splash) or *veg dishes only* (keeps every restaurant, swaps the featured dish for a veg one). Turning it off asks for confirmation. The choice is remembered.
- Search covers restaurant names, cuisine tags and dish names; a dish hit is shown as the card image so you can see why it matched.
- Each card leads with the restaurant's featured dish photo, then name, "Pure veg" badge, rating, delivery estimate and cuisines.

## Run it

```bash
npm install
npm run dev
```

That's enough — the app opens in **guest mode** with the bundled sample catalogue (`src/data/seed.json`). Every feature works signed-out; signing in is optional.

## Connecting Supabase

### 1. Project + keys
- Create a project at [supabase.com](https://supabase.com) → Project Settings → API.
- Copy `.env.local.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Restart `npm run dev`. The "sample data" banner disappears once these are set.

### 2. Database
In the SQL editor, run in order:
1. `supabase/schema.sql` — tables, RLS policies, enums.
2. `supabase/seed.sql` — the 16 sample restaurants (regenerate from `seed.json` with `node scripts/generate-seed-sql.mjs`).

### 3. Auth → URL configuration
- **Site URL:** `http://localhost:3000` (your production URL later).
- **Redirect URLs:** add `http://localhost:3000/auth/callback` and `http://localhost:3000/**` (and the production equivalents).

### 4. Sign-in providers (Authentication → Providers)
- **Google**
  1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an OAuth client (Web application).
  2. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback` (shown on the Google provider page in Supabase).
  3. Paste the client ID and secret into the Supabase Google provider and enable it.
- **Email (magic link)**
  - Works out of the box: the Email provider is on by default and the default template sends a sign-in link that returns to `/auth/callback`. Open the link on the same device/browser that requested it.
  - Supabase's built-in mailer is rate-limited (a few emails per hour). To raise that — or to switch to 6-digit codes by adding `{{ .Token }}` to the templates — set up custom SMTP (Resend/Brevo free tiers work) under Authentication → Emails.
- **Phone (SMS code)**
  - Enable the Phone provider and connect an SMS provider (Twilio, MessageBird, Vonage or Textlocal) with its credentials. Without one, phone sign-in will error — email and Google still work.
  - SMS template should contain `{{ .Code }}`.

### 5. Optional, later
- **Storage** bucket for real dish photos (replace the placeholder `image_url`s).
- Move guest data (cart, orders, addresses, veg preference) from localStorage into the `orders`, `addresses`, `profiles` tables for signed-in users — the tables and RLS are already in `schema.sql`.

## Data model

See [`supabase/schema.sql`](supabase/schema.sql): `restaurants`, `menu_items` (featured dishes are flagged manually — there's no order history yet), `profiles.veg_preference`, and `addresses` (many per user, one default).
