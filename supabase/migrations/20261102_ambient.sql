-- Ambient backgrounds: a tiny blurred derivative and four sampled colours.
-- Existing rows may stay null; the client falls back to the paper theme and the
-- server generates the derivative lazily on first request.

alter table public.photos
  add column if not exists ambient_filename text,
  add column if not exists ambient_colors jsonb;

alter table public.collections
  add column if not exists ambient_filename text,
  add column if not exists ambient_colors jsonb;
