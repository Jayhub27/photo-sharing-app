-- Selling: owners can put a price on a collection and buyers pay with Stripe.

alter table public.collections add column if not exists price_cents integer;
alter table public.collections add column if not exists currency text not null default 'usd';

alter table public.users add column if not exists stripe_account_id text;

create table if not exists public.purchases (
  id                   text primary key,
  collection_id        text not null,
  buyer_user_id        text,
  buyer_email          text,
  amount_cents         integer not null,
  currency             text not null default 'usd',
  status               text not null default 'pending',
  stripe_session_id    text unique,
  stripe_payment_intent text,
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);

create index if not exists idx_purchases_collection on public.purchases (collection_id);
create index if not exists idx_purchases_buyer on public.purchases (buyer_user_id);

alter table public.purchases enable row level security;
