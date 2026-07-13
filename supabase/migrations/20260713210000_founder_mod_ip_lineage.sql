-- Founder Mod IP, licensing, royalties — creator-safe persistence

create table if not exists public.founder_created_mods (
  custom_scene_id text primary key,
  display_name text not null,
  protected_name text not null,
  content_class text not null default 'FOUNDER_CREATED_MODDED_SCENE',
  creator_organization_id text not null,
  creator_founder_id text not null,
  source_industry_pack_id text not null,
  source_department_template_id text,
  version text not null default '1.0.0',
  private_status boolean not null default true,
  default_availability boolean not null default false,
  marketplace_eligibility boolean not null default false,
  licensing_status text not null default 'unlicensed',
  royalty_policy_id text,
  brand_neutralization_required boolean not null default true,
  publication_status text not null default 'PRIVATE_ONLY',
  mod_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_mod_versions (
  version_id text primary key,
  custom_scene_id text not null references public.founder_created_mods (custom_scene_id) on delete cascade,
  version_number text not null,
  changelog text,
  created_at timestamptz not null default now(),
  unique (custom_scene_id, version_number)
);

create table if not exists public.founder_mod_lineage (
  lineage_id text primary key,
  custom_scene_id text not null references public.founder_created_mods (custom_scene_id) on delete cascade,
  root_template_id text not null,
  root_template_version text not null,
  creator_organization_id text not null,
  creator_mod_id text not null,
  creator_mod_version text not null,
  marketplace_listing_id text,
  license_id text,
  buyer_organization_id text,
  installed_instance_id text,
  installed_at timestamptz,
  derivative_revision integer not null default 0,
  attribution_required boolean not null default true,
  royalty_obligation boolean not null default false,
  update_entitlement boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.founder_mod_licenses (
  license_id text primary key,
  license_type text not null,
  custom_scene_id text not null references public.founder_created_mods (custom_scene_id) on delete cascade,
  buyer_organization_id text not null,
  allowed_installations integer not null default 1,
  allowed_modifications boolean not null default true,
  resale_rights boolean not null default false,
  derivative_rights boolean not null default false,
  attribution_required boolean not null default true,
  update_access boolean not null default true,
  transferability boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_mod_listings (
  listing_id text primary key,
  custom_scene_id text not null references public.founder_created_mods (custom_scene_id) on delete cascade,
  creator_organization_id text not null,
  neutral_display_name text not null,
  compatible_pack_ids text[] not null default '{}',
  price_cents integer,
  currency text not null default 'USD',
  certification_status text not null default 'PRIVATE_ONLY',
  royalty_policy_id text,
  listing_version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_mod_installations (
  installation_id text primary key,
  listing_id text not null references public.marketplace_mod_listings (listing_id) on delete cascade,
  license_id text not null references public.founder_mod_licenses (license_id) on delete cascade,
  buyer_organization_id text not null,
  base_pack_id text not null,
  neutral_package_id text not null,
  installed_at timestamptz not null default now(),
  reuse_certified_blueprint boolean not null default true,
  charge_credits_for jsonb not null default '[]'::jsonb
);

create table if not exists public.creator_royalty_policies (
  royalty_policy_id text primary key,
  creator_organization_id text not null,
  listing_id text,
  creator_royalty_type text not null,
  creator_royalty_rate numeric,
  fixed_creator_amount numeric,
  net_revenue_basis text not null default 'sale_price_minus_platform_fee',
  currency text not null default 'USD',
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  policy_payload jsonb not null default '{}'::jsonb
);

create table if not exists public.creator_royalty_ledger (
  ledger_id text primary key,
  royalty_policy_id text not null references public.creator_royalty_policies (royalty_policy_id),
  listing_id text not null,
  license_id text not null,
  buyer_organization_id text not null,
  sale_price numeric not null,
  platform_fee numeric not null,
  creator_royalty_amount numeric not null,
  currency text not null default 'USD',
  payout_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.content_rights_records (
  rights_record_id text primary key,
  rights_holder text not null,
  rights_granted jsonb not null default '[]'::jsonb,
  territory text not null,
  duration text not null,
  compensation text,
  royalty_terms text,
  attribution boolean not null default true,
  exclusivity boolean not null default false,
  modification_rights boolean not null default false,
  sublicensing_rights boolean not null default false,
  termination_terms text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.official_pack_content_bindings (
  binding_id text primary key,
  pack_id text not null,
  content_id text not null,
  content_class text not null,
  binding_kind text not null default 'official-default',
  created_at timestamptz not null default now(),
  unique (pack_id, content_id)
);

create table if not exists public.mod_certifications (
  certification_id text primary key,
  custom_scene_id text not null references public.founder_created_mods (custom_scene_id) on delete cascade,
  outcome text not null,
  checks jsonb not null default '[]'::jsonb,
  certified_at timestamptz,
  certified_by text
);

create index if not exists founder_created_mods_creator_idx
  on public.founder_created_mods (creator_organization_id);

create index if not exists founder_mod_lineage_buyer_idx
  on public.founder_mod_lineage (buyer_organization_id, custom_scene_id);

create index if not exists creator_royalty_ledger_creator_idx
  on public.creator_royalty_ledger (royalty_policy_id, payout_status);

alter table public.founder_created_mods enable row level security;
alter table public.founder_mod_versions enable row level security;
alter table public.founder_mod_lineage enable row level security;
alter table public.founder_mod_licenses enable row level security;
alter table public.marketplace_mod_listings enable row level security;
alter table public.marketplace_mod_installations enable row level security;
alter table public.creator_royalty_policies enable row level security;
alter table public.creator_royalty_ledger enable row level security;
alter table public.content_rights_records enable row level security;
alter table public.official_pack_content_bindings enable row level security;
alter table public.mod_certifications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'founder_created_mods_service_role') then
    create policy "founder_created_mods_service_role"
      on public.founder_created_mods for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'founder_mod_versions_service_role') then
    create policy "founder_mod_versions_service_role"
      on public.founder_mod_versions for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'founder_mod_lineage_service_role') then
    create policy "founder_mod_lineage_service_role"
      on public.founder_mod_lineage for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'founder_mod_licenses_service_role') then
    create policy "founder_mod_licenses_service_role"
      on public.founder_mod_licenses for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'marketplace_mod_listings_service_role') then
    create policy "marketplace_mod_listings_service_role"
      on public.marketplace_mod_listings for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'marketplace_mod_installations_service_role') then
    create policy "marketplace_mod_installations_service_role"
      on public.marketplace_mod_installations for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'creator_royalty_policies_service_role') then
    create policy "creator_royalty_policies_service_role"
      on public.creator_royalty_policies for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'creator_royalty_ledger_service_role') then
    create policy "creator_royalty_ledger_service_role"
      on public.creator_royalty_ledger for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'content_rights_records_service_role') then
    create policy "content_rights_records_service_role"
      on public.content_rights_records for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'official_pack_content_bindings_service_role') then
    create policy "official_pack_content_bindings_service_role"
      on public.official_pack_content_bindings for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'mod_certifications_service_role') then
    create policy "mod_certifications_service_role"
      on public.mod_certifications for all to service_role using (true) with check (true);
  end if;
end $$;

comment on table public.founder_created_mods is
  'Founder-created modded scenes — creator-owned IP, never official Industry Pack defaults.';
