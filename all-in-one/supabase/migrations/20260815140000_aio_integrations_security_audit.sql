-- All In One — Integrations, Security, Audit, Privacy
-- Apply ONLY to dedicated All In One Supabase project.

-- ---------------------------------------------------------------------------
-- Integrations (no plaintext secrets)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_integration_providers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  provider_id uuid not null references public.aio_integration_providers(id) on delete restrict,
  status text not null default 'disconnected',
  secret_reference text,
  credential_version integer default 1,
  last_rotated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_integration_operations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.aio_integration_connections(id) on delete cascade,
  operation_type text not null,
  status text not null,
  external_id text,
  correlation_id text,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Security & audit
-- ---------------------------------------------------------------------------
create table if not exists public.aio_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'USER',
  organization_id uuid references public.aio_organizations(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  result text not null default 'success',
  correlation_id text,
  safe_metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.aio_security_incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.aio_organizations(id) on delete set null,
  request_type text not null,
  status text not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  consent_type text not null,
  version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Document versions & sharing
create table if not exists public.aio_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.aio_documents(id) on delete cascade,
  version_number integer not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create table if not exists public.aio_document_sharing_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.aio_documents(id) on delete cascade,
  recipient_label text not null,
  purpose text,
  authorized_by uuid references auth.users(id) on delete set null,
  shared_at timestamptz not null default now()
);

alter table public.aio_integration_providers enable row level security;
alter table public.aio_integration_connections enable row level security;
alter table public.aio_integration_operations enable row level security;
alter table public.aio_audit_events enable row level security;
alter table public.aio_security_incidents enable row level security;
alter table public.aio_privacy_requests enable row level security;
alter table public.aio_consents enable row level security;
alter table public.aio_document_versions enable row level security;
alter table public.aio_document_sharing_events enable row level security;

create policy aio_integrations_staff on public.aio_integration_connections for all using (public.aio_is_internal_user());
create policy aio_integration_ops_staff on public.aio_integration_operations for all using (public.aio_is_internal_user());
create policy aio_integration_providers_read on public.aio_integration_providers for select using (true);

create policy aio_audit_staff on public.aio_audit_events for select using (public.aio_is_internal_user());
create policy aio_audit_insert on public.aio_audit_events for insert with check (true);

create policy aio_security_incidents_staff on public.aio_security_incidents for all using (public.aio_is_internal_user());
create policy aio_privacy_org on public.aio_privacy_requests for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);
create policy aio_consents_own on public.aio_consents for all using (user_id = auth.uid() or public.aio_is_internal_user());

create policy aio_doc_versions_org on public.aio_document_versions for select using (
  document_id in (
    select d.id from public.aio_documents d
    where d.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

-- Prevent audit mutation from normal roles
revoke update, delete on public.aio_audit_events from authenticated;
revoke update, delete on public.aio_audit_events from anon;
