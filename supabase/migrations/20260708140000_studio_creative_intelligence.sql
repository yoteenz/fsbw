-- Creative Intelligence Engine™ — decision persistence + learning loop

create table if not exists public.studio_creative_intelligence_decisions (
  id uuid primary key,
  org_id text not null,
  recommended_strategy text not null,
  confidence_score integer not null default 0,
  risk_level text not null default 'medium',
  should_generate boolean not null default true,
  intent jsonb not null default '{}'::jsonb,
  decision_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_cie_decisions_org_idx
  on public.studio_creative_intelligence_decisions (org_id, created_at desc);

create table if not exists public.studio_creative_intelligence_learning_signals (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  decision_id uuid references public.studio_creative_intelligence_decisions (id) on delete set null,
  asset_id text,
  action text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_cie_learning_org_idx
  on public.studio_creative_intelligence_learning_signals (org_id, created_at desc);

alter table public.studio_creative_intelligence_decisions enable row level security;
alter table public.studio_creative_intelligence_learning_signals enable row level security;

create policy "studio_cie_decisions_service_role"
  on public.studio_creative_intelligence_decisions for all to service_role using (true) with check (true);

create policy "studio_cie_learning_service_role"
  on public.studio_creative_intelligence_learning_signals for all to service_role using (true) with check (true);
