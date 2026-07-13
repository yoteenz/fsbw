-- Studio World Industry Packs™ — persistent headquarters generator entities
create table if not exists public.studio_business_archetypes (
  archetype_id text primary key,
  display_name text not null,
  description text not null,
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_department_templates (
  template_id text primary key,
  display_name text not null,
  description text not null,
  purpose text not null,
  current_version text not null,
  construction_template_id text not null,
  compatible_archetypes text[] not null default '{}',
  default_socket_ids text[] not null default '{}',
  default_capabilities text[] not null default '{}',
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_shared_department_instances (
  instance_id text primary key,
  template_id text not null references public.studio_department_templates (template_id),
  template_version text not null,
  blueprint_template_id text not null,
  construction_template_id text not null,
  material_library_id text not null,
  lighting_profile_id text not null,
  camera_pack_id text not null,
  render_artifact_url text,
  reuse_count integer not null default 0,
  generated_at timestamptz,
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, template_version)
);

create table if not exists public.studio_industry_packs (
  pack_id text primary key,
  name text not null,
  description text not null,
  archetype_id text not null references public.studio_business_archetypes (archetype_id),
  pack_version text not null,
  official boolean not null default false,
  lighting_profile_id text not null,
  material_library_id text not null,
  camera_pack_id text not null,
  blueprint_template_id text not null,
  construction_template_id text not null,
  render_prompt_id text not null,
  founder_permissions jsonb not null default '{}'::jsonb,
  marketplace_eligibility jsonb not null default '{}'::jsonb,
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_industry_pack_versions (
  id uuid primary key default gen_random_uuid(),
  pack_id text not null references public.studio_industry_packs (pack_id),
  pack_version text not null,
  default_departments jsonb not null default '[]'::jsonb,
  default_assets jsonb not null default '[]'::jsonb,
  pack_dependency_graph jsonb not null default '{}'::jsonb,
  department_reuse_graph jsonb not null default '{}'::jsonb,
  revision_note text,
  created_at timestamptz not null default now(),
  unique (pack_id, pack_version)
);

create table if not exists public.studio_founder_pack_instances (
  instance_id text primary key,
  organization_id text not null,
  pack_id text not null references public.studio_industry_packs (pack_id),
  pack_version text not null,
  archetype_id text not null,
  status text not null default 'draft',
  department_slots jsonb not null default '[]'::jsonb,
  headquarters_blueprint_id text,
  founder_render_job_id text,
  preview_artifact_url text,
  approved_at timestamptz,
  approved_by text,
  handoff_record jsonb,
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_founder_pack_instances_org_status_idx
  on public.studio_founder_pack_instances (organization_id, status, created_at desc);

create table if not exists public.studio_marketplace_packs (
  listing_id text primary key,
  pack_id text not null references public.studio_industry_packs (pack_id),
  pack_version text not null,
  listing_type text not null,
  title text not null,
  description text not null,
  certification_tier text not null,
  creator_organization_id text not null,
  registry_version text not null default 'industry-packs.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.studio_business_archetypes enable row level security;
alter table public.studio_department_templates enable row level security;
alter table public.studio_shared_department_instances enable row level security;
alter table public.studio_industry_packs enable row level security;
alter table public.studio_industry_pack_versions enable row level security;
alter table public.studio_founder_pack_instances enable row level security;
alter table public.studio_marketplace_packs enable row level security;

comment on table public.studio_industry_packs is
  'Studio World Industry Packs™ — complete headquarters templates, not individual rooms.';
comment on table public.studio_department_templates is
  'Shared Department Registry™ — reusable department templates referenced by Industry Packs.';
comment on table public.studio_founder_pack_instances is
  'Founder headquarters pack instance — EL generates entire HQ, CDS receives approved handoff.';
