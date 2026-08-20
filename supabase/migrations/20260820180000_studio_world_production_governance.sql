-- Studio World — Multi-tenant organization, entitlement & production cost architecture

-- ─── Organizations ───────────────────────────────────────────────────────────

create table if not exists public.studio_world_organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  organization_type text not null default 'OWNER',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_organizations_slug_unique unique (slug)
);

create index if not exists studio_world_organizations_type_idx
  on public.studio_world_organizations (organization_type, status);

-- ─── Organization memberships ────────────────────────────────────────────────

create table if not exists public.studio_world_organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  user_email text not null,
  role text not null,
  status text not null default 'active',
  invited_by text,
  joined_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_org_memberships_unique unique (organization_id, user_email)
);

create index if not exists studio_world_org_memberships_user_idx
  on public.studio_world_organization_memberships (user_email, status);

-- ─── Agency clients ────────────────────────────────────────────────────────────

create table if not exists public.studio_world_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  client_key text not null,
  name text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_clients_org_key_unique unique (organization_id, client_key)
);

-- ─── Projects (org-scoped) ───────────────────────────────────────────────────

create table if not exists public.studio_world_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  client_id uuid references public.studio_world_clients (id) on delete set null,
  project_key text not null,
  name text not null,
  brand_slug text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_projects_org_key_unique unique (organization_id, project_key)
);

create index if not exists studio_world_projects_client_idx
  on public.studio_world_projects (client_id);

-- ─── Entitlements (org-licensed capabilities) ──────────────────────────────────

create table if not exists public.studio_world_entitlements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  entitlement_key text not null,
  status text not null default 'active',
  source text not null default 'SYSTEM',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_entitlements_org_key_unique unique (organization_id, entitlement_key)
);

-- ─── Production budgets ───────────────────────────────────────────────────────

create table if not exists public.studio_world_production_budgets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  period_type text not null default 'monthly',
  period_start timestamptz not null,
  period_end timestamptz not null,
  soft_limit numeric(12, 4),
  hard_limit numeric(12, 4),
  currency text not null default 'USD',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_world_production_budgets_org_period_idx
  on public.studio_world_production_budgets (organization_id, period_start, period_end);

-- ─── Production usage ledger (append-only) ───────────────────────────────────

create table if not exists public.studio_world_production_usage_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text,
  operator_user_id text not null,
  organization_id uuid not null references public.studio_world_organizations (id) on delete restrict,
  workspace_id text,
  client_id uuid references public.studio_world_clients (id) on delete set null,
  project_id uuid references public.studio_world_projects (id) on delete set null,
  campaign_id text,
  shot_id text,
  asset_id text,
  billing_owner_type text not null default 'organization',
  billing_owner_id uuid not null references public.studio_world_organizations (id) on delete restrict,
  provider text not null,
  model text,
  operation_type text not null,
  estimated_cost numeric(12, 6) not null default 0,
  actual_cost numeric(12, 6),
  currency text not null default 'USD',
  cost_source text not null default 'INTERNAL_ESTIMATE',
  provider_request_id text,
  reservation_id uuid,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists studio_world_usage_idempotency_unique
  on public.studio_world_production_usage_events (idempotency_key)
  where idempotency_key is not null;

create index if not exists studio_world_usage_billing_owner_idx
  on public.studio_world_production_usage_events (billing_owner_id, created_at desc);

create index if not exists studio_world_usage_org_idx
  on public.studio_world_production_usage_events (organization_id, created_at desc);

create index if not exists studio_world_usage_client_idx
  on public.studio_world_production_usage_events (client_id, created_at desc);

create index if not exists studio_world_usage_campaign_idx
  on public.studio_world_production_usage_events (campaign_id, created_at desc);

-- ─── Cost reservations ─────────────────────────────────────────────────────────

create table if not exists public.studio_world_production_cost_reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  billing_owner_id uuid not null references public.studio_world_organizations (id) on delete restrict,
  idempotency_key text not null,
  estimated_cost numeric(12, 6) not null,
  actual_cost numeric(12, 6),
  currency text not null default 'USD',
  status text not null default 'pending',
  usage_event_id uuid references public.studio_world_production_usage_events (id) on delete set null,
  operation_type text not null,
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_reservations_idempotency_unique unique (idempotency_key)
);

create index if not exists studio_world_reservations_billing_owner_idx
  on public.studio_world_production_cost_reservations (billing_owner_id, status);

-- ─── Usage adjustments (reconciliation — never rewrite ledger rows) ───────────

create table if not exists public.studio_world_production_usage_adjustments (
  id uuid primary key default gen_random_uuid(),
  usage_event_id uuid not null references public.studio_world_production_usage_events (id) on delete restrict,
  adjustment_type text not null,
  amount numeric(12, 6) not null,
  currency text not null default 'USD',
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── Production policies (org-scoped provider rules) ───────────────────────────

create table if not exists public.studio_world_production_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  policy jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_production_policies_org_unique unique (organization_id)
);

-- ─── Governance audit events ───────────────────────────────────────────────────

create table if not exists public.studio_world_production_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  organization_id uuid references public.studio_world_organizations (id) on delete set null,
  event_type text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_world_production_audit_org_idx
  on public.studio_world_production_audit_events (organization_id, created_at desc);

-- ─── RLS — service role only (server-side authoritative) ───────────────────────

alter table public.studio_world_organizations enable row level security;
alter table public.studio_world_organization_memberships enable row level security;
alter table public.studio_world_clients enable row level security;
alter table public.studio_world_projects enable row level security;
alter table public.studio_world_entitlements enable row level security;
alter table public.studio_world_production_budgets enable row level security;
alter table public.studio_world_production_usage_events enable row level security;
alter table public.studio_world_production_cost_reservations enable row level security;
alter table public.studio_world_production_usage_adjustments enable row level security;
alter table public.studio_world_production_policies enable row level security;
alter table public.studio_world_production_audit_events enable row level security;

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'studio_world_organizations', 'studio_world_organization_memberships', 'studio_world_clients',
    'studio_world_projects', 'studio_world_entitlements', 'studio_world_production_budgets',
    'studio_world_production_usage_events', 'studio_world_production_cost_reservations',
    'studio_world_production_usage_adjustments', 'studio_world_production_policies',
    'studio_world_production_audit_events'
  ] loop
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      tbl || '_service_role', tbl
    );
  end loop;
end $$;

comment on table public.studio_world_production_usage_events is
  'Append-only production usage ledger — operator ≠ billing owner';
