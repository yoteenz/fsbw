-- Studio World Resident Life OS — Foundation2 (extends Season 1 resident tables; do not edit foundation1 migration)

create table if not exists public.studio_world_resident_life_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  world_id text not null,
  organization_id text not null,
  resident_ids text[] not null default '{}',
  location_id text,
  project_id text,
  visibility text not null default 'OFFICE_KNOWN',
  source text not null default 'simulation',
  payload jsonb not null default '{}'::jsonb,
  causal_parent_event_id text,
  truth_status text not null default 'AUTHORITATIVE',
  canon_version text not null default 'foundation2-v1',
  created_at timestamptz not null default now(),
  constraint studio_world_resident_life_events_event_id_unique unique (event_id)
);

create index if not exists studio_world_resident_life_events_residents_idx
  on public.studio_world_resident_life_events using gin (resident_ids);
create index if not exists studio_world_resident_life_events_occurred_idx
  on public.studio_world_resident_life_events (occurred_at desc);

create table if not exists public.studio_world_resident_current_state (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  presence text not null,
  location_id text not null,
  location_label text not null,
  movement_state text not null default 'STATIONARY',
  activity text not null,
  current_intent text not null,
  availability text not null default 'OPEN',
  state_payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_need_state (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  need_levels jsonb not null default '{}'::jsonb,
  emotional_levels jsonb not null default '{}'::jsonb,
  causes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_memories (
  id uuid primary key default gen_random_uuid(),
  memory_id text not null,
  resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  memory_class text not null,
  summary text not null,
  significance numeric not null default 0.5,
  emotional_intensity numeric not null default 0.5,
  resolution_state text not null default 'OPEN',
  source_event_id text,
  visibility text not null default 'PRIVATE',
  formed_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  constraint studio_world_resident_memories_memory_id_unique unique (memory_id)
);

create index if not exists studio_world_resident_memories_resident_idx
  on public.studio_world_resident_memories (resident_id, formed_at desc);

create table if not exists public.studio_world_resident_beliefs (
  id uuid primary key default gen_random_uuid(),
  resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  subject_key text not null,
  knowledge_state text not null,
  belief_summary text not null,
  confidence numeric not null default 0.5,
  source_event_id text,
  updated_at timestamptz not null default now()
);

create index if not exists studio_world_resident_beliefs_resident_idx
  on public.studio_world_resident_beliefs (resident_id);

create table if not exists public.studio_world_resident_social_truth_events (
  truth_event_id text primary key,
  summary text not null,
  authoritative_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  visibility text not null,
  direct_witness_ids text[] not null default '{}',
  disclosed_to text[] not null default '{}',
  founder_knows boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_rumor_fragments (
  rumor_id text primary key,
  truth_event_id text not null references public.studio_world_resident_social_truth_events (truth_event_id) on delete cascade,
  holder_id text not null,
  holder_kind text not null default 'resident',
  version_summary text not null,
  accuracy numeric not null default 0.5,
  received_from_id text,
  mutated_from_rumor_id text,
  received_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_interventions (
  intervention_id text primary key,
  kind text not null,
  target_resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  directive text not null,
  reason text,
  at timestamptz not null,
  duration_minutes integer,
  resident_aware boolean not null default false,
  state_before_summary text not null,
  state_after_summary text,
  audit jsonb not null default '{}'::jsonb
);

create table if not exists public.studio_world_resident_career_state (
  resident_id text primary key references public.studio_world_residents (resident_id) on delete cascade,
  career_state text not null,
  title text not null,
  department text not null,
  scope_summary text,
  employment_active boolean not null default true,
  notice_period_end date,
  alumni_since timestamptz,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_world_resident_decisions (
  decision_id text primary key,
  resident_id text not null references public.studio_world_residents (resident_id) on delete cascade,
  decision_summary text not null,
  disposition text not null,
  reasoning_summary text not null,
  founder_required boolean not null default false,
  recorded_at timestamptz not null default now(),
  inputs jsonb not null default '[]'::jsonb
);

create table if not exists public.studio_world_organizational_memory (
  org_memory_id text primary key,
  organization_id text not null,
  summary text not null,
  source text not null,
  confidence numeric not null default 0.5,
  scope text not null,
  recorded_at timestamptz not null,
  applicable_until timestamptz,
  superseded_by text
);

create table if not exists public.studio_world_workforce_training_canon (
  canon_id text primary key,
  company_id text not null,
  domain text not null,
  title text not null,
  source text not null,
  version text not null,
  approval_status text not null default 'draft',
  effective_date date not null,
  superseded_by text,
  role_scope text[] not null default '{}',
  body_summary text not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.studio_world_human_employee_learning_profiles (
  employee_id text primary key,
  company_id text not null,
  role text not null,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.studio_world_resident_life_events enable row level security;
alter table public.studio_world_resident_current_state enable row level security;
alter table public.studio_world_resident_need_state enable row level security;
alter table public.studio_world_resident_memories enable row level security;
alter table public.studio_world_resident_beliefs enable row level security;
alter table public.studio_world_resident_social_truth_events enable row level security;
alter table public.studio_world_resident_rumor_fragments enable row level security;
alter table public.studio_world_resident_interventions enable row level security;
alter table public.studio_world_resident_career_state enable row level security;
alter table public.studio_world_resident_decisions enable row level security;
alter table public.studio_world_organizational_memory enable row level security;
alter table public.studio_world_workforce_training_canon enable row level security;
alter table public.studio_world_human_employee_learning_profiles enable row level security;

comment on table public.studio_world_resident_life_events is
  'Append-only resident life simulation events; materialized state lives in companion tables.';
