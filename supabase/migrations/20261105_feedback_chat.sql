-- Temporary feedback chat for bug reports and improvement ideas.
create table if not exists public.feedback (
  id         text primary key,
  user_id    text,
  source     text not null default 'web',
  path       text,
  message    text not null,
  meta       jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_created on public.feedback (created_at desc);

alter table public.feedback enable row level security;
