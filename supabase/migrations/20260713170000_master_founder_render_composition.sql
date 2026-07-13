-- Master Founder Render™ + Composition Pack™ — one canonical room, multi-device framing
create table if not exists public.studio_master_founder_renders (
  render_id text primary key,
  organization_id text not null,
  project_id text not null,
  room_id text not null,
  blueprint_id text not null,
  construction_plan_id text not null,
  department_registry_id text,
  aspect_ratio text not null default '21:9',
  artifact_url text,
  job_id text,
  status text not null default 'no_preview',
  ai_model text,
  prompt_version text not null,
  revisions jsonb not null default '{}'::jsonb,
  organization_assets jsonb not null default '[]'::jsonb,
  approved_at timestamptz,
  approved_by text,
  registry_version text not null default 'master-founder-render.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_master_portrait_renders (
  portrait_id text primary key,
  master_landscape_render_id text not null references public.studio_master_founder_renders (render_id),
  landscape_artifact_url text not null,
  aspect_ratio text not null default '9:16',
  artifact_url text,
  job_id text,
  status text not null default 'no_preview',
  ai_model text,
  prompt_version text not null,
  landscape_approved_at timestamptz not null,
  approved_at timestamptz,
  approved_by text,
  registry_version text not null default 'master-founder-render.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_composition_packs (
  pack_id text primary key,
  master_landscape_render_id text not null references public.studio_master_founder_renders (render_id),
  master_portrait_render_id text references public.studio_master_portrait_renders (portrait_id),
  profiles jsonb not null default '[]'::jsonb,
  locked boolean not null default false,
  revision integer not null default 1,
  registry_version text not null default 'master-founder-render.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_composition_profiles (
  profile_id text not null,
  pack_id text not null references public.studio_composition_packs (pack_id),
  display_name text not null,
  device_profile text not null,
  source_master text not null,
  aspect_ratio text not null,
  field_of_view_deg numeric not null,
  focal_length_mm numeric not null,
  safe_area_insets jsonb not null default '{}'::jsonb,
  focus_priority text not null,
  crop_strategy text not null,
  requires_new_generation boolean not null default false,
  registry_version text not null default 'master-founder-render.v1',
  created_at timestamptz not null default now(),
  primary key (pack_id, profile_id)
);

create table if not exists public.studio_blueprint_composition_metadata (
  blueprint_id text primary key,
  hero_objects jsonb not null default '[]'::jsonb,
  primary_focus text not null,
  secondary_focus text not null,
  safe_crop_areas jsonb not null default '[]'::jsonb,
  visual_priority jsonb not null default '[]'::jsonb,
  architectural_anchors jsonb not null default '[]'::jsonb,
  walking_direction text not null,
  camera_height_m numeric not null,
  camera_orbit_radius_m numeric not null,
  recommended_focal_length_mm numeric not null,
  recommended_composition text not null,
  scene_focus_graph jsonb not null default '[]'::jsonb,
  registry_version text not null default 'master-founder-render.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_master_founder_renders_org_status_idx
  on public.studio_master_founder_renders (organization_id, status, created_at desc);

alter table public.studio_master_founder_renders enable row level security;
alter table public.studio_master_portrait_renders enable row level security;
alter table public.studio_composition_packs enable row level security;
alter table public.studio_composition_profiles enable row level security;
alter table public.studio_blueprint_composition_metadata enable row level security;

comment on table public.studio_master_founder_renders is
  'Master Founder Render™ 21:9 — canonical architectural source of truth for all device compositions.';
comment on table public.studio_master_portrait_renders is
  'Master Portrait 9:16 — camera recomposition from approved landscape only, never a new room.';
comment on table public.studio_composition_packs is
  'Composition Pack™ — device framing profiles derived from master renders, no new room generation.';
