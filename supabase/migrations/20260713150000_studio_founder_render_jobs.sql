-- Founder Render™ — durable full-room preview jobs for Founder Review approval gate
create table if not exists public.studio_founder_render_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  organization_id text not null,
  project_id text not null,
  room_id text not null,
  blueprint_id text not null,
  blueprint_revision integer not null,
  construction_plan_id text not null,
  room_purpose text,
  artifact_intent text not null default 'founder-full-room-preview',
  status text not null default 'queued',
  model_route text,
  provider text not null default 'fal',
  provider_model text,
  provider_request_id text,
  prompt_version text not null,
  prompt_hash text,
  effective_prompt text,
  output_aspect_ratio text not null default '16:9',
  output_resolution text not null default '4K',
  reference_count integer not null default 0,
  brand_material_refs jsonb not null default '[]'::jsonb,
  preview_artifact_url text,
  storage_path text,
  output_width integer,
  output_height integer,
  failure_reason text,
  approval_status text not null default 'pending',
  approved_at timestamptz,
  approved_by text,
  approval_record jsonb,
  revision_note text,
  diagnostics jsonb not null default '{}'::jsonb,
  governance_context jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_founder_render_jobs_org_status_idx
  on public.studio_founder_render_jobs (organization_id, status, created_at desc);

create index if not exists studio_founder_render_jobs_plan_revision_idx
  on public.studio_founder_render_jobs (construction_plan_id, blueprint_revision desc);

alter table public.studio_founder_render_jobs enable row level security;

comment on table public.studio_founder_render_jobs is
  'Founder Render™ photoreal full-room preview jobs — approval gate before manufacturing.';
