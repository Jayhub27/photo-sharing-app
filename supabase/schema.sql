-- PhotoShare schema for Supabase (Postgres)
-- Run this in the Supabase SQL editor. Also create a Storage bucket named "photos"
-- and keep it PRIVATE (the server proxies images via the service-role key).

create table if not exists users (
  id            text primary key,
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists sessions (
  token      text primary key,
  user_id    text not null,
  created_at timestamptz not null default now()
);

create table if not exists collections (
  id                  text primary key,
  user_id             text,
  name                text not null,
  is_public           boolean not null default true,
  cover_filename      text,
  cover_thumb_filename text,
  created_at          timestamptz not null default now()
);

create table if not exists photos (
  id            text primary key,
  collection_id text not null,
  filename      text not null,
  thumb_filename text,
  original_name text not null,
  mime_type     text not null,
  size          integer not null,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now()
);

create table if not exists collection_members (
  collection_id text not null,
  user_id       text not null,
  role          text not null default 'viewer',
  created_at    timestamptz not null default now(),
  primary key (collection_id, user_id)
);

create index if not exists idx_photos_collection on photos (collection_id);
create index if not exists idx_collections_user on collections (user_id);
create index if not exists idx_members_user on collection_members (user_id);
create index if not exists idx_members_collection on collection_members (collection_id);
create index if not exists idx_collections_name on collections (lower(name));

-- Aggregate photo counts in one query (avoids N+1 on the collections list).
create or replace function public.collection_photo_counts(ids text[])
returns table (collection_id text, cnt bigint)
language sql
stable
set search_path = ''
as $$
  select collection_id, count(*)::bigint as cnt
  from public.photos
  where collection_id = any(ids)
  group by collection_id;
$$;

-- Security: the API only ever connects with the service-role key, which bypasses
-- RLS. Enabling RLS with no policies denies the anon/authenticated roles entirely,
-- closing the tables off to the publishable key. Add policies only if you start
-- using the anon key directly from a client.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.collections enable row level security;
alter table public.photos enable row level security;
alter table public.collection_members enable row level security;

-- Keep the photo bucket private; the server streams images through /api/photos.
update storage.buckets set public = false where id = 'photos';

-- ------------------------------------------------------------------ selling
-- Owners can put a price on a collection. Null price_cents means the
-- collection is free. Purchases are created by the Stripe webhook (or by the
-- checkout return handler when no webhook secret is configured).

alter table public.collections add column if not exists price_cents integer;
alter table public.collections add column if not exists currency text not null default 'usd';

-- Optional Stripe Connect account for payouts. When set (and
-- STRIPE_APPLICATION_FEE_PERCENT is configured), checkout transfers the
-- owner's share to this account.
alter table public.users add column if not exists stripe_account_id text;

create table if not exists public.purchases (
  id                    text primary key,
  collection_id         text not null,
  buyer_user_id         text,
  buyer_email           text,
  amount_cents          integer not null,
  currency              text not null default 'usd',
  status                text not null default 'pending',
  stripe_session_id     text unique,
  stripe_payment_intent text,
  created_at            timestamptz not null default now(),
  paid_at               timestamptz
);

create index if not exists idx_purchases_collection on public.purchases (collection_id);
create index if not exists idx_purchases_buyer on public.purchases (buyer_user_id);

alter table public.purchases enable row level security;

-- ------------------------------------------------------------------ expiring
-- Collections can auto-delete after a deadline. The server sweeps hourly and
-- POST /api/maintenance/sweep lets any external cron trigger the same cleanup.
-- Deleting a collection also removes its purchases (buyers lose access), so the
-- UI warns before pricing a time-limited collection.

alter table public.collections add column if not exists expires_at timestamptz;

create index if not exists idx_collections_expires
  on public.collections (expires_at)
  where expires_at is not null;
