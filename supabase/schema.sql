-- Food delivery app — database schema (Phase 1: customer homepage)
-- Run this in the Supabase SQL editor on a fresh project, then run seed.sql.
--
-- Tables:
--   restaurants   public catalogue, read by anyone
--   menu_items    dishes per restaurant; the card image on the homepage is the
--                 restaurant's featured dish, so "cover" data lives here
--   profiles      one row per auth user; holds the persisted veg preference
--   addresses     saved delivery addresses, many per user
--
-- Nothing on the homepage writes to the DB yet (no auth in this phase), so
-- profiles/addresses are here for shape and RLS — the client mirrors them in
-- localStorage until the auth phase lands.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Veg preference. Three states rather than a boolean because "veg mode on"
-- has two distinct behaviours the user chooses between in the confirm modal.
-- ---------------------------------------------------------------------------
create type public.veg_preference as enum (
  'off',              -- veg mode off, feed unfiltered
  'veg_restaurants',  -- only is_veg_only restaurants are shown
  'veg_dishes'        -- all restaurants shown, featured dish swapped for a veg one
);

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cuisine_tags text[] not null default '{}',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  -- Stored as a range ("25–35 min") rather than a single number so the
  -- estimate can later be adjusted per address without changing the shape.
  delivery_min_minutes smallint not null check (delivery_min_minutes > 0),
  delivery_max_minutes smallint not null check (delivery_max_minutes >= delivery_min_minutes),
  is_veg_only boolean not null default false,
  -- Neighbourhood label shown on the card; lat/lng reserved for distance-based
  -- delivery estimates and radius filtering in a later phase.
  area text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index restaurants_active_idx on public.restaurants (is_active) where is_active;

alter table public.restaurants enable row level security;

create policy "restaurants: public read" on public.restaurants
  for select using (is_active);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text,
  -- Minor units (paise/cents) as an integer: no float rounding in totals when
  -- the cart phase arrives.
  price_minor integer not null check (price_minor >= 0),
  currency char(3) not null default 'INR',
  is_veg boolean not null,
  -- Manually flagged. A restaurant can flag several; the feed picks the
  -- lowest sort_order featured item (or the lowest featured *veg* item in
  -- veg-dishes mode). Not computed from orders — there are none yet.
  is_featured boolean not null default false,
  sort_order smallint not null default 0,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index menu_items_restaurant_idx on public.menu_items (restaurant_id, sort_order);
create index menu_items_featured_idx on public.menu_items (restaurant_id) where is_featured;

alter table public.menu_items enable row level security;

create policy "menu_items: public read" on public.menu_items
  for select using (is_available);

-- ---------------------------------------------------------------------------
-- profiles: one row per user, keyed by auth.users.id
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  -- Persisted so the confirmation modal doesn't reappear every session.
  veg_preference public.veg_preference not null default 'off',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- addresses: many per user (home / work / other)
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'other' check (label in ('home', 'work', 'other')),
  -- What we show in "Deliver to: …" — the short, human form.
  short_label text not null,
  -- Full formatted line from the geocoder (or what the user typed).
  formatted text not null,
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id);
-- At most one default address per user.
create unique index addresses_one_default_idx
  on public.addresses (user_id) where is_default;

alter table public.addresses enable row level security;

create policy "addresses: all own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- orders / order_items (Phase 2: checkout)
-- Prices are copied onto the order at placement so history survives menu
-- edits. Until auth lands the client mirrors this shape in localStorage.
-- ---------------------------------------------------------------------------
create type public.order_status as enum ('placed', 'preparing', 'on_the_way', 'delivered', 'cancelled');
create type public.payment_method as enum ('cod', 'upi', 'card');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Short human id shown to the customer / rider ("DS-4K7Q2M").
  code text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id),
  address_id uuid references public.addresses (id) on delete set null,
  -- Frozen copy of the address as it was at checkout.
  address_snapshot jsonb not null,
  status public.order_status not null default 'placed',
  payment_method public.payment_method not null,
  item_total_minor integer not null check (item_total_minor >= 0),
  delivery_fee_minor integer not null check (delivery_fee_minor >= 0),
  platform_fee_minor integer not null check (platform_fee_minor >= 0),
  tax_minor integer not null check (tax_minor >= 0),
  total_minor integer not null check (total_minor >= 0),
  currency char(3) not null default 'INR',
  eta_min_minutes smallint,
  eta_max_minutes smallint,
  placed_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, placed_at desc);

alter table public.orders enable row level security;

create policy "orders: read own" on public.orders
  for select using (auth.uid() = user_id);
create policy "orders: insert own" on public.orders
  for insert with check (auth.uid() = user_id);
-- Status changes come from the restaurant/rider apps (later phases) via
-- service role, not from the customer — so no customer update policy.

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name text not null,
  price_minor integer not null check (price_minor >= 0),
  qty smallint not null check (qty > 0),
  is_veg boolean not null
);

create index order_items_order_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items: read own" on public.order_items
  for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items: insert own" on public.order_items
  for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
