-- Canonical Studio World departments — global infrastructure (not tenant-scoped)
create table if not exists public.studio_canonical_departments (
  department_id text primary key,
  display_name text not null,
  purpose text not null,
  route_path text not null,
  scope text not null default 'studio-world-global',
  registry_version text not null default 'canonical-studio-world.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_company_hq_instances (
  instance_id text primary key,
  organization_id text not null,
  industry_pack_id text not null,
  industry_pack_option_id text not null,
  status text not null default 'draft',
  editable_layers jsonb not null default '[]'::jsonb,
  registry_version text not null default 'canonical-studio-world.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_company_hq_instances_org_idx
  on public.studio_company_hq_instances (organization_id, status);

alter table public.studio_canonical_departments enable row level security;
alter table public.studio_company_hq_instances enable row level security;

comment on table public.studio_canonical_departments is
  'Studio World canonical departments — exist once globally; companies never generate their own copies.';
comment on table public.studio_company_hq_instances is
  'Founder Company HQ — tenant layer below Industry Packs; only this layer is company-editable.';
