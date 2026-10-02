-- Studio World Resident Life OS — Runtime Simulation1 (extends Foundation2; do not edit prior migrations)

create table if not exists public.studio_world_resident_simulation_ticks (
  id uuid primary key default gen_random_uuid(),
  world_id text not null,
  organization_id text not null,
  tick_window_id text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  tick_kind text not null default 'world',
  result_summary text,
  metadata jsonb not null default '{}'::jsonb,
  constraint studio_world_resident_simulation_ticks_window_unique unique (world_id, organization_id, tick_window_id)
);

create index if not exists studio_world_resident_simulation_ticks_completed_idx
  on public.studio_world_resident_simulation_ticks (completed_at desc);

create table if not exists public.studio_world_resident_requests (
  request_id text primary key,
  from_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  to_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  request text not null,
  why text not null,
  status text not null default 'OPEN',
  priority text not null default 'NORMAL',
  blocks jsonb not null default '[]'::jsonb,
  at timestamptz not null,
  resolved_at timestamptz,
  resolution_summary text
);

create table if not exists public.studio_world_resident_world_stories (
  story_id text primary key,
  story_type text not null,
  summary text not null,
  grounded_event_id text not null,
  resident_ids text[] not null default '{}',
  at timestamptz not null
);

create table if not exists public.studio_world_resident_private_disclosures (
  disclosure_id text primary key,
  from_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  subject text not null,
  disclosure_scope text not null,
  sharing_permission text not null,
  confidentiality_expectation text not null,
  trust_impact_if_violated text not null,
  at timestamptz not null
);

create table if not exists public.studio_world_resident_pairing_outcomes (
  pair_key text primary key,
  resident_a_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  resident_b_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  task_type text not null,
  outcome_kind text not null,
  notes text not null default ''
);

create table if not exists public.studio_world_resident_work_now (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_career_requests (
  career_request_id text primary key,
  resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  request_kind text not null,
  summary text not null,
  status text not null default 'OPEN',
  founder_approval_required boolean not null default true,
  at timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.studio_world_resident_relationship_life (
  id uuid primary key default gen_random_uuid(),
  resident_a_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  resident_b_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  dimensions jsonb not null default '{}'::jsonb,
  sentiments jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint studio_world_resident_relationship_life_pair_unique unique (resident_a_id, resident_b_id)
);

alter table public.studio_world_resident_simulation_ticks enable row level security;
alter table public.studio_world_resident_requests enable row level security;
alter table public.studio_world_resident_world_stories enable row level security;
alter table public.studio_world_resident_private_disclosures enable row level security;
alter table public.studio_world_resident_pairing_outcomes enable row level security;
alter table public.studio_world_resident_work_now enable row level security;
alter table public.studio_world_resident_career_requests enable row level security;
alter table public.studio_world_resident_relationship_life enable row level security;

comment on table public.studio_world_resident_simulation_ticks is
  'Idempotent background tick ledger — one row per tick window per world/org.';
