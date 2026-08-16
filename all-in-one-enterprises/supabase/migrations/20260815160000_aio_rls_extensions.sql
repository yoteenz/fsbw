-- All In One — Extended RLS (staff permission helpers, insurance, appointments)
-- Apply ONLY to dedicated All In One Supabase project.

-- Insurance domain tables
create table if not exists public.aio_insurance_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  case_number text not null,
  status text not null default 'intake',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_insurance_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.aio_insurance_cases(id) on delete cascade,
  event_type text not null,
  visibility text not null default 'internal',
  created_at timestamptz not null default now()
);

-- Appointments
create table if not exists public.aio_appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  appointment_type text not null,
  status text not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Load stops (multi-stop)
create table if not exists public.aio_load_stops (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  stop_type text not null check (stop_type in ('PICKUP', 'DELIVERY', 'OTHER')),
  sequence_number integer not null,
  location text not null,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_load_status_history (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.aio_insurance_cases enable row level security;
alter table public.aio_insurance_events enable row level security;
alter table public.aio_appointments enable row level security;
alter table public.aio_load_stops enable row level security;
alter table public.aio_load_status_history enable row level security;

create policy aio_insurance_org on public.aio_insurance_cases for select using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);
create policy aio_insurance_staff on public.aio_insurance_cases for all using (public.aio_is_internal_user());

create policy aio_insurance_events_staff on public.aio_insurance_events for all using (public.aio_is_internal_user());

create policy aio_appointments_org on public.aio_appointments for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_load_stops_org on public.aio_load_stops for all using (
  load_id in (
    select l.id from public.aio_dispatch_loads l
    where l.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

create policy aio_load_history_org on public.aio_load_status_history for all using (
  load_id in (
    select l.id from public.aio_dispatch_loads l
    where l.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

-- Customer-safe portal views
create or replace view public.aio_portal_service_request_view as
select
  sr.id,
  sr.organization_id,
  sr.request_number,
  sr.status,
  sr.workflow_step,
  sr.status_label,
  sr.created_at,
  sr.updated_at
from public.aio_service_requests sr;

create or replace view public.aio_portal_invoice_view as
select
  i.id,
  i.organization_id,
  i.invoice_number,
  i.service,
  i.amount,
  i.status,
  i.issued_at,
  i.due_at
from public.aio_invoices i;
