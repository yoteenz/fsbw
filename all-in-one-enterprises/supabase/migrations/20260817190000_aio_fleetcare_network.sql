-- All In One Enterprises Inc. — FleetCare Network domain
-- Apply ONLY to dedicated All In One Supabase project (NOT Frontal Slayer hyycomvcaqxxvyrfupes).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.aio_fleetcare_ticket_status as enum (
    'draft', 'submitted', 'searching', 'matched', 'provider_reviewing',
    'provider_accepted', 'provider_declined', 'awaiting_estimate', 'estimate_sent',
    'awaiting_customer_authorization', 'authorized', 'scheduled', 'in_service',
    'awaiting_parts', 'on_hold', 'completed', 'customer_confirmed', 'cancelled',
    'disputed', 'closed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_urgency as enum (
    'routine', 'soon', 'today', 'roadside_urgent'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_drivable_status as enum ('yes', 'no', 'unknown');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_lead_source as enum (
    'aio_marketplace', 'provider_direct', 'preexisting_relationship', 'manual_assignment'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_provider_verification as enum (
    'unverified', 'pending_review', 'aio_verified', 'suspended',
    'expired_documents_required', 'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_fee_status as enum (
    'pending', 'calculated', 'invoiced', 'paid', 'waived', 'disputed', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_fleetcare_relationship_review as enum (
    'declared', 'pending_review', 'approved', 'rejected', 'disputed'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Network configuration (centralized pricing / policy — not hardcoded in UI)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleetcare_network_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Service taxonomy
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleetcare_service_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  enabled boolean not null default false,
  requires_verification boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Fleet vehicles (client org scoped)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  unit_number text,
  vin text,
  year integer,
  make text,
  model text,
  license_plate text,
  vehicle_type text not null default 'power_unit',
  current_mileage integer,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aio_fleet_vehicles_org on public.aio_fleet_vehicles(organization_id);

-- ---------------------------------------------------------------------------
-- Service providers (independent repair businesses)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_service_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete set null,
  business_name text not null,
  provider_type text not null default 'repair_shop',
  verification_status public.aio_fleetcare_provider_verification not null default 'unverified',
  provider_tier text not null default 'founding',
  phone text,
  email text,
  website text,
  mobile_service_available boolean not null default false,
  shop_service_available boolean not null default true,
  emergency_available boolean not null default false,
  profile jsonb not null default '{}'::jsonb,
  agreement_version text,
  agreement_accepted_at timestamptz,
  agreement_accepted_by uuid references auth.users(id) on delete set null,
  application_status text not null default 'application_started',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_service_provider_locations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  label text not null default 'Primary',
  address_line1 text,
  address_line2 text,
  city text,
  state_code text,
  postal_code text,
  country_code text not null default 'US',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_service_provider_users (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (provider_id, user_id)
);

create table if not exists public.aio_service_provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  category_code text not null references public.aio_fleetcare_service_categories(code) on delete restrict,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider_id, category_code)
);

create table if not exists public.aio_service_provider_service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  area_type text not null default 'radius',
  center_latitude numeric(10, 7),
  center_longitude numeric(10, 7),
  radius_miles numeric(8, 2),
  state_code text,
  city text,
  postal_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_service_provider_credentials (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  credential_type text not null,
  issuing_authority text,
  jurisdiction text,
  credential_number text,
  issue_date date,
  expiration_date date,
  verification_status text not null default 'pending',
  document_id uuid references public.aio_documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_service_provider_insurance (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  coverage_type text not null,
  insurer text,
  policy_number text,
  effective_date date,
  expiration_date date,
  coverage_limit_minor bigint,
  verification_status text not null default 'pending',
  document_id uuid references public.aio_documents(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_provider_subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  plan_code text not null,
  location_id uuid references public.aio_service_provider_locations(id) on delete set null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.aio_fleetcare_client_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  plan_code text not null,
  status text not null default 'active',
  per_vehicle_count integer,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Pre-existing customer relationships
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleetcare_preexisting_relationships (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  client_organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  relationship_declared_at timestamptz not null default now(),
  relationship_start_date date,
  evidence_notes text,
  review_status public.aio_fleetcare_relationship_review not null default 'declared',
  approved_by uuid references auth.users(id) on delete set null,
  dispute_status text,
  created_at timestamptz not null default now(),
  unique (provider_id, client_organization_id)
);

-- ---------------------------------------------------------------------------
-- Maintenance tickets & workflow
-- ---------------------------------------------------------------------------
create sequence if not exists aio_fleetcare_ticket_number_seq;

create or replace function public.aio_next_fleetcare_ticket_number()
returns text language plpgsql as $$
declare n bigint;
begin
  n := nextval('public.aio_fleetcare_ticket_number_seq');
  return 'FC-' || lpad(n::text, 6, '0');
end;
$$;

create table if not exists public.aio_fleetcare_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default public.aio_next_fleetcare_ticket_number(),
  client_organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  requester_user_id uuid references auth.users(id) on delete set null,
  vehicle_id uuid references public.aio_fleet_vehicles(id) on delete set null,
  service_category_code text references public.aio_fleetcare_service_categories(code) on delete set null,
  issue_description text not null,
  drivable_status public.aio_fleetcare_drivable_status not null default 'unknown',
  location jsonb not null default '{}'::jsonb,
  urgency public.aio_fleetcare_urgency not null default 'routine',
  status public.aio_fleetcare_ticket_status not null default 'draft',
  provider_id uuid references public.aio_service_providers(id) on delete set null,
  assigned_at timestamptz,
  lead_source public.aio_fleetcare_lead_source not null default 'aio_marketplace',
  aio_originated boolean not null default true,
  preexisting_relationship_id uuid references public.aio_fleetcare_preexisting_relationships(id) on delete set null,
  estimate_status text,
  authorization_status text,
  repair_status text,
  referral_status text,
  customer_contact_released boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete cascade,
  event_type text not null,
  from_status public.aio_fleetcare_ticket_status,
  to_status public.aio_fleetcare_ticket_status,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'system',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_ticket_matches (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  match_score numeric(8, 4),
  match_reason jsonb not null default '{}'::jsonb,
  eligible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (ticket_id, provider_id)
);

create table if not exists public.aio_fleetcare_ticket_assignments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assignment_type text not null default 'acceptance',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Estimates & authorization
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleetcare_estimates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  version integer not null default 1,
  status text not null default 'draft',
  subtotal_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  total_minor bigint not null default 0,
  currency text not null default 'USD',
  notes text,
  expires_at timestamptz,
  is_change_order boolean not null default false,
  parent_estimate_id uuid references public.aio_fleetcare_estimates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.aio_fleetcare_estimates(id) on delete cascade,
  line_type text not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_amount_minor bigint not null default 0,
  total_minor bigint not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.aio_fleetcare_customer_authorizations (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete cascade,
  estimate_id uuid not null references public.aio_fleetcare_estimates(id) on delete cascade,
  authorized_by uuid references auth.users(id) on delete set null,
  decision text not null,
  authorized_amount_minor bigint,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Jobs, records, referrals
-- ---------------------------------------------------------------------------
create table if not exists public.aio_fleetcare_service_jobs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.aio_fleetcare_tickets(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete restrict,
  status text not null default 'scheduled',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  final_amount_minor bigint,
  mileage_at_service integer,
  work_summary text,
  warranty_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_repair_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.aio_fleetcare_service_jobs(id) on delete cascade,
  vehicle_id uuid references public.aio_fleet_vehicles(id) on delete set null,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete restrict,
  service_category_code text,
  summary text not null,
  mileage_at_service integer,
  completed_at timestamptz not null,
  document_ids uuid[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_referral_transactions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.aio_fleetcare_tickets(id) on delete restrict,
  job_id uuid references public.aio_fleetcare_service_jobs(id) on delete set null,
  provider_id uuid not null references public.aio_service_providers(id) on delete restrict,
  client_organization_id uuid not null references public.aio_organizations(id) on delete restrict,
  lead_source public.aio_fleetcare_lead_source not null,
  aio_originated boolean not null default true,
  preexisting_relationship boolean not null default false,
  gross_service_value_minor bigint not null default 0,
  fee_type text not null default 'marketplace_referral',
  fee_rate numeric(8, 6),
  fee_amount_minor bigint not null default 0,
  fee_status public.aio_fleetcare_fee_status not null default 'pending',
  invoice_id uuid references public.aio_invoices(id) on delete set null,
  payment_status text,
  earned_at timestamptz,
  paid_at timestamptz,
  dispute_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_provider_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.aio_fleetcare_service_jobs(id) on delete cascade,
  client_organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  provider_id uuid not null references public.aio_service_providers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text,
  moderation_state text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_fleetcare_disputes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.aio_fleetcare_tickets(id) on delete set null,
  job_id uuid references public.aio_fleetcare_service_jobs(id) on delete set null,
  opened_by_type text not null,
  opened_by_id uuid,
  dispute_type text not null,
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS helper: provider users
-- ---------------------------------------------------------------------------
create or replace function public.aio_user_provider_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select provider_id from public.aio_service_provider_users
  where user_id = auth.uid() and status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.aio_fleetcare_network_settings enable row level security;
alter table public.aio_fleetcare_service_categories enable row level security;
alter table public.aio_fleet_vehicles enable row level security;
alter table public.aio_service_providers enable row level security;
alter table public.aio_service_provider_locations enable row level security;
alter table public.aio_service_provider_users enable row level security;
alter table public.aio_service_provider_services enable row level security;
alter table public.aio_service_provider_service_areas enable row level security;
alter table public.aio_service_provider_credentials enable row level security;
alter table public.aio_service_provider_insurance enable row level security;
alter table public.aio_fleetcare_provider_subscriptions enable row level security;
alter table public.aio_fleetcare_client_subscriptions enable row level security;
alter table public.aio_fleetcare_preexisting_relationships enable row level security;
alter table public.aio_fleetcare_tickets enable row level security;
alter table public.aio_fleetcare_ticket_events enable row level security;
alter table public.aio_fleetcare_ticket_matches enable row level security;
alter table public.aio_fleetcare_ticket_assignments enable row level security;
alter table public.aio_fleetcare_estimates enable row level security;
alter table public.aio_fleetcare_estimate_line_items enable row level security;
alter table public.aio_fleetcare_customer_authorizations enable row level security;
alter table public.aio_fleetcare_service_jobs enable row level security;
alter table public.aio_fleetcare_repair_records enable row level security;
alter table public.aio_fleetcare_referral_transactions enable row level security;
alter table public.aio_fleetcare_provider_reviews enable row level security;
alter table public.aio_fleetcare_disputes enable row level security;

-- Public read: enabled service categories
create policy aio_fleetcare_categories_read on public.aio_fleetcare_service_categories
  for select using (enabled = true or public.aio_is_internal_user());

-- Client org fleet vehicles
create policy aio_fleet_vehicles_org on public.aio_fleet_vehicles for all
  using (organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user())
  with check (organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user());

-- Tickets: client org members + assigned provider + internal
create policy aio_fleetcare_tickets_access on public.aio_fleetcare_tickets for select
  using (
    client_organization_id in (select public.aio_user_org_ids())
    or provider_id in (select public.aio_user_provider_ids())
    or public.aio_is_internal_user()
  );

create policy aio_fleetcare_tickets_client_write on public.aio_fleetcare_tickets for insert
  with check (client_organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user());

create policy aio_fleetcare_tickets_update on public.aio_fleetcare_tickets for update
  using (
    client_organization_id in (select public.aio_user_org_ids())
    or provider_id in (select public.aio_user_provider_ids())
    or public.aio_is_internal_user()
  );

-- Providers: own org + internal read for office
create policy aio_service_providers_read on public.aio_service_providers for select
  using (id in (select public.aio_user_provider_ids()) or public.aio_is_internal_user() or active = true);

create policy aio_service_providers_staff on public.aio_service_providers for all
  using (public.aio_is_internal_user()) with check (public.aio_is_internal_user());

create policy aio_service_provider_users_self on public.aio_service_provider_users for select
  using (user_id = auth.uid() or public.aio_is_internal_user());

-- Referral transactions: provider + internal
create policy aio_fleetcare_referrals_read on public.aio_fleetcare_referral_transactions for select
  using (
    provider_id in (select public.aio_user_provider_ids())
    or client_organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

-- Seed service taxonomy (disabled by default except approved MVP set)
insert into public.aio_fleetcare_service_categories (code, label, enabled, sort_order) values
  ('preventive_maintenance', 'Preventive Maintenance', true, 10),
  ('diagnostics', 'Diagnostics', true, 20),
  ('engine_repair', 'Engine Repair', true, 30),
  ('brakes', 'Brakes', true, 40),
  ('electrical', 'Electrical', true, 50),
  ('tires', 'Tires', true, 60),
  ('truck_repair', 'Truck Repair', true, 70),
  ('trailer_repair', 'Trailer Repair', true, 80),
  ('mobile_diesel_repair', 'Mobile Diesel Repair', true, 90),
  ('roadside_assistance', 'Roadside Assistance', false, 100),
  ('towing', 'Towing', false, 110),
  ('reefer_repair', 'Reefer Repair', false, 120),
  ('welding', 'Welding', false, 130),
  ('dot_inspection_support', 'DOT Inspection Support', false, 140),
  ('truck_wash', 'Truck Wash / Detailing', false, 150)
on conflict (code) do nothing;

-- Default network settings (configurable — not legal conclusions)
insert into public.aio_fleetcare_network_settings (key, value, description) values
  ('marketplace_fee_rate', '{"rate": 0.10, "label": "Marketplace referral fee"}', 'Configurable fee rate for AIO-originated completed jobs'),
  ('lead_attribution_window_days', '{"days": null}', 'Future non-circumvention window — null until legal review'),
  ('fee_earned_policy', '{"policy": "completed_confirmed_service"}', 'When referral fee is earned'),
  ('founding_provider_plan', '{"plan_code": "founding", "monthly_minor": 0, "fee_rate": 0.10}', 'Founding provider launch model'),
  ('client_plans', '{"free": {"code": "fleetcare_free", "monthly_minor": 0}, "plus": {"code": "fleetcare_plus", "monthly_minor": 1900}, "pro": {"code": "fleetcare_pro", "monthly_minor": 3900, "per_vehicle_minor": 500}}', 'Target client subscription pricing — configurable'),
  ('provider_plans', '{"standard": {"code": "fleetcare_provider", "monthly_minor": 4900, "fee_rate": 0.10}, "pro": {"code": "fleetcare_provider_pro", "monthly_minor": 9900, "fee_rate": 0.10}}', 'Target provider subscription pricing — configurable'),
  ('legal_disclosures', '{"independent_provider": "Repair services are performed by independent FleetCare network providers.", "referral_economic": "AIO may receive platform or referral fees from providers for work originated through the FleetCare Network."}', 'Configurable disclosure copy — legal review required')
on conflict (key) do nothing;
