-- Studio Asset Registry™ v1 — Supabase source of truth
-- Engine: studio.asset-registry.v1

create table if not exists public.studio_asset_registry_assets (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  name text not null,
  category text not null,
  department_id text,
  workspace_scene_id text,
  scene_id text,
  generation_pack_id text,
  tags text[] not null default '{}',
  materials text[] not null default '{}',
  lighting_profile text,
  camera_profile text,
  resolution text,
  aspect_ratio text,
  generation_cost numeric(12, 4) not null default 0,
  generation_provider text,
  generation_model text,
  prompt_version text,
  blueprint_version text,
  created_by_type text not null default 'pipeline',
  created_by_id text,
  usage_count integer not null default 0,
  marketplace_eligible boolean not null default false,
  favorite boolean not null default false,
  archived boolean not null default false,
  artifact_url text,
  reuse_category text,
  similarity_traits jsonb not null default '{}'::jsonb,
  similarity_embedding_ref text,
  metadata jsonb not null default '{}'::jsonb,
  current_version integer not null default 1,
  search_document tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.studio_asset_registry_refresh_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document := to_tsvector(
    'simple',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.category, '') || ' ' ||
    coalesce(new.department_id, '') || ' ' ||
    coalesce(new.workspace_scene_id, '') || ' ' ||
    coalesce(new.reuse_category, '') || ' ' ||
    coalesce(array_to_string(new.tags, ' '), '') || ' ' ||
    coalesce(array_to_string(new.materials, ' '), '')
  );
  return new;
end;
$$;

drop trigger if exists studio_asset_registry_assets_search_trg on public.studio_asset_registry_assets;
create trigger studio_asset_registry_assets_search_trg
  before insert or update on public.studio_asset_registry_assets
  for each row
  execute function public.studio_asset_registry_refresh_search_document();

create index if not exists studio_asset_registry_assets_org_idx
  on public.studio_asset_registry_assets (org_id);

create index if not exists studio_asset_registry_assets_org_category_idx
  on public.studio_asset_registry_assets (org_id, category)
  where archived = false;

create index if not exists studio_asset_registry_assets_tags_gin_idx
  on public.studio_asset_registry_assets using gin (tags);

create index if not exists studio_asset_registry_assets_materials_gin_idx
  on public.studio_asset_registry_assets using gin (materials);

create index if not exists studio_asset_registry_assets_search_idx
  on public.studio_asset_registry_assets using gin (search_document);

create index if not exists studio_asset_registry_assets_reuse_category_idx
  on public.studio_asset_registry_assets (org_id, reuse_category)
  where archived = false and reuse_category is not null;

comment on table public.studio_asset_registry_assets is
  'Studio Asset Registry™ canonical assets — remember-first reuse library.';

-- Version history
create table if not exists public.studio_asset_registry_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.studio_asset_registry_assets (id) on delete cascade,
  org_id text not null,
  version_number integer not null,
  change_summary text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  generation_cost numeric(12, 4),
  generation_provider text,
  generation_model text,
  prompt_version text,
  approved_by text,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique (asset_id, version_number)
);

create index if not exists studio_asset_registry_versions_asset_idx
  on public.studio_asset_registry_versions (asset_id, version_number desc);

-- Relationships: asset↔asset, asset↔department, asset↔scene, asset↔generation_pack
create table if not exists public.studio_asset_registry_relationships (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  from_asset_id uuid not null references public.studio_asset_registry_assets (id) on delete cascade,
  to_asset_id uuid references public.studio_asset_registry_assets (id) on delete cascade,
  relation_type text not null,
  target_kind text not null default 'asset',
  target_ref text,
  weight numeric(5, 4) not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (target_kind in ('asset', 'department', 'scene', 'generation_pack', 'workspace')),
  check (
    (target_kind = 'asset' and to_asset_id is not null)
    or (target_kind <> 'asset' and target_ref is not null)
  )
);

create index if not exists studio_asset_registry_relationships_from_idx
  on public.studio_asset_registry_relationships (from_asset_id);

create index if not exists studio_asset_registry_relationships_to_idx
  on public.studio_asset_registry_relationships (to_asset_id)
  where to_asset_id is not null;

create index if not exists studio_asset_registry_relationships_target_idx
  on public.studio_asset_registry_relationships (org_id, target_kind, target_ref);

-- Usage tracking
create table if not exists public.studio_asset_registry_usage_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.studio_asset_registry_assets (id) on delete cascade,
  org_id text not null,
  event_type text not null default 'reuse',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_asset_registry_usage_asset_idx
  on public.studio_asset_registry_usage_events (asset_id, created_at desc);

-- Similarity search hooks (embedding ref + trait snapshots for future vector index)
create table if not exists public.studio_asset_registry_similarity_hooks (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.studio_asset_registry_assets (id) on delete cascade,
  org_id text not null,
  hook_type text not null default 'traits',
  embedding_ref text,
  traits jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (asset_id)
);

create index if not exists studio_asset_registry_similarity_org_idx
  on public.studio_asset_registry_similarity_hooks (org_id);

-- RLS: service role via API only
alter table public.studio_asset_registry_assets enable row level security;
alter table public.studio_asset_registry_versions enable row level security;
alter table public.studio_asset_registry_relationships enable row level security;
alter table public.studio_asset_registry_usage_events enable row level security;
alter table public.studio_asset_registry_similarity_hooks enable row level security;

create policy "studio_asset_registry_assets_service_role"
  on public.studio_asset_registry_assets for all to service_role using (true) with check (true);

create policy "studio_asset_registry_versions_service_role"
  on public.studio_asset_registry_versions for all to service_role using (true) with check (true);

create policy "studio_asset_registry_relationships_service_role"
  on public.studio_asset_registry_relationships for all to service_role using (true) with check (true);

create policy "studio_asset_registry_usage_service_role"
  on public.studio_asset_registry_usage_events for all to service_role using (true) with check (true);

create policy "studio_asset_registry_similarity_service_role"
  on public.studio_asset_registry_similarity_hooks for all to service_role using (true) with check (true);
