-- User activity log: every trackable action on the site (sign in/out, view product, add to cart, place order, etc.)
-- Run after 002_admin_gaps.sql.

create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists user_activity_user_id on public.user_activity(user_id);
create index if not exists user_activity_created_at on public.user_activity(created_at desc);
create index if not exists user_activity_event_type on public.user_activity(event_type);

alter table public.user_activity enable row level security;

-- Users can insert their own activity (frontend will send with auth token)
create policy "Users can insert own activity" on public.user_activity for insert with check (auth.uid() = user_id);
-- Users can read own activity (optional; admin reads via service role)
create policy "Users can read own activity" on public.user_activity for select using (auth.uid() = user_id);
-- No update/delete; admin uses service role to read all
