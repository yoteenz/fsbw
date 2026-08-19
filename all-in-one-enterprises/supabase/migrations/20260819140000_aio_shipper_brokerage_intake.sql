-- AIO shipper freight request → brokerage intake (additive)
-- Aligns demo ShipmentRequest / BrokerageFreightQuote model for future Supabase repository adapter.
-- Apply to AIO Supabase project only (not FS Website).

create table if not exists public.aio_shipment_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null,
  shipper_organization_id text not null,
  status text not null default 'draft',
  pickup_city text not null,
  pickup_state text not null,
  pickup_zip text,
  pickup_date date not null,
  pickup_time_start time,
  pickup_time_end time,
  delivery_city text not null,
  delivery_state text not null,
  delivery_zip text,
  delivery_date date not null,
  delivery_time_start time,
  delivery_time_end time,
  equipment_type text not null,
  trailer_length_ft integer,
  full_partial text,
  commodity text,
  weight text,
  pallet_count integer,
  special_instructions text,
  reference_numbers text,
  assigned_broker_staff_id text,
  converted_load_id uuid,
  open_info_request_id uuid,
  priority text default 'normal',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create index if not exists idx_aio_shipment_requests_shipper on public.aio_shipment_requests (shipper_organization_id);
create index if not exists idx_aio_shipment_requests_status on public.aio_shipment_requests (status);

create table if not exists public.aio_brokerage_freight_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null,
  shipment_request_id uuid not null references public.aio_shipment_requests(id) on delete restrict,
  shipper_organization_id text not null,
  status text not null default 'draft',
  freight_charge_minor bigint not null,
  currency text not null default 'USD',
  current_revision integer not null default 1,
  expires_at timestamptz,
  prepared_by_staff_id text,
  accepted_revision_id uuid,
  converted_load_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table if not exists public.aio_brokerage_quote_revisions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.aio_brokerage_freight_quotes(id) on delete cascade,
  version integer not null,
  freight_charge_minor bigint not null,
  accessorial_notes text,
  expires_at timestamptz,
  prepared_by_staff_id text,
  created_at timestamptz not null default now(),
  unique (quote_id, version)
);

create table if not exists public.aio_brokerage_quote_pricing_drafts (
  quote_id uuid primary key references public.aio_brokerage_freight_quotes(id) on delete cascade,
  request_id uuid not null references public.aio_shipment_requests(id) on delete cascade,
  shipper_rate_minor bigint not null,
  target_carrier_rate_minor bigint not null,
  estimated_margin_minor bigint not null,
  estimated_margin_percent numeric(6,2),
  terms_note text,
  valid_until timestamptz
);

create table if not exists public.aio_brokerage_info_requests (
  id uuid primary key default gen_random_uuid(),
  shipment_request_id uuid not null references public.aio_shipment_requests(id) on delete cascade,
  missing_fields text[] not null default '{}',
  message text not null,
  status text not null default 'open',
  created_by_staff_id text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.aio_brokerage_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_type text not null,
  actor_id text,
  note text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_aio_brokerage_audit_entity on public.aio_brokerage_audit_events (entity_type, entity_id);

-- RLS: enable; policies to be aligned with organization scoping in repository sprint
alter table public.aio_shipment_requests enable row level security;
alter table public.aio_brokerage_freight_quotes enable row level security;
alter table public.aio_brokerage_quote_revisions enable row level security;
alter table public.aio_brokerage_quote_pricing_drafts enable row level security;
alter table public.aio_brokerage_info_requests enable row level security;
alter table public.aio_brokerage_audit_events enable row level security;
