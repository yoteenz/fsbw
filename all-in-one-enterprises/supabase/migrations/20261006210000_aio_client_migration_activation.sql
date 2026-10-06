-- AIO client migration, activation + office provisioning (P0 implementation foundation)
-- Apply ONLY to All In One Supabase (nnnljnhtmseagotvgxxt).

alter table public.aio_organizations
  add column if not exists client_lifecycle text not null default 'KNOWN_UNMIGRATED',
  add column if not exists client_review_state text not null default 'NOT_STARTED',
  add column if not exists profile_completeness_pct numeric(5,2),
  add column if not exists customer_number text,
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists paused_at timestamptz,
  add column if not exists ended_at timestamptz;

create index if not exists idx_aio_orgs_client_lifecycle
  on public.aio_organizations (client_lifecycle);

-- ---------------------------------------------------------------------------
-- Activation invites (token hash only — never store raw token)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_client_activation_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  sent_by_user_id uuid references auth.users(id) on delete set null,
  delivery_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_aio_activation_invites_token_hash
  on public.aio_client_activation_invites (token_hash);

create index if not exists idx_aio_activation_invites_org
  on public.aio_client_activation_invites (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Extracted facts + review decisions (proposals — not canonical until committed)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_client_extracted_facts (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.aio_archive_migration_batches(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  document_id uuid references public.aio_documents(id) on delete set null,
  entity_type text not null,
  field_key text not null,
  proposed_value text,
  existing_value text,
  confidence text not null default 'MEDIUM',
  review_action text,
  source_reference text,
  created_at timestamptz not null default now()
);

create index if not exists idx_aio_extracted_facts_batch
  on public.aio_client_extracted_facts (batch_id);

create table if not exists public.aio_client_profile_provenance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  entity_type text not null,
  field_key text not null,
  value text,
  provenance text not null,
  source_fact_id uuid references public.aio_client_extracted_facts(id) on delete set null,
  committed_at timestamptz not null default now()
);

create index if not exists idx_aio_profile_provenance_org
  on public.aio_client_profile_provenance (organization_id, entity_type, field_key);

-- ---------------------------------------------------------------------------
-- Client review + reported changes
-- ---------------------------------------------------------------------------
create table if not exists public.aio_client_review_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  section_code text not null,
  response text not null,
  updated_at timestamptz not null default now(),
  unique (organization_id, section_code)
);

create table if not exists public.aio_client_reported_changes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  shortcut text not null,
  note text,
  reconciliation text not null default 'STAFF_RECONCILE',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lifecycle audit events
-- ---------------------------------------------------------------------------
create table if not exists public.aio_client_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  from_state text,
  to_state text not null,
  event_type text not null,
  actor_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_aio_lifecycle_events_org
  on public.aio_client_lifecycle_events (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Workspace entitlements (staff-confirmed — not inferred from documents alone)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_office_workspace_entitlements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  workspace_code text not null,
  state text not null default 'AVAILABLE_NOT_ACTIVATED',
  confirmed_by_staff_at timestamptz,
  activated_at timestamptz,
  unique (organization_id, workspace_code)
);

-- ---------------------------------------------------------------------------
-- RLS — migration domain (internal staff for raw intake; clients see own review rows only)
-- ---------------------------------------------------------------------------
alter table public.aio_client_activation_invites enable row level security;
alter table public.aio_client_extracted_facts enable row level security;
alter table public.aio_client_profile_provenance enable row level security;
alter table public.aio_client_review_sessions enable row level security;
alter table public.aio_client_reported_changes enable row level security;
alter table public.aio_client_lifecycle_events enable row level security;
alter table public.aio_office_workspace_entitlements enable row level security;

create policy aio_activation_invites_internal on public.aio_client_activation_invites
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_extracted_facts_internal on public.aio_client_extracted_facts
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_profile_provenance_internal on public.aio_client_profile_provenance
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_lifecycle_events_internal on public.aio_client_lifecycle_events
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_workspace_entitlements_select on public.aio_office_workspace_entitlements
  for select using (
    public.aio_is_internal_user()
    or organization_id in (select public.aio_user_org_ids())
  );

create policy aio_workspace_entitlements_internal_write on public.aio_office_workspace_entitlements
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_review_sessions_member on public.aio_client_review_sessions
  for all using (
    organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  )
  with check (
    organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

create policy aio_reported_changes_member on public.aio_client_reported_changes
  for all using (
    organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  )
  with check (
    organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

-- ---------------------------------------------------------------------------
-- Membership hardening (C11) — block self-join to arbitrary orgs
-- ---------------------------------------------------------------------------
drop policy if exists aio_memberships_insert_own on public.aio_organization_memberships;

create policy aio_memberships_insert_first_owner on public.aio_organization_memberships
  for insert with check (
    user_id = auth.uid()
    and role = 'organization_owner'
    and not exists (
      select 1 from public.aio_organization_memberships m
      where m.organization_id = organization_id
    )
  );

create policy aio_memberships_insert_internal on public.aio_organization_memberships
  for insert with check (public.aio_is_internal_user());

-- Service role continues to manage activation acceptance via trusted backend paths.
