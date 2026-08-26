-- P0.VR.3E / P0.VR.3L.1 — Studio World implementation snapshot storage (canonical screenshot authority)

create table if not exists public.studio_world_implementation_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  route text not null,
  viewport text not null check (viewport in ('MOBILE', 'TABLET', 'DESKTOP')),
  snapshot_kind text not null check (snapshot_kind in ('SOURCE_SIBLING', 'DERIVED_DRAFT')),
  label text not null,
  storage_path text not null,
  source_commit text,
  target_id text,
  authorship_id text,
  snapshot_id text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING', 'CAPTURED', 'FAILED')),
  qa_passed boolean default false,
  captured_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_studio_world_impl_snapshots_project_route
  on public.studio_world_implementation_snapshots (project_id, route);

create index if not exists idx_studio_world_impl_snapshots_target
  on public.studio_world_implementation_snapshots (target_id)
  where target_id is not null;

alter table public.studio_world_implementation_snapshots enable row level security;

create policy "studio_world_impl_snapshots_admin_read"
  on public.studio_world_implementation_snapshots
  for select
  to authenticated
  using (true);

create policy "studio_world_impl_snapshots_admin_write"
  on public.studio_world_implementation_snapshots
  for all
  to authenticated
  using (true)
  with check (true);
