-- All In One — Idempotency, Outbox, Data Quality
-- Apply ONLY to dedicated All In One Supabase project.

create table if not exists public.aio_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  scope text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  request_hash text,
  status text not null default 'pending',
  response_reference text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (key, scope)
);

create table if not exists public.aio_outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  safe_payload jsonb default '{}'::jsonb,
  status text not null default 'pending',
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.aio_inbox_events (
  id uuid primary key default gen_random_uuid(),
  provider_code text not null,
  external_event_id text not null,
  status text not null default 'received',
  received_at timestamptz not null default now(),
  unique (provider_code, external_event_id)
);

create table if not exists public.aio_data_quality_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  domain text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_data_quality_issues (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.aio_data_quality_rules(id) on delete set null,
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  severity text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_record_holds (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

alter table public.aio_idempotency_keys enable row level security;
alter table public.aio_outbox_events enable row level security;
alter table public.aio_inbox_events enable row level security;
alter table public.aio_data_quality_rules enable row level security;
alter table public.aio_data_quality_issues enable row level security;
alter table public.aio_record_holds enable row level security;

create policy aio_idempotency_staff on public.aio_idempotency_keys for all using (public.aio_is_internal_user());
create policy aio_outbox_staff on public.aio_outbox_events for all using (public.aio_is_internal_user());
create policy aio_inbox_staff on public.aio_inbox_events for all using (public.aio_is_internal_user());
create policy aio_dq_staff on public.aio_data_quality_issues for all using (public.aio_is_internal_user());
create policy aio_dq_rules_read on public.aio_data_quality_rules for select using (public.aio_is_internal_user());
create policy aio_holds_staff on public.aio_record_holds for all using (public.aio_is_internal_user());
