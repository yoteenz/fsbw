-- Studio OS workspace module state (user edits, cloud source of truth).
-- Demo/mock payloads stay in app memory — not stored here by default.

create table if not exists public.studio_os_workspace_state (
  workspace_id text not null,
  state_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, state_key)
);

create index if not exists studio_os_workspace_state_updated_at_idx
  on public.studio_os_workspace_state (updated_at desc);

comment on table public.studio_os_workspace_state is
  'Per-workspace Studio OS module state (admin edits). Service role via API only.';

alter table public.studio_os_workspace_state enable row level security;

create policy "studio_os_workspace_state_service_role_all"
  on public.studio_os_workspace_state
  for all
  to service_role
  using (true)
  with check (true);
