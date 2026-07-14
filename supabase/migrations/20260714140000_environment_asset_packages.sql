-- Environment Asset Package durable production pipeline (Studio World P0)

create table if not exists public.studio_environment_asset_packages (
  id uuid primary key default gen_random_uuid(),
  package_id text not null unique,
  department_id text not null,
  environment_id text not null,
  variant_id text not null,
  variant_name text not null,
  theme text not null,
  revision integer not null default 1,
  canonical boolean not null default false,
  status text not null default 'draft',
  lifecycle_state text not null default 'draft',
  stage text not null default 'concept-preview',
  provider text not null default 'preview-cache',
  model text not null default 'stage-1-preview',
  seed text not null,
  prompt_version text not null,
  prompt_hash text not null,
  department_bible_version text not null default 'bible-v1',
  architectural_dna_version text,
  golden_reference_version text,
  estimated_cost_usd numeric(12,4) not null default 0,
  actual_cost_usd numeric(12,4),
  estimated_duration_ms bigint,
  actual_duration_ms bigint,
  generation_estimate jsonb not null default '{}'::jsonb,
  package_health jsonb not null default '{}'::jsonb,
  outputs_snapshot jsonb not null default '{}'::jsonb,
  cache_key text not null,
  marketplace_ready boolean not null default false,
  approved_by text,
  approved_at timestamptz,
  promoted_by text,
  promoted_at timestamptz,
  archived_at timestamptz,
  superseded_by text,
  founder_notes text,
  diagnostics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, environment_id, variant_id, revision)
);

create index if not exists studio_env_packages_dept_env_idx
  on public.studio_environment_asset_packages (department_id, environment_id, variant_id);

create index if not exists studio_env_packages_lifecycle_idx
  on public.studio_environment_asset_packages (lifecycle_state, status);

create table if not exists public.studio_environment_package_outputs (
  id uuid primary key default gen_random_uuid(),
  package_id text not null references public.studio_environment_asset_packages(package_id) on delete cascade,
  output_type text not null,
  aspect_ratio text not null,
  status text not null default 'pending',
  artifact_url text,
  storage_path text,
  width integer,
  height integer,
  byte_size bigint,
  provider text,
  model text,
  seed text,
  prompt_hash text,
  reference_hash text,
  generation_job_id text,
  checksum text,
  quality_score numeric(6,3),
  consistency_score numeric(6,3),
  cached boolean not null default false,
  generated_at timestamptz,
  verified_at timestamptz,
  failure_code text,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, output_type)
);

create index if not exists studio_env_package_outputs_pkg_idx
  on public.studio_environment_package_outputs (package_id, status);

create table if not exists public.studio_environment_package_readiness (
  id uuid primary key default gen_random_uuid(),
  readiness_id text not null unique,
  package_id text not null unique references public.studio_environment_asset_packages(package_id) on delete cascade,
  variant_id text not null,
  lifecycle_state text not null default 'draft',
  readiness_percent integer not null default 0,
  blockers jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '{}'::jsonb,
  generation_estimate jsonb not null default '{}'::jsonb,
  founder_approved boolean not null default false,
  founder_approved_at timestamptz,
  founder_approved_by text,
  founder_rejected_at timestamptz,
  founder_rejected_by text,
  rejection_reason text,
  authorized_queue_entry jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_environment_package_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  parent_job_id text,
  package_id text not null references public.studio_environment_asset_packages(package_id) on delete cascade,
  variant_id text not null,
  job_type text not null,
  output_type text,
  status text not null default 'pending',
  priority integer not null default 1,
  retry_count integer not null default 0,
  estimated_duration_ms bigint,
  provider text not null default 'fal',
  provider_model text,
  provider_request_id text,
  governed_job_id text,
  storage_path text,
  artifact_url text,
  failure_code text,
  failure_message text,
  depends_on jsonb not null default '[]'::jsonb,
  diagnostics jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_env_pkg_jobs_pkg_status_idx
  on public.studio_environment_package_generation_jobs (package_id, status);

create index if not exists studio_env_pkg_jobs_parent_idx
  on public.studio_environment_package_generation_jobs (parent_job_id)
  where parent_job_id is not null;

create table if not exists public.studio_environment_package_approvals (
  id uuid primary key default gen_random_uuid(),
  approval_id text not null unique,
  package_id text not null references public.studio_environment_asset_packages(package_id) on delete cascade,
  approval_type text not null,
  approved_by text not null,
  approved_at timestamptz not null default now(),
  readiness_percent integer,
  generation_estimate jsonb not null default '{}'::jsonb,
  audit_payload jsonb not null default '{}'::jsonb,
  immutable_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_environment_package_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  package_id text not null references public.studio_environment_asset_packages(package_id) on delete cascade,
  event_type text not null,
  actor text,
  detail text not null,
  revision integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists studio_env_pkg_audit_pkg_idx
  on public.studio_environment_package_audit_events (package_id, occurred_at desc);

create table if not exists public.studio_environment_package_cds_handoffs (
  id uuid primary key default gen_random_uuid(),
  handoff_id text not null unique,
  package_id text not null references public.studio_environment_asset_packages(package_id) on delete cascade,
  variant_id text not null,
  status text not null default 'pending',
  canonical_master_output text,
  mobile_output text,
  tablet_output text,
  blueprint_output text,
  construction_output text,
  lighting_output text,
  materials_output text,
  asset_manifest jsonb not null default '{}'::jsonb,
  department_bible_version text,
  architectural_dna_version text,
  prompt_version text,
  package_revision integer not null,
  founder_approval_id text,
  handoff_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_environment_package_cache_entries (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  package_id text not null,
  variant_id text not null,
  output_type text not null,
  artifact_url text,
  storage_path text,
  checksum text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.studio_environment_asset_packages enable row level security;
alter table public.studio_environment_package_outputs enable row level security;
alter table public.studio_environment_package_readiness enable row level security;
alter table public.studio_environment_package_generation_jobs enable row level security;
alter table public.studio_environment_package_approvals enable row level security;
alter table public.studio_environment_package_audit_events enable row level security;
alter table public.studio_environment_package_cds_handoffs enable row level security;
alter table public.studio_environment_package_cache_entries enable row level security;

comment on table public.studio_environment_asset_packages is
  'Canonical Environment Asset Packages — one package per design variant, durable production source of truth.';

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'studio_env_asset_packages_service_role') then
    create policy "studio_env_asset_packages_service_role"
      on public.studio_environment_asset_packages for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_package_outputs_service_role') then
    create policy "studio_env_package_outputs_service_role"
      on public.studio_environment_package_outputs for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_package_readiness_service_role') then
    create policy "studio_env_package_readiness_service_role"
      on public.studio_environment_package_readiness for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_pkg_jobs_service_role') then
    create policy "studio_env_pkg_jobs_service_role"
      on public.studio_environment_package_generation_jobs for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_package_approvals_service_role') then
    create policy "studio_env_package_approvals_service_role"
      on public.studio_environment_package_approvals for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_pkg_audit_service_role') then
    create policy "studio_env_pkg_audit_service_role"
      on public.studio_environment_package_audit_events for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_pkg_cds_handoffs_service_role') then
    create policy "studio_env_pkg_cds_handoffs_service_role"
      on public.studio_environment_package_cds_handoffs for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_env_pkg_cache_service_role') then
    create policy "studio_env_pkg_cache_service_role"
      on public.studio_environment_package_cache_entries for all to service_role using (true) with check (true);
  end if;
end $$;
