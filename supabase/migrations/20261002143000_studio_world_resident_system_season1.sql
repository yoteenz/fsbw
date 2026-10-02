-- Studio World Resident / Cast System — Season 1 foundation (canon above UE embodiment)

create table if not exists public.studio_world_residents (
  id uuid primary key default gen_random_uuid(),
  resident_id text not null,
  season integer not null default 1,
  display_name text not null,
  sort_order integer not null default 0,
  identity_status text not null default 'canonical',
  core_world_role text not null,
  fabrication_status text not null,
  canon_lifecycle_status text not null default 'approved',
  canon_version text not null default 'v1.0.0',
  canonical_identity jsonb not null default '{}'::jsonb,
  embodiment_targets jsonb not null default '[]'::jsonb,
  version_history jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_residents_resident_id_unique unique (resident_id),
  constraint studio_world_residents_identity_status_check check (
    identity_status in ('canonical', 'guest', 'deprecated')
  )
);

create index if not exists studio_world_residents_season_idx
  on public.studio_world_residents (season, sort_order);

create table if not exists public.studio_world_resident_relationships (
  id uuid primary key default gen_random_uuid(),
  edge_id text not null,
  person_a_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  person_b_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  relationship_type text not null,
  label text not null,
  mutual boolean not null default true,
  trust_level smallint not null default 3,
  friction_level smallint not null default 2,
  chemistry_level smallint not null default 3,
  loyalty_level smallint not null default 3,
  public_dynamic text,
  private_dynamic text,
  current_arc text,
  historical_events jsonb not null default '[]'::jsonb,
  unresolved_tension jsonb not null default '[]'::jsonb,
  documentary_social_value text,
  canon_notes text,
  asymmetric_notes text,
  version text not null default 'v1.0.0',
  last_updated timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint studio_world_resident_relationships_edge_id_unique unique (edge_id)
);

create index if not exists studio_world_resident_relationships_a_idx
  on public.studio_world_resident_relationships (person_a_resident_id);
create index if not exists studio_world_resident_relationships_b_idx
  on public.studio_world_resident_relationships (person_b_resident_id);

create table if not exists public.studio_world_resident_cast_role_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_id text not null,
  resident_id text not null references public.studio_world_residents (resident_id) on delete restrict,
  client_or_company_id text,
  role_name text not null,
  display_name_if_different text,
  role_type text not null,
  contract_payload jsonb not null default '{}'::jsonb,
  approval_status text not null default 'draft',
  version text not null default 'v1.0.0',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_resident_cast_contracts_contract_id_unique unique (contract_id)
);

create index if not exists studio_world_resident_cast_contracts_resident_idx
  on public.studio_world_resident_cast_role_contracts (resident_id);

create table if not exists public.studio_world_resident_access_grants (
  id uuid primary key default gen_random_uuid(),
  grant_id text not null,
  resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  organization_id uuid references public.studio_world_organizations (id) on delete cascade,
  client_id uuid references public.studio_world_clients (id) on delete cascade,
  grant_kind text not null,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_resident_access_grants_grant_id_unique unique (grant_id)
);

create table if not exists public.studio_world_resident_documentary_profiles (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  version text not null default 'v1.0.0',
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_fabrication_requirements (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  requirements jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.studio_world_residents enable row level security;
alter table public.studio_world_resident_relationships enable row level security;
alter table public.studio_world_resident_cast_role_contracts enable row level security;
alter table public.studio_world_resident_access_grants enable row level security;
alter table public.studio_world_resident_documentary_profiles enable row level security;
alter table public.studio_world_resident_fabrication_requirements enable row level security;

comment on table public.studio_world_residents is
  'Studio World canonical residents — identity persists above UE/MetaHuman embodiment.';

-- Seed Season 1 resident IDs (design canon lives in repo registry; DB holds stable IDs for future API sync)
insert into public.studio_world_residents (resident_id, season, display_name, sort_order, core_world_role, fabrication_status, canonical_identity)
values
  ('SW-RESIDENT-001', 1, 'Etta Vale', 1, 'Founding Presence / Creative Director / Face of Studio World', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-002', 1, 'Zuri Hale', 2, 'Strategy Director / Client Intelligence / Office Guide', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-003', 1, 'Jules Mercer', 3, 'Front Office / Concierge / Tenant Relations', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-004', 1, 'Noa Kline', 4, 'Systems Architect / Studio OS Liaison', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-005', 1, 'Caspian Reed', 5, 'World Director / Environmental Storyteller', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-006', 1, 'Iona Wells', 6, 'Fabrication Lead / Character Lab / Image Construction', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-007', 1, 'Marlowe Saint', 7, 'Casting Director / Performance Design / Persona Mapping', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb),
  ('SW-RESIDENT-008', 1, 'Elio Vahn', 8, 'Tenancy / Expansion / Business Development', 'CANON_APPROVED', '{"source":"season1-foundation-sprint"}'::jsonb)
on conflict (resident_id) do update set
  display_name = excluded.display_name,
  core_world_role = excluded.core_world_role,
  fabrication_status = excluded.fabrication_status,
  updated_at = now();
