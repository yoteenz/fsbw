-- Admin gaps: reviews, meetings, audit_log, referral_earnings.
-- Run after 001_initial_schema.sql.

-- Reviews: store client reviews (admin can list/approve; clients submit via app later)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  client_name text,
  rating integer not null check (rating >= 1 and rating <= 5),
  product text,
  review text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  photos jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists reviews_user_id on public.reviews(user_id);
create index if not exists reviews_status on public.reviews(status);
create index if not exists reviews_created_at on public.reviews(created_at desc);

alter table public.reviews enable row level security;

create policy "Users can read own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users can insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
-- Admin will use service role to manage all reviews

-- Meetings / appointments
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  client_email text,
  client_name text,
  meeting_date date not null,
  meeting_time time,
  type text not null default 'Consultation',
  duration_minutes integer default 60,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists meetings_user_id on public.meetings(user_id);
create index if not exists meetings_date on public.meetings(meeting_date);
create index if not exists meetings_status on public.meetings(status);

alter table public.meetings enable row level security;

create policy "Users can read own meetings" on public.meetings for select using (auth.uid() = user_id);
create policy "Users can insert own meetings" on public.meetings for insert with check (auth.uid() = user_id);
create policy "Users can update own meetings" on public.meetings for update using (auth.uid() = user_id);
create policy "Users can delete own meetings" on public.meetings for delete using (auth.uid() = user_id);

-- Audit log: who did what, when (admin only reads; APIs write)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists audit_log_created_at on public.audit_log(created_at desc);
create index if not exists audit_log_resource on public.audit_log(resource_type, resource_id);

alter table public.audit_log enable row level security;
-- No policies: only service role (bypasses RLS) can read/write. Authenticated users cannot access.

-- Referral earnings: track referrer/referred and amounts
create table if not exists public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  referrer_email text not null,
  referred_email text not null,
  order_id text,
  order_number text,
  amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid')),
  created_at timestamptz default now()
);

create index if not exists referral_earnings_referrer on public.referral_earnings(referrer_email);
create index if not exists referral_earnings_status on public.referral_earnings(status);

alter table public.referral_earnings enable row level security;
-- No policies: only service role can access (admin APIs).
