-- P0.BRIDGE.1-FSBW — SITE 00 ↔ FSBW design control plane (shared Supabase bridge tables)

-- ─── Approved design change contracts (SITE 00 → FSBW) ───

create table if not exists public.site00_design_change_requests (
  id uuid primary key default gen_random_uuid(),
  change_request_id text not null unique,
  project_id text not null,
  repo_binding text not null default 'yoteenz/fsbw',
  status text not null default 'DRAFT',
  design_version text,
  base_source_commit text,
  target_branch text not null default 'master',
  operations jsonb not null default '[]'::jsonb,
  shell_propagation jsonb,
  runtime_bindings jsonb,
  propagation_exceptions jsonb not null default '[]'::jsonb,
  risk_level text,
  metadata jsonb not null default '{}'::jsonb,
  founder_approved_at timestamptz,
  fsbw_status text,
  fsbw_applied_commit text,
  fsbw_applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_design_change_requests_project_check check (
    project_id in ('FRONTAL_SLAYER', 'ALL_IN_ONE_ENTERPRISES', 'STUDIO_WORLD_WEBSITE')
  ),
  constraint site00_design_change_requests_status_check check (
    status in (
      'DRAFT',
      'AI_DRAFT',
      'ADMIN_REVIEW',
      'FOUNDER_APPROVED',
      'READY_FOR_REPO',
      'APPLYING',
      'APPLIED',
      'BLOCKED',
      'BLOCKED_SOURCE_DIVERGENCE',
      'FAILED',
      'MERGED',
      'CANCELLED'
    )
  )
);

create index if not exists idx_site00_design_change_requests_status_repo
  on public.site00_design_change_requests (status, repo_binding);

create index if not exists idx_site00_design_change_requests_project
  on public.site00_design_change_requests (project_id, status);

-- ─── Cross-repo materialization receipts ───

create table if not exists public.site00_change_receipts (
  id uuid primary key default gen_random_uuid(),
  change_request_id text not null,
  event text not null,
  status text,
  project_id text,
  payload jsonb not null default '{}'::jsonb,
  source_commit_before text,
  source_commit_after text,
  created_at timestamptz not null default now(),
  constraint site00_change_receipts_event_check check (
    event in (
      'FETCHED',
      'VALIDATED',
      'BLOCKED',
      'APPLYING',
      'APPLIED',
      'TESTS_PASSED',
      'BUILD_PASSED',
      'PR_CREATED',
      'MERGED',
      'FAILED',
      'ROLLBACK'
    )
  )
);

create index if not exists idx_site00_change_receipts_change_request
  on public.site00_change_receipts (change_request_id, created_at desc);

create index if not exists idx_site00_change_receipts_event
  on public.site00_change_receipts (event, created_at desc);

-- ─── Runtime-safe bindings (validated config, not executable code) ───

create table if not exists public.site00_runtime_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  route text,
  page_key text,
  binding_type text not null,
  binding_key text not null,
  binding_value jsonb not null,
  schema_version text not null default 'site00-runtime-binding@1',
  design_version text,
  change_request_id text,
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_runtime_bindings_type_check check (
    binding_type in (
      'content',
      'asset_id',
      'design_token',
      'page_metadata',
      'component_variant',
      'section_order',
      'responsive_rule'
    )
  )
);

create unique index if not exists idx_site00_runtime_bindings_active_key
  on public.site00_runtime_bindings (project_id, coalesce(route, ''), coalesce(page_key, ''), binding_type, binding_key)
  where is_active = true;

create index if not exists idx_site00_runtime_bindings_project_route
  on public.site00_runtime_bindings (project_id, route, is_active);

-- ─── Idempotency ledger ───

create table if not exists public.site00_design_change_applications (
  id uuid primary key default gen_random_uuid(),
  change_request_id text not null unique,
  project_id text not null,
  applied_commit text,
  applied_at timestamptz not null default now(),
  receipt_id uuid references public.site00_change_receipts(id) on delete set null
);

-- ─── RLS: service role / bridge server only ───

alter table public.site00_design_change_requests enable row level security;
alter table public.site00_change_receipts enable row level security;
alter table public.site00_runtime_bindings enable row level security;
alter table public.site00_design_change_applications enable row level security;

-- No public policies — FSBW bridge uses service role server-side only.

comment on table public.site00_design_change_requests is
  'SITE 00 approved design change contracts targeted at FSBW repo binding yoteenz/fsbw';

comment on table public.site00_change_receipts is
  'Cross-repo materialization receipts — FETCHED through MERGED/FAILED/ROLLBACK';

comment on table public.site00_runtime_bindings is
  'Runtime-safe validated design bindings — schema-checked config, never executable code';

comment on table public.site00_design_change_applications is
  'Idempotency ledger — one row per successfully applied change_request_id';
