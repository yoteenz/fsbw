-- All In One Enterprises Inc. — Business Data Foundation + RLS
-- Apply ONLY to dedicated All In One Supabase project.

-- ---------------------------------------------------------------------------
-- Intake
-- ---------------------------------------------------------------------------
create table if not exists public.aio_intake_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress',
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roadmaps
-- ---------------------------------------------------------------------------
create table if not exists public.aio_roadmaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_version text not null default 'v1',
  compliance_progress integer not null default 0,
  business_progress integer not null default 0,
  status text not null default 'active',
  source_intake_id uuid references public.aio_intake_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_roadmap_items (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.aio_roadmaps(id) on delete cascade,
  title text not null,
  status text not null,
  category text,
  reason text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Service requests
-- ---------------------------------------------------------------------------
create table if not exists public.aio_service_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  requester_user_id uuid references auth.users(id) on delete set null,
  request_number text not null unique,
  division text not null,
  service_slug text,
  status text not null,
  workflow_step text not null,
  status_label text,
  priority text not null default 'normal',
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  customer_notes text,
  target_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_service_request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.aio_service_requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists aio_requests_org_idx on public.aio_service_requests (organization_id);
create index if not exists aio_requests_status_idx on public.aio_service_requests (status);

-- ---------------------------------------------------------------------------
-- Tasks, deadlines, documents
-- ---------------------------------------------------------------------------
create table if not exists public.aio_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  request_id uuid references public.aio_service_requests(id) on delete set null,
  title text not null,
  assigned_staff_user_id uuid references auth.users(id) on delete set null,
  priority text not null default 'normal',
  status text not null default 'open',
  category text,
  due_at timestamptz,
  notes text,
  visibility public.aio_visibility not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_deadlines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  title text not null,
  deadline_type text not null,
  due_at timestamptz not null,
  status text not null default 'upcoming',
  source text not null default 'manual',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  request_id uuid references public.aio_service_requests(id) on delete set null,
  category text not null,
  name text not null,
  status text not null default 'requested',
  visibility public.aio_visibility not null default 'customer',
  expires_at timestamptz,
  storage_reference text,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal notes — NEVER customer-visible
create table if not exists public.aio_internal_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  request_id uuid references public.aio_service_requests(id) on delete set null,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------
create table if not exists public.aio_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  request_id uuid references public.aio_service_requests(id) on delete set null,
  context_type text not null default 'service_request',
  division text,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.aio_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  visibility public.aio_visibility not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Activity & notifications
-- ---------------------------------------------------------------------------
create table if not exists public.aio_activity_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  visibility public.aio_visibility not null default 'internal',
  title text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Operations domains
-- ---------------------------------------------------------------------------
create table if not exists public.aio_dispatch_loads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  load_number text not null,
  carrier_name text,
  origin text not null,
  destination text not null,
  rate numeric(12,2),
  miles integer,
  status text not null default 'available',
  has_rate_con boolean not null default false,
  has_pod boolean not null default false,
  has_invoice boolean not null default false,
  factoring_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_factoring_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  load_id uuid references public.aio_dispatch_loads(id) on delete set null,
  carrier_name text,
  invoice_amount numeric(12,2),
  status text not null,
  status_label text,
  eligibility_status text,
  partner_status text,
  estimated_fee numeric(12,2),
  estimated_net numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_brokerage_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  shipper_name text not null,
  origin text not null,
  destination text not null,
  status text not null default 'quote_requested',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_brokerage_shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  quote_id uuid references public.aio_brokerage_quotes(id) on delete set null,
  shipment_number text not null,
  shipper_name text not null,
  origin text not null,
  destination text not null,
  status text not null,
  carrier text,
  rate numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  request_id uuid references public.aio_service_requests(id) on delete set null,
  invoice_number text not null,
  service text not null,
  amount numeric(12,2) not null,
  status text not null default 'draft',
  issued_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists aio_intake_updated_at on public.aio_intake_sessions;
create trigger aio_intake_updated_at before update on public.aio_intake_sessions
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_roadmaps_updated_at on public.aio_roadmaps;
create trigger aio_roadmaps_updated_at before update on public.aio_roadmaps
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_requests_updated_at on public.aio_service_requests;
create trigger aio_requests_updated_at before update on public.aio_service_requests
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_tasks_updated_at on public.aio_tasks;
create trigger aio_tasks_updated_at before update on public.aio_tasks
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_documents_updated_at on public.aio_documents;
create trigger aio_documents_updated_at before update on public.aio_documents
  for each row execute function public.aio_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS enable
-- ---------------------------------------------------------------------------
alter table public.aio_intake_sessions enable row level security;
alter table public.aio_roadmaps enable row level security;
alter table public.aio_roadmap_items enable row level security;
alter table public.aio_service_requests enable row level security;
alter table public.aio_service_request_status_history enable row level security;
alter table public.aio_tasks enable row level security;
alter table public.aio_deadlines enable row level security;
alter table public.aio_documents enable row level security;
alter table public.aio_internal_notes enable row level security;
alter table public.aio_conversations enable row level security;
alter table public.aio_messages enable row level security;
alter table public.aio_activity_events enable row level security;
alter table public.aio_notifications enable row level security;
alter table public.aio_dispatch_loads enable row level security;
alter table public.aio_factoring_cases enable row level security;
alter table public.aio_brokerage_quotes enable row level security;
alter table public.aio_brokerage_shipments enable row level security;
alter table public.aio_invoices enable row level security;

-- Customer org access pattern
create policy aio_intake_org on public.aio_intake_sessions for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_roadmaps_org on public.aio_roadmaps for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_roadmap_items_org on public.aio_roadmap_items for all using (
  roadmap_id in (
    select r.id from public.aio_roadmaps r
    where r.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

create policy aio_requests_org on public.aio_service_requests for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_request_history on public.aio_service_request_status_history for all using (
  request_id in (
    select sr.id from public.aio_service_requests sr
    where sr.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

create policy aio_tasks_access on public.aio_tasks for all using (
  (visibility = 'customer' and organization_id in (select public.aio_user_org_ids()))
  or public.aio_is_internal_user()
);

create policy aio_deadlines_org on public.aio_deadlines for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_documents_org on public.aio_documents for select using (
  (visibility = 'customer' and organization_id in (select public.aio_user_org_ids()))
  or public.aio_is_internal_user()
);

create policy aio_documents_internal_write on public.aio_documents for insert with check (
  public.aio_is_internal_user()
);

create policy aio_documents_customer_read on public.aio_documents for update using (
  public.aio_is_internal_user()
);

-- Internal notes: INTERNAL ONLY
create policy aio_internal_notes_staff on public.aio_internal_notes for all using (
  public.aio_is_internal_user()
);

create policy aio_conversations_org on public.aio_conversations for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_messages_access on public.aio_messages for all using (
  conversation_id in (
    select c.id from public.aio_conversations c
    where c.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

create policy aio_activity_customer on public.aio_activity_events for select using (
  (visibility = 'customer' and organization_id in (select public.aio_user_org_ids()))
  or public.aio_is_internal_user()
);

create policy aio_activity_internal_write on public.aio_activity_events for insert with check (
  public.aio_is_internal_user() or organization_id in (select public.aio_user_org_ids())
);

create policy aio_notifications_own on public.aio_notifications for all using (
  user_id = auth.uid() or public.aio_is_internal_user()
);

create policy aio_dispatch_org on public.aio_dispatch_loads for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_factoring_org on public.aio_factoring_cases for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_brokerage_quotes_org on public.aio_brokerage_quotes for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_brokerage_shipments_org on public.aio_brokerage_shipments for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_invoices_org on public.aio_invoices for select using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_invoices_internal on public.aio_invoices for all using (
  public.aio_is_internal_user()
);

-- Request counter sequence for AIO-XXXX numbers
create sequence if not exists public.aio_request_number_seq start 1;

create or replace function public.aio_next_request_number()
returns text
language sql
as $$
  select 'AIO-' || lpad(nextval('public.aio_request_number_seq')::text, 6, '0');
$$;
