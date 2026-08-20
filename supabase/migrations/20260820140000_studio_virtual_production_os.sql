-- Studio World Virtual Production OS — campaign continuity + multi-provider orchestration foundation
-- Tenant-scoped via org_id; service-role API access (matches studio_asset_registry pattern)

-- ─── Brand Production Bible ─────────────────────────────────────────────────

create table if not exists public.studio_vp_brands (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_key text not null,
  display_name text not null,
  description text,
  visual_rules jsonb not null default '{}'::jsonb,
  forbidden_deviations jsonb not null default '[]'::jsonb,
  status text not null default 'setup_required',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_key)
);

create index if not exists studio_vp_brands_org_idx on public.studio_vp_brands (org_id);

-- ─── Canon entities ─────────────────────────────────────────────────────────

create table if not exists public.studio_vp_characters (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  character_key text not null,
  canonical_name text not null,
  role text,
  description text,
  hero_reference_url text,
  reference_urls jsonb not null default '{}'::jsonb,
  body_notes jsonb not null default '{}'::jsonb,
  visual_invariants jsonb not null default '[]'::jsonb,
  forbidden_deviations jsonb not null default '[]'::jsonb,
  provider_metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'setup_required',
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, character_key)
);

create index if not exists studio_vp_characters_brand_idx on public.studio_vp_characters (brand_id);

create table if not exists public.studio_vp_character_reference_packs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  character_id uuid not null references public.studio_vp_characters (id) on delete cascade,
  pack_key text not null,
  label text not null,
  frames jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, character_id, pack_key, version)
);

create table if not exists public.studio_vp_environments (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  environment_key text not null,
  name text not null,
  description text,
  canonical_images jsonb not null default '[]'::jsonb,
  spatial_notes jsonb not null default '{}'::jsonb,
  lighting_conditions jsonb not null default '{}'::jsonb,
  permitted_modifications jsonb not null default '[]'::jsonb,
  forbidden_modifications jsonb not null default '[]'::jsonb,
  provider_metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'setup_required',
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, environment_key)
);

create table if not exists public.studio_vp_products (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  product_key text not null,
  name text not null,
  description text,
  canonical_images jsonb not null default '{}'::jsonb,
  packaging_rules jsonb not null default '{}'::jsonb,
  label_rules jsonb not null default '{}'::jsonb,
  forbidden_deviations jsonb not null default '[]'::jsonb,
  provider_metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'setup_required',
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, product_key)
);

create table if not exists public.studio_vp_wardrobe (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  wardrobe_key text not null,
  label text not null,
  garment_type text,
  reference_urls jsonb not null default '[]'::jsonb,
  associations jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'setup_required',
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, wardrobe_key)
);

create table if not exists public.studio_vp_props (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  prop_key text not null,
  label text not null,
  prop_type text,
  reference_urls jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  status text not null default 'setup_required',
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, prop_key)
);

create table if not exists public.studio_vp_camera_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  profile_key text not null,
  label text not null,
  shot_types jsonb not null default '[]'::jsonb,
  framing jsonb not null default '{}'::jsonb,
  movement jsonb not null default '{}'::jsonb,
  forbidden_behavior jsonb not null default '[]'::jsonb,
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, profile_key)
);

create table if not exists public.studio_vp_behavior_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  profile_key text not null,
  label text not null,
  behavior_notes jsonb not null default '{}'::jsonb,
  character_associations jsonb not null default '[]'::jsonb,
  canon_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, profile_key)
);

-- ─── Campaign production graph ──────────────────────────────────────────────

create table if not exists public.studio_vp_campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  brand_id uuid not null references public.studio_vp_brands (id) on delete cascade,
  campaign_key text not null,
  name text not null,
  objective text,
  platform text,
  audience text,
  creative_brief text,
  narrative_concept text,
  treatment text,
  production_mode text not null default 'precision',
  deliverables jsonb not null default '[]'::jsonb,
  format jsonb not null default '{}'::jsonb,
  canon_snapshot jsonb not null default '{}'::jsonb,
  lifecycle_status text not null default 'idea',
  approval_state text not null default 'draft',
  deadline timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, brand_id, campaign_key)
);

create index if not exists studio_vp_campaigns_org_status_idx
  on public.studio_vp_campaigns (org_id, lifecycle_status);

create table if not exists public.studio_vp_scenes (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  scene_key text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, scene_key)
);

create table if not exists public.studio_vp_shots (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  scene_id uuid not null references public.studio_vp_scenes (id) on delete cascade,
  shot_key text not null,
  sort_order integer not null default 0,
  purpose text,
  shot_type text,
  description text,
  duration_seconds numeric(8, 2),
  production_mode text,
  provider_id text,
  model_id text,
  model_settings jsonb not null default '{}'::jsonb,
  prompt text,
  negative_constraints text,
  canon_refs jsonb not null default '{}'::jsonb,
  start_frame_url text,
  end_frame_url text,
  transition_type text,
  selected_take_id uuid,
  replacement_take_id uuid,
  approval_state text not null default 'draft',
  qc_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, shot_key)
);

create index if not exists studio_vp_shots_campaign_order_idx
  on public.studio_vp_shots (campaign_id, sort_order);

create table if not exists public.studio_vp_shot_continuity (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  shot_id uuid not null references public.studio_vp_shots (id) on delete cascade,
  inherits_from_shot_id uuid references public.studio_vp_shots (id) on delete set null,
  start_state jsonb not null default '{}'::jsonb,
  end_state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, shot_id)
);

create table if not exists public.studio_vp_storyboard_frames (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  scene_id uuid references public.studio_vp_scenes (id) on delete set null,
  shot_id uuid references public.studio_vp_shots (id) on delete set null,
  frame_key text not null,
  frame_kind text not null default 'text_concept',
  image_url text,
  label text,
  production_status text not null default 'draft',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, frame_key)
);

-- ─── Production jobs + assets + provenance ────────────────────────────────────

create table if not exists public.studio_vp_production_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid references public.studio_vp_campaigns (id) on delete set null,
  shot_id uuid references public.studio_vp_shots (id) on delete set null,
  job_key text not null,
  provider_id text not null,
  model_id text,
  capability text not null,
  production_mode text not null,
  status text not null default 'queued',
  error_category text,
  error_message text,
  request_payload jsonb not null default '{}'::jsonb,
  governed_job_id text,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique (org_id, job_key)
);

create index if not exists studio_vp_production_jobs_campaign_idx
  on public.studio_vp_production_jobs (campaign_id, status);

create table if not exists public.studio_vp_generation_assets (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid references public.studio_vp_campaigns (id) on delete set null,
  scene_id uuid references public.studio_vp_scenes (id) on delete set null,
  shot_id uuid references public.studio_vp_shots (id) on delete set null,
  production_job_id uuid references public.studio_vp_production_jobs (id) on delete set null,
  asset_key text not null,
  media_url text,
  media_type text not null default 'image',
  provider_id text not null,
  model_id text,
  prompt text,
  settings jsonb not null default '{}'::jsonb,
  source_references jsonb not null default '[]'::jsonb,
  canon_versions jsonb not null default '{}'::jsonb,
  parent_asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  repair_ancestry jsonb not null default '[]'::jsonb,
  approval_state text not null default 'draft',
  registry_asset_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, asset_key)
);

create index if not exists studio_vp_generation_assets_shot_idx
  on public.studio_vp_generation_assets (shot_id, approval_state);

-- ─── QC, repair, assembly, deliverables ─────────────────────────────────────

create table if not exists public.studio_vp_qc_reviews (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid references public.studio_vp_campaigns (id) on delete cascade,
  shot_id uuid references public.studio_vp_shots (id) on delete cascade,
  asset_id uuid references public.studio_vp_generation_assets (id) on delete cascade,
  reviewer_id text,
  overall_status text not null default 'not_reviewed',
  category_results jsonb not null default '{}'::jsonb,
  notes text,
  decision text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_vp_repairs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  shot_id uuid not null references public.studio_vp_shots (id) on delete cascade,
  original_asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  repair_job_id uuid references public.studio_vp_production_jobs (id) on delete set null,
  replacement_asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  status text not null default 'open',
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_vp_assemblies (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  assembly_key text not null,
  label text not null,
  timeline jsonb not null default '[]'::jsonb,
  audio_assets jsonb not null default '[]'::jsonb,
  transitions jsonb not null default '[]'::jsonb,
  grade_version text,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, assembly_key)
);

create table if not exists public.studio_vp_deliverables (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  assembly_id uuid references public.studio_vp_assemblies (id) on delete set null,
  deliverable_key text not null,
  platform text not null,
  aspect_ratio text,
  resolution text,
  duration_seconds numeric(8, 2),
  caption text,
  export_version text,
  approval_state text not null default 'draft',
  delivery_state text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, deliverable_key)
);

-- ─── External Director packages (OpenArt Director manual workflow) ──────────

create table if not exists public.studio_vp_director_packages (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  provider_id text not null default 'openart-director',
  package_payload jsonb not null default '{}'::jsonb,
  export_format text not null default 'markdown',
  external_status text not null default 'draft',
  imported_asset_ids jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, provider_id)
);

-- ─── Provider config metadata (no secrets) ──────────────────────────────────

create table if not exists public.studio_vp_provider_configs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  provider_id text not null,
  label text not null,
  capabilities jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  integration_mode text not null default 'api',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, provider_id)
);

-- ─── RLS: service role via API only ─────────────────────────────────────────

alter table public.studio_vp_brands enable row level security;
alter table public.studio_vp_characters enable row level security;
alter table public.studio_vp_character_reference_packs enable row level security;
alter table public.studio_vp_environments enable row level security;
alter table public.studio_vp_products enable row level security;
alter table public.studio_vp_wardrobe enable row level security;
alter table public.studio_vp_props enable row level security;
alter table public.studio_vp_camera_profiles enable row level security;
alter table public.studio_vp_behavior_profiles enable row level security;
alter table public.studio_vp_campaigns enable row level security;
alter table public.studio_vp_scenes enable row level security;
alter table public.studio_vp_shots enable row level security;
alter table public.studio_vp_shot_continuity enable row level security;
alter table public.studio_vp_storyboard_frames enable row level security;
alter table public.studio_vp_production_jobs enable row level security;
alter table public.studio_vp_generation_assets enable row level security;
alter table public.studio_vp_qc_reviews enable row level security;
alter table public.studio_vp_repairs enable row level security;
alter table public.studio_vp_assemblies enable row level security;
alter table public.studio_vp_deliverables enable row level security;
alter table public.studio_vp_director_packages enable row level security;
alter table public.studio_vp_provider_configs enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'studio_vp_brands', 'studio_vp_characters', 'studio_vp_character_reference_packs',
    'studio_vp_environments', 'studio_vp_products', 'studio_vp_wardrobe', 'studio_vp_props',
    'studio_vp_camera_profiles', 'studio_vp_behavior_profiles', 'studio_vp_campaigns',
    'studio_vp_scenes', 'studio_vp_shots', 'studio_vp_shot_continuity',
    'studio_vp_storyboard_frames', 'studio_vp_production_jobs', 'studio_vp_generation_assets',
    'studio_vp_qc_reviews', 'studio_vp_repairs', 'studio_vp_assemblies', 'studio_vp_deliverables',
    'studio_vp_director_packages', 'studio_vp_provider_configs'
  ] loop
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      tbl || '_service_role', tbl
    );
  end loop;
end $$;

comment on table public.studio_vp_campaigns is
  'Studio World Virtual Production OS — campaign production graph (tenant-scoped via org_id).';
