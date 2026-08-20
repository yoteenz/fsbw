-- Studio World VP — Campaign 001 pilot + external integration contract v1

-- ─── Takes (candidate generations per shot) ─────────────────────────────────

create table if not exists public.studio_vp_takes (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  shot_id uuid not null references public.studio_vp_shots (id) on delete cascade,
  generation_asset_id uuid references public.studio_vp_generation_assets (id) on delete set null,
  take_key text not null,
  label text,
  sort_order integer not null default 0,
  is_selected boolean not null default false,
  approval_state text not null default 'draft',
  qc_summary jsonb not null default '{}'::jsonb,
  provider_id text,
  model_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, shot_id, take_key)
);

create index if not exists studio_vp_takes_shot_idx on public.studio_vp_takes (shot_id, sort_order);

-- ─── External engagement provisioning (idempotent) ────────────────────────────

create table if not exists public.studio_vp_external_engagements (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  external_system text not null,
  external_engagement_id text not null,
  external_project_id text,
  external_client_id text,
  client_visible_project_id text,
  campaign_id uuid references public.studio_vp_campaigns (id) on delete set null,
  brand_id uuid references public.studio_vp_brands (id) on delete set null,
  engagement_type text,
  service_type text,
  provision_payload jsonb not null default '{}'::jsonb,
  status text not null default 'provisioned',
  current_phase text not null default 'initialized',
  brand_setup_required boolean not null default false,
  contract_version text not null default 'v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, external_system, external_engagement_id)
);

create index if not exists studio_vp_external_engagements_campaign_idx
  on public.studio_vp_external_engagements (campaign_id);

-- ─── Client-safe reviews ────────────────────────────────────────────────────

create table if not exists public.studio_vp_client_reviews (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  review_key text not null,
  review_type text not null default 'direction',
  title text not null,
  client_safe_description text not null,
  preview_assets jsonb not null default '[]'::jsonb,
  allowed_actions jsonb not null default '["approve","request_revision"]'::jsonb,
  status text not null default 'pending',
  client_visible boolean not null default true,
  decision text,
  decision_notes text,
  submitted_by_system text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, campaign_id, review_key)
);

-- ─── Client-safe activity feed ────────────────────────────────────────────────

create table if not exists public.studio_vp_client_activity (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid not null references public.studio_vp_campaigns (id) on delete cascade,
  activity_key text not null,
  activity_type text not null,
  client_safe_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (org_id, campaign_id, activity_key)
);

create index if not exists studio_vp_client_activity_campaign_idx
  on public.studio_vp_client_activity (campaign_id, created_at desc);

-- ─── Production events (webhook readiness) ────────────────────────────────────

create table if not exists public.studio_vp_production_events (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  campaign_id uuid references public.studio_vp_campaigns (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'recorded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_vp_production_events_campaign_idx
  on public.studio_vp_production_events (campaign_id, created_at desc);

-- ─── Extend existing tables ─────────────────────────────────────────────────

alter table public.studio_vp_campaigns
  add column if not exists current_phase text not null default 'brief',
  add column if not exists audio_plan jsonb not null default '{}'::jsonb,
  add column if not exists director_external_status text,
  add column if not exists reference_pack_version jsonb not null default '{}'::jsonb;

alter table public.studio_vp_shots
  add column if not exists identity_criticality text default 'medium',
  add column if not exists product_criticality text default 'low',
  add column if not exists environment_criticality text default 'medium',
  add column if not exists editorial_note text,
  add column if not exists capability_required text,
  add column if not exists action_direction text,
  add column if not exists emotional_direction text;

alter table public.studio_vp_character_reference_packs
  add column if not exists slot_states jsonb not null default '{}'::jsonb;

alter table public.studio_vp_deliverables
  add column if not exists client_visible boolean not null default false,
  add column if not exists poster_url text,
  add column if not exists caption_placeholder text,
  add column if not exists production_notes text;

alter table public.studio_vp_generation_assets
  add column if not exists promoted_to_canon boolean not null default false,
  add column if not exists client_visible boolean not null default false;

-- RLS for new tables
alter table public.studio_vp_takes enable row level security;
alter table public.studio_vp_external_engagements enable row level security;
alter table public.studio_vp_client_reviews enable row level security;
alter table public.studio_vp_client_activity enable row level security;
alter table public.studio_vp_production_events enable row level security;

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'studio_vp_takes', 'studio_vp_external_engagements', 'studio_vp_client_reviews',
    'studio_vp_client_activity', 'studio_vp_production_events'
  ] loop
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      tbl || '_service_role', tbl
    );
  end loop;
end $$;

comment on table public.studio_vp_external_engagements is
  'Idempotent external campaign provisioning — contract v1';
