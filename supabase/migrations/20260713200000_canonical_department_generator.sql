-- Canonical Studio World Department Generator™ — global infrastructure persistence (not tenant-owned)

create table if not exists public.studio_world_canonical_departments (
  department_id text primary key,
  slug text not null,
  name text not null,
  category text not null,
  purpose text not null,
  canonical_role text not null,
  description text not null,
  access_class text not null,
  admin_only boolean not null default true,
  founder_accessible boolean not null default false,
  system_accessible boolean not null default true,
  department_class text not null default 'CANONICAL_STUDIO_WORLD_DEPARTMENT',
  blueprint_template_id text not null,
  blueprint_revision integer not null default 1,
  founder_render_id text,
  founder_render_revision integer not null default 0,
  construction_plan_id text,
  construction_plan_revision integer not null default 0,
  command_dock_profile text not null,
  workbench_profile text not null,
  socket_profile text not null,
  material_library_id text not null,
  lighting_profile_id text not null,
  composition_profile_id text not null,
  department_model_route text not null default 'nano-banana-pro-full-scene',
  department_prompt_version text not null,
  status text not null default 'DRAFT',
  lifecycle_state text not null default 'DRAFT',
  published_version text,
  dependencies text[] not null default '{}',
  required_capabilities text[] not null default '{}',
  permitted_actions text[] not null default '{}',
  marketplace_eligibility boolean not null default false,
  route_path text not null,
  registry_version text not null default 'canonical-department-registry.v1',
  scope text not null default 'studio-world-global',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint studio_world_canonical_departments_no_org check (scope = 'studio-world-global')
);

create table if not exists public.studio_world_department_charters (
  charter_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  charter_version text not null default 'department-charter.v1',
  mission text not null,
  responsibilities jsonb not null default '[]'::jsonb,
  non_responsibilities jsonb not null default '[]'::jsonb,
  user_classes jsonb not null default '[]'::jsonb,
  core_workflows jsonb not null default '[]'::jsonb,
  charter_payload jsonb not null default '{}'::jsonb,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_department_versions (
  version_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  version_number integer not null,
  lifecycle_state text not null,
  changelog text,
  created_at timestamptz not null default now(),
  unique (department_id, version_number)
);

create table if not exists public.studio_world_department_blueprints (
  blueprint_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  blueprint_revision integer not null default 1,
  blueprint_payload jsonb not null default '{}'::jsonb,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_department_renders (
  render_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  render_kind text not null check (render_kind in ('landscape', 'portrait')),
  model_route text not null,
  artifact_url text,
  landscape_render_id text,
  landscape_artifact_url text,
  landscape_approved_at timestamptz,
  revision integer not null default 1,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_department_composition_packs (
  composition_pack_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  composition_profile_id text not null,
  pack_payload jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_department_socket_profiles (
  socket_profile_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  profile_id text not null,
  sockets jsonb not null default '[]'::jsonb,
  command_dock_profile text not null,
  workbench_profile text not null,
  law_version text not null default 'architecture-law-001.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_department_publications (
  publication_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  published_version text not null,
  registry_entry_id text not null,
  quality_guard_passed boolean not null default false,
  immune_system_passed boolean not null default false,
  published_at timestamptz not null default now(),
  published_by text
);

create table if not exists public.studio_world_department_dependencies (
  dependency_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  depends_on_department_id text not null,
  dependency_kind text not null default 'upstream',
  created_at timestamptz not null default now(),
  unique (department_id, depends_on_department_id, dependency_kind)
);

create table if not exists public.studio_world_department_access_policies (
  policy_id text primary key,
  department_id text not null references public.studio_world_canonical_departments (department_id) on delete cascade,
  access_class text not null,
  admin_only boolean not null default true,
  founder_accessible boolean not null default false,
  system_accessible boolean not null default true,
  permitted_roles text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Industry pack template classification (shared HQ vs industry-unique) — only when table exists
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_department_templates'
  ) then
    alter table public.studio_department_templates
      add column if not exists department_class text not null default 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE';
  end if;
end $$;

comment on table public.studio_world_canonical_departments is
  'CanonicalStudioWorldDepartmentRegistry™ — global Studio World infrastructure; no organizationId ownership.';

create index if not exists studio_world_canonical_departments_category_idx
  on public.studio_world_canonical_departments (category, lifecycle_state);

create index if not exists studio_world_department_renders_dept_idx
  on public.studio_world_department_renders (department_id, render_kind, revision);

create index if not exists studio_world_department_publications_dept_idx
  on public.studio_world_department_publications (department_id, published_at desc);

alter table public.studio_world_canonical_departments enable row level security;
alter table public.studio_world_department_charters enable row level security;
alter table public.studio_world_department_versions enable row level security;
alter table public.studio_world_department_blueprints enable row level security;
alter table public.studio_world_department_renders enable row level security;
alter table public.studio_world_department_composition_packs enable row level security;
alter table public.studio_world_department_socket_profiles enable row level security;
alter table public.studio_world_department_publications enable row level security;
alter table public.studio_world_department_dependencies enable row level security;
alter table public.studio_world_department_access_policies enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'studio_world_canonical_departments_service_role') then
    create policy "studio_world_canonical_departments_service_role"
      on public.studio_world_canonical_departments for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_charters_service_role') then
    create policy "studio_world_department_charters_service_role"
      on public.studio_world_department_charters for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_versions_service_role') then
    create policy "studio_world_department_versions_service_role"
      on public.studio_world_department_versions for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_blueprints_service_role') then
    create policy "studio_world_department_blueprints_service_role"
      on public.studio_world_department_blueprints for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_renders_service_role') then
    create policy "studio_world_department_renders_service_role"
      on public.studio_world_department_renders for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_composition_packs_service_role') then
    create policy "studio_world_department_composition_packs_service_role"
      on public.studio_world_department_composition_packs for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_socket_profiles_service_role') then
    create policy "studio_world_department_socket_profiles_service_role"
      on public.studio_world_department_socket_profiles for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_publications_service_role') then
    create policy "studio_world_department_publications_service_role"
      on public.studio_world_department_publications for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_dependencies_service_role') then
    create policy "studio_world_department_dependencies_service_role"
      on public.studio_world_department_dependencies for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'studio_world_department_access_policies_service_role') then
    create policy "studio_world_department_access_policies_service_role"
      on public.studio_world_department_access_policies for all to service_role using (true) with check (true);
  end if;
end $$;
