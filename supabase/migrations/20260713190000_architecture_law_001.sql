-- Studio World Architecture Law #001 — UI mount socket registry on department blueprints
create table if not exists public.studio_department_ui_sockets (
  socket_registry_id text primary key,
  department_id text not null,
  organization_id text,
  blueprint_id text,
  law_version text not null default 'architecture-law-001.v1',
  sockets jsonb not null default '[]'::jsonb,
  blueprint_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_department_ui_sockets_dept_idx
  on public.studio_department_ui_sockets (department_id, blueprint_locked);

alter table public.studio_department_ui_sockets enable row level security;

comment on table public.studio_department_ui_sockets is
  'Architecture Law #001 — Blueprint Author UI mount sockets; React runtime mounts live interface after approval.';
