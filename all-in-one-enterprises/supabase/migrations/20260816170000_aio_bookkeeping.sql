-- All In One — Bookkeeping subscriptions & complexity profiles (Refinement 04)
-- Apply to dedicated All In One Supabase project.

create table if not exists public.aio_bookkeeping_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  customer_id uuid references public.aio_customers(id) on delete set null,
  plan text not null check (plan in ('ESSENTIALS', 'PLUS', 'ALL_IN_ONE')),
  billing_interval text not null check (billing_interval in ('MONTHLY', 'ANNUAL')),
  base_price_cents bigint not null,
  final_price_cents bigint,
  currency text not null default 'USD',
  status text not null default 'recommended',
  books_rescue_required boolean not null default false,
  complexity_profile jsonb default '{}'::jsonb,
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  reviewer_staff_user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  renewal_date timestamptz,
  cancel_at timestamptz,
  current_period_label text,
  cycle_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_books_rescue_engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  status text not null default 'assessment',
  months_behind text,
  account_count integer,
  transaction_complexity text,
  accounting_software text,
  quote_cents bigint,
  recommended_plan_after text check (recommended_plan_after is null or recommended_plan_after in ('ESSENTIALS', 'PLUS', 'ALL_IN_ONE')),
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_bookkeeping_cycles (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.aio_bookkeeping_subscriptions(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  period_label text not null,
  status text not null default 'period_open',
  due_date date,
  reports_delivered_at timestamptz,
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_bookkeeping_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  subscription_id uuid not null references public.aio_bookkeeping_subscriptions(id) on delete cascade,
  period_label text not null,
  report_type text not null,
  plan text not null,
  prepared_for text,
  document_id uuid,
  status text not null default 'draft',
  generated_at timestamptz not null default now()
);

create index if not exists idx_aio_bookkeeping_subscriptions_org on public.aio_bookkeeping_subscriptions(organization_id);
create index if not exists idx_aio_bookkeeping_cycles_sub on public.aio_bookkeeping_cycles(subscription_id);
create index if not exists idx_aio_books_rescue_org on public.aio_books_rescue_engagements(organization_id);

alter table public.aio_bookkeeping_subscriptions enable row level security;
alter table public.aio_books_rescue_engagements enable row level security;
alter table public.aio_bookkeeping_cycles enable row level security;
alter table public.aio_bookkeeping_reports enable row level security;
