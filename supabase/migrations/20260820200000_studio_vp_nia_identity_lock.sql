-- Nia Identity Lock — Reference Pack V1 lifecycle, candidates, campaign identity gate

-- ─── Reference pack extensions ───────────────────────────────────────────────

alter table public.studio_vp_character_reference_packs
  add column if not exists primary_anchor_asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  add column if not exists identity_invariants jsonb not null default '{}'::jsonb,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text,
  add column if not exists openart_character_status text not null default 'external',
  add column if not exists provider_mappings jsonb not null default '{}'::jsonb;

comment on column public.studio_vp_character_reference_packs.openart_character_status is
  'OpenArt persistent character: programmatic | external | not_used';

-- ─── Reference pack candidates (provenance preserved on reject) ───────────────

create table if not exists public.studio_vp_reference_pack_candidates (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  reference_pack_id uuid not null references public.studio_vp_character_reference_packs (id) on delete cascade,
  slot_key text not null,
  asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  media_url text,
  provider_id text not null default 'upload',
  model_id text,
  reference_lineage jsonb not null default '[]'::jsonb,
  qc jsonb not null default '{}'::jsonb,
  status text not null default 'candidate',
  rejection_reason text,
  operator text,
  billing_owner_org_id text,
  estimated_cost_usd numeric(12, 4),
  actual_cost_usd numeric(12, 4),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_vp_ref_pack_candidates_pack_slot_idx
  on public.studio_vp_reference_pack_candidates (reference_pack_id, slot_key, status);

-- ─── Campaign identity gate ───────────────────────────────────────────────────

alter table public.studio_vp_campaigns
  add column if not exists identity_gate_status text not null default 'blocked',
  add column if not exists identity_source_pack_id uuid references public.studio_vp_character_reference_packs (id) on delete set null,
  add column if not exists identity_blocker_reason text not null default 'IDENTITY FOUNDATION REQUIRED';

comment on column public.studio_vp_campaigns.identity_gate_status is
  'blocked until Reference Pack V1 locked; pass enables identity-dependent precision motion';

-- Link generation assets to reference pack slots when used as canon refs
alter table public.studio_vp_generation_assets
  add column if not exists reference_pack_id uuid references public.studio_vp_character_reference_packs (id) on delete set null,
  add column if not exists reference_pack_slot text;

-- RLS
alter table public.studio_vp_reference_pack_candidates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'studio_vp_reference_pack_candidates'
      and policyname = 'studio_vp_reference_pack_candidates_service_role'
  ) then
    create policy studio_vp_reference_pack_candidates_service_role
      on public.studio_vp_reference_pack_candidates
      for all to service_role using (true) with check (true);
  end if;
end $$;

comment on table public.studio_vp_reference_pack_candidates is
  'Reference Pack V1 slot candidates — rejected rows retain provenance for audit';
