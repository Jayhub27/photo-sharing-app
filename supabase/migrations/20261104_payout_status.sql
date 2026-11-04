-- Where the money for a sale went: the seller's connected account or the platform.
alter table public.purchases add column if not exists payout_status text;
