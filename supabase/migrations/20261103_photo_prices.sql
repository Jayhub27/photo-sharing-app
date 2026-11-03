-- Optional individual-photo prices. The owner sets a price per photo; the
-- collection price remains the bundle price. Checkout for single photos is a
-- separate flow and can be enabled without another column change.

alter table public.photos
  add column if not exists price_cents integer;
