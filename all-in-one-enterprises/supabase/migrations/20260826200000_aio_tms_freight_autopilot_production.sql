-- AIO TMS Freight Autopilot production persistence
-- Apply ONLY to dedicated All In One Supabase project nnnljnhtmseagotvgxxt — NOT Frontal Slayer.

-- ---------------------------------------------------------------------------
-- Load document references (authoritative for completeness engine)
-- ---------------------------------------------------------------------------
alter table public.aio_dispatch_loads
  add column if not exists rate_confirmation_document_id uuid references public.aio_documents(id) on delete set null,
  add column if not exists bol_document_id uuid references public.aio_documents(id) on delete set null,
  add column if not exists pod_document_id uuid references public.aio_documents(id) on delete set null,
  add column if not exists primary_driver_id uuid,
  add column if not exists carrier_organization_id uuid references public.aio_organizations(id) on delete set null,
  add column if not exists factoring_handoff_status text default 'not_ready';

-- ---------------------------------------------------------------------------
-- Document completeness snapshot (reload-safe)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_freight_document_completeness (
  load_id uuid primary key references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  package_status text not null default 'incomplete'
    check (package_status in ('incomplete', 'complete', 'override')),
  requirements_json jsonb not null default '[]'::jsonb,
  missing_labels text[] not null default '{}',
  ready_for_billing boolean not null default false,
  ready_for_factoring boolean not null default false,
  ready_for_settlement boolean not null default false,
  override_reason text,
  override_staff_id uuid references auth.users(id) on delete set null,
  override_at timestamptz,
  computed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Freight Autopilot event ledger
-- ---------------------------------------------------------------------------
create table if not exists public.aio_freight_autopilot_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  event_type text not null,
  source text not null default 'system',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_label text,
  occurred_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'PENDING'
    check (processing_status in ('PENDING', 'PROCESSING', 'COMPLETED', 'BLOCKED', 'FAILED', 'IGNORED')),
  idempotency_key text not null,
  payload jsonb not null default '{}'::jsonb,
  outcome text,
  error_message text,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists aio_fae_load_idx on public.aio_freight_autopilot_events(load_id, occurred_at desc);
create index if not exists aio_fae_org_idx on public.aio_freight_autopilot_events(organization_id);

-- ---------------------------------------------------------------------------
-- Billing packages (one canonical package per load)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_freight_billing_packages (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  shipper_organization_id uuid references public.aio_organizations(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'missing_documents', 'ready', 'invoice_generated', 'factoring_routed', 'settlement_pending', 'bookkeeping_pending', 'closed')),
  receivable_route text not null default 'undecided'
    check (receivable_route in ('direct', 'factoring', 'undecided')),
  factoring_status text,
  receivable_status text,
  settlement_status text,
  bookkeeping_status text,
  shipper_invoice_id uuid references public.aio_brokerage_shipper_invoices(id) on delete set null,
  freight_invoice_id uuid,
  document_ids uuid[] not null default '{}',
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (load_id),
  unique (idempotency_key)
);

-- ---------------------------------------------------------------------------
-- Freight exceptions (persist across sessions)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_freight_exceptions (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  exception_type text not null,
  severity text not null check (severity in ('P0', 'P1', 'P2', 'P3')),
  status text not null default 'OPEN'
    check (status in ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
  summary text not null,
  details text,
  source_event_id uuid references public.aio_freight_autopilot_events(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution text
);

create unique index if not exists aio_freight_exceptions_open_unique
  on public.aio_freight_exceptions(load_id, exception_type)
  where status = 'OPEN';

create index if not exists aio_freight_exceptions_load_idx on public.aio_freight_exceptions(load_id, status);

-- ---------------------------------------------------------------------------
-- Driver settlements (separate from carrier)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_driver_settlements (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  driver_id text not null,
  compensation_model text not null,
  loaded_miles integer not null default 0,
  empty_miles integer not null default 0,
  base_compensation_minor bigint not null default 0,
  total_minor bigint not null default 0,
  currency text not null default 'USD',
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'CALCULATED', 'REVIEW_REQUIRED', 'APPROVED', 'PAID', 'VOID')),
  idempotency_key text not null,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idempotency_key)
);

create table if not exists public.aio_driver_settlement_adjustments (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.aio_driver_settlements(id) on delete cascade,
  adjustment_type text not null,
  amount_minor bigint not null,
  reason text not null,
  source text not null default 'system',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Carrier settlements / payables (brokerage carrier side)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_carrier_settlements (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  carrier_organization_id uuid references public.aio_organizations(id) on delete set null,
  carrier_network_profile_id uuid,
  agreed_carrier_rate_minor bigint not null default 0,
  approved_accessorials_minor bigint not null default 0,
  deductions_minor bigint not null default 0,
  total_payable_minor bigint not null default 0,
  currency text not null default 'USD',
  lifecycle_status text not null default 'PENDING_DOCUMENTS'
    check (lifecycle_status in ('PENDING_DOCUMENTS', 'READY_FOR_REVIEW', 'APPROVED', 'SCHEDULED', 'PAID', 'DISPUTED')),
  required_paperwork_complete boolean not null default false,
  idempotency_key text not null,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (load_id),
  unique (idempotency_key)
);

-- ---------------------------------------------------------------------------
-- Dispatch package snapshots (historical correctness)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_dispatch_package_snapshots (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  version_number integer not null default 1,
  package_json jsonb not null,
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id) on delete set null,
  unique (load_id, version_number)
);

-- ---------------------------------------------------------------------------
-- Pre-trip inspections
-- ---------------------------------------------------------------------------
create table if not exists public.aio_pretrip_inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  driver_id text not null,
  power_unit_id text,
  trailer_id text,
  load_id uuid references public.aio_dispatch_loads(id) on delete set null,
  inspection_result text not null
    check (inspection_result in ('PASS', 'DEFECT_REPORTED', 'OUT_OF_SERVICE', 'REVIEW_REQUIRED')),
  defect_summary text,
  odometer_miles integer,
  escalated_to_fleetcare boolean not null default false,
  fleetcare_ticket_id uuid references public.aio_fleetcare_tickets(id) on delete set null,
  idempotency_key text,
  inspected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists aio_pretrip_idempotency_unique
  on public.aio_pretrip_inspections(idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------------
-- Saved freight locations (shipper/receiver directory)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_freight_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  business_name text not null,
  address_line1 text not null,
  city text not null,
  state text not null,
  postal_code text,
  location_type text not null default 'both'
    check (location_type in ('shipper', 'receiver', 'both')),
  facility_type text,
  contact_name text,
  phone text,
  email text,
  driver_instructions text,
  internal_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aio_freight_locations_org_idx on public.aio_freight_locations(organization_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.aio_freight_document_completeness enable row level security;
alter table public.aio_freight_autopilot_events enable row level security;
alter table public.aio_freight_billing_packages enable row level security;
alter table public.aio_freight_exceptions enable row level security;
alter table public.aio_driver_settlements enable row level security;
alter table public.aio_driver_settlement_adjustments enable row level security;
alter table public.aio_carrier_settlements enable row level security;
alter table public.aio_dispatch_package_snapshots enable row level security;
alter table public.aio_pretrip_inspections enable row level security;
alter table public.aio_freight_locations enable row level security;

-- Staff full access
create policy aio_fdc_staff on public.aio_freight_document_completeness
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_fae_staff on public.aio_freight_autopilot_events
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_fbp_staff on public.aio_freight_billing_packages
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_fex_staff on public.aio_freight_exceptions
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_dset_staff on public.aio_driver_settlements
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_dset_adj_staff on public.aio_driver_settlement_adjustments
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_cset_staff on public.aio_carrier_settlements
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_dps_staff on public.aio_dispatch_package_snapshots
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_pretrip_staff on public.aio_pretrip_inspections
  for all using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_floc_org on public.aio_freight_locations
  for all using (
    organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
  ) with check (
    organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
  );

-- Carrier org: carrier settlement for their org only (no shipper invoice / margin)
create policy aio_cset_carrier_read on public.aio_carrier_settlements
  for select using (
    carrier_organization_id in (select public.aio_user_org_ids())
  );

-- Shipper: billing package + shipper invoice path (no carrier settlement detail)
create policy aio_fbp_shipper_read on public.aio_freight_billing_packages
  for select using (
    shipper_organization_id in (select public.aio_user_org_ids())
  );

create policy aio_fdc_carrier_org on public.aio_freight_document_completeness
  for select using (
    organization_id in (select public.aio_user_org_ids())
  );

-- Driver settlements: org-scoped read for carrier org members (not cross-org)
create policy aio_dset_org_read on public.aio_driver_settlements
  for select using (
    organization_id in (select public.aio_user_org_ids())
  );

-- Exceptions: org members can read their org exceptions
create policy aio_fex_org_read on public.aio_freight_exceptions
  for select using (
    organization_id in (select public.aio_user_org_ids())
  );

-- Autopilot events: org read for carrier client org on their loads
create policy aio_fae_org_read on public.aio_freight_autopilot_events
  for select using (
    organization_id in (select public.aio_user_org_ids())
  );

-- Shipper invoice already has RLS in 20260819150000 — billing package links to it

comment on table public.aio_freight_autopilot_events is 'Durable Freight Autopilot event ledger — idempotent by idempotency_key';
comment on table public.aio_freight_billing_packages is 'One canonical billing package per load — unique(load_id)';
comment on table public.aio_driver_settlements is 'Driver compensation — separate from aio_carrier_settlements';
