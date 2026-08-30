-- PhotoShare schema for Supabase (Postgres)
-- Run this in the Supabase SQL editor, then create a Storage bucket named "photos" (public).

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
  id          text primary key,
  user_id     text,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists photos (
  id            text primary key,
  collection_id text not null,
  filename      text not null,
  original_name text not null,
  mime_type     text not null,
  size          integer not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_photos_collection on photos (collection_id);
create index if not exists idx_collections_user on collections (user_id);

-- Storage: create a public bucket called "photos" (Supabase dashboard -> Storage -> New bucket).
