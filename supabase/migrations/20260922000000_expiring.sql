-- Time-limited collections: auto-delete after a deadline.

alter table public.collections add column if not exists expires_at timestamptz;

create index if not exists idx_collections_expires
  on public.collections (expires_at)
  where expires_at is not null;
