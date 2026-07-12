-- Governed generation async work orders (ASYNC_GOVERNED_GENERATION_V1)
create table if not exists public.studio_governed_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  idempotency_key text not null,
  org_id text not null,
  company_id text,
  department_id text,
  station_id text,
  project_id text,
  concept_id text,
  surface text,
  compile_run_id text,
  client_request_id text,
  server_trace_id text not null,
  provider text not null default 'fal',
  provider_model text,
  provider_request_id text,
  generation_type text not null default 'studio-builder',
  source_route text not null,
  source_system text not null,
  status text not null default 'accepted',
  progress_phase text not null default 'accepted',
  progress_pct integer not null default 0,
  result_asset_url text,
  normalized_asset_url text,
  registry_asset_id text,
  storage_path text,
  error_category text,
  error_message text,
  retry_count integer not null default 0,
  cancellation_state text not null default 'none',
  expires_at timestamptz,
  created_by text,
  actor_id text not null,
  governance_context jsonb not null default '{}'::jsonb,
  request_payload jsonb not null default '{}'::jsonb,
  audit_payload jsonb,
  provider_state text,
  requested_at timestamptz not null default now(),
  accepted_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_governed_generation_jobs_org_status_idx
  on public.studio_governed_generation_jobs (org_id, status, created_at desc);

create index if not exists studio_governed_generation_jobs_idempotency_idx
  on public.studio_governed_generation_jobs (idempotency_key);

create index if not exists studio_governed_generation_jobs_compile_run_idx
  on public.studio_governed_generation_jobs (compile_run_id)
  where compile_run_id is not null;

create unique index if not exists studio_governed_generation_jobs_idempotency_active_uidx
  on public.studio_governed_generation_jobs (idempotency_key)
  where status not in ('complete', 'failed', 'cancelled', 'expired');

alter table public.studio_governed_generation_jobs enable row level security;
