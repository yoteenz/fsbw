-- Studio OS organization membership — maps admin operators to a single organization HQ.
-- Portfolio owners may access Studio Administration and switch organizations.

create table if not exists public.studio_os_org_memberships (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  workspace_id text not null,
  is_portfolio_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_os_org_memberships_admin_email_unique unique (admin_email)
);

create index if not exists studio_os_org_memberships_workspace_id_idx
  on public.studio_os_org_memberships (workspace_id);

comment on table public.studio_os_org_memberships is
  'Studio OS admin organization scope — one row per admin email. Portfolio owners may switch orgs in UI.';

-- Default founder / portfolio owner (idempotent seed)
insert into public.studio_os_org_memberships (admin_email, workspace_id, is_portfolio_owner)
values ('kateenaarmstrong@gmail.com', 'frontal-slayer', true)
on conflict (admin_email) do update
  set workspace_id = excluded.workspace_id,
      is_portfolio_owner = excluded.is_portfolio_owner,
      updated_at = now();

alter table public.studio_os_org_memberships enable row level security;

-- Service role / admin API only — no direct client reads in Phase 1
create policy "studio_os_org_memberships_service_role_all"
  on public.studio_os_org_memberships
  for all
  using (false)
  with check (false);
