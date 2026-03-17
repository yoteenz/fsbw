-- Deleted accounts: store when a user deletes their account so admin can see them from any browser.
-- No FK to auth.users so we can keep the row after the user is removed from Auth.

create table if not exists public.deleted_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  first_name text,
  last_name text,
  deleted_at timestamptz not null default now(),
  deleted_from text,
  payload jsonb
);

create index if not exists deleted_accounts_deleted_at_idx on public.deleted_accounts(deleted_at desc);

alter table public.deleted_accounts enable row level security;

-- Only service role can read/write (API uses service role for admin list and delete-account insert)
create policy "Service role only via API" on public.deleted_accounts for all using (false);
