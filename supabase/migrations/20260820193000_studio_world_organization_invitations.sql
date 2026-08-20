-- Studio World — organization invitations (partner/agency onboarding)

create table if not exists public.studio_world_organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.studio_world_organizations (id) on delete cascade,
  invited_email text not null,
  inviter_email text not null,
  proposed_role text not null,
  token_hash text not null,
  status text not null default 'pending',
  entitlement_scope jsonb not null default '{}'::jsonb,
  client_scope jsonb,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  accepted_by_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_world_org_invitations_token_hash_unique unique (token_hash),
  constraint studio_world_org_invitations_status_check check (
    status in ('pending', 'accepted', 'expired', 'revoked', 'declined')
  )
);

create index if not exists studio_world_org_invitations_org_idx
  on public.studio_world_organization_invitations (organization_id, status);

create index if not exists studio_world_org_invitations_email_idx
  on public.studio_world_organization_invitations (invited_email, status);

alter table public.studio_world_organization_invitations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'studio_world_organization_invitations'
      and policyname = 'studio_world_organization_invitations_service_role'
  ) then
    create policy studio_world_organization_invitations_service_role
      on public.studio_world_organization_invitations
      for all to service_role using (true) with check (true);
  end if;
end $$;

comment on table public.studio_world_organization_invitations is
  'Secure organization invitations — token stored as SHA-256 hash only';
