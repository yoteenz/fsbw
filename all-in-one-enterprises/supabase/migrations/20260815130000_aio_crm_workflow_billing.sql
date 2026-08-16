-- All In One — CRM, Workflow, Billing extensions
-- Apply ONLY to dedicated All In One Supabase project.

-- ---------------------------------------------------------------------------
-- CRM
-- ---------------------------------------------------------------------------
create table if not exists public.aio_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete set null,
  source text,
  status text not null default 'new',
  contact_name text,
  contact_email text,
  contact_phone text,
  converted_customer_id uuid references public.aio_customers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.aio_leads(id) on delete set null,
  organization_id uuid references public.aio_organizations(id) on delete set null,
  stage text not null default 'qualification',
  amount_cents bigint,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_crm_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  visibility text not null default 'INTERNAL' check (visibility in ('INTERNAL', 'CUSTOMER_VISIBLE')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Workflow
-- ---------------------------------------------------------------------------
create table if not exists public.aio_workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_workflow_versions (
  id uuid primary key default gen_random_uuid(),
  definition_id uuid not null references public.aio_workflow_definitions(id) on delete cascade,
  version_number integer not null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (definition_id, version_number)
);

create table if not exists public.aio_workflow_instances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  service_request_id uuid references public.aio_service_requests(id) on delete set null,
  workflow_version_id uuid references public.aio_workflow_versions(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.aio_workflow_instances(id) on delete cascade,
  step_code text not null,
  status text not null default 'pending',
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Billing (minor units)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  quote_number text not null unique,
  status text not null default 'draft',
  total_cents bigint not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.aio_invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,4) not null default 1,
  unit_amount_cents bigint not null,
  line_type text not null default 'service',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  invoice_id uuid references public.aio_invoices(id) on delete set null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  idempotency_key text unique,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.aio_financial_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  amount_cents bigint,
  currency text default 'USD',
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Automation
-- ---------------------------------------------------------------------------
create table if not exists public.aio_automation_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  enabled boolean not null default true,
  trigger_event text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_automation_executions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.aio_automation_rules(id) on delete cascade,
  status text not null,
  idempotency_key text,
  executed_at timestamptz not null default now()
);

alter table public.aio_leads enable row level security;
alter table public.aio_opportunities enable row level security;
alter table public.aio_crm_notes enable row level security;
alter table public.aio_workflow_definitions enable row level security;
alter table public.aio_workflow_versions enable row level security;
alter table public.aio_workflow_instances enable row level security;
alter table public.aio_workflow_steps enable row level security;
alter table public.aio_quotes enable row level security;
alter table public.aio_invoice_items enable row level security;
alter table public.aio_payments enable row level security;
alter table public.aio_financial_events enable row level security;
alter table public.aio_automation_rules enable row level security;
alter table public.aio_automation_executions enable row level security;

-- CRM internal only
create policy aio_leads_staff on public.aio_leads for all using (public.aio_is_internal_user());
create policy aio_opportunities_staff on public.aio_opportunities for all using (public.aio_is_internal_user());
create policy aio_crm_notes_staff on public.aio_crm_notes for all using (public.aio_is_internal_user());

create policy aio_workflow_instances_org on public.aio_workflow_instances for select using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);
create policy aio_workflow_instances_staff on public.aio_workflow_instances for all using (public.aio_is_internal_user());

create policy aio_payments_org on public.aio_payments for select using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);
create policy aio_payments_staff on public.aio_payments for all using (public.aio_is_internal_user());

create policy aio_financial_events_staff on public.aio_financial_events for all using (public.aio_is_internal_user());
