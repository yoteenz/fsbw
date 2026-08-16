-- All In One Enterprises Inc. — Identity & Organization Foundation
-- Apply ONLY to the dedicated All In One Supabase project.
-- DO NOT apply to Frontal Slayer / Build-a-Wig Supabase (hyycomvcaqxxvyrfupes).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.aio_org_type as enum (
    'carrier', 'owner_operator', 'fleet', 'shipper', 'aio_internal', 'partner'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_membership_role as enum (
    'organization_owner', 'organization_admin', 'organization_member', 'shipper_user'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_internal_role as enum (
    'super_admin', 'administrator', 'permitting_specialist', 'compliance_specialist',
    'dispatcher', 'insurance_specialist', 'factoring_specialist', 'brokerage_specialist',
    'support_specialist'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_visibility as enum ('internal', 'customer', 'system');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aio_profiles_email_idx on public.aio_profiles (email);

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table if not exists public.aio_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type public.aio_org_type not null default 'owner_operator',
  business_structure text,
  formation_state text,
  primary_operating_state text,
  status text not null default 'active',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organization memberships
-- ---------------------------------------------------------------------------
create table if not exists public.aio_organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.aio_membership_role not null default 'organization_owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists aio_org_memberships_user_idx on public.aio_organization_memberships (user_id);
create index if not exists aio_org_memberships_org_idx on public.aio_organization_memberships (organization_id);

-- ---------------------------------------------------------------------------
-- Internal staff (All In One employees)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_internal_staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.aio_internal_role not null default 'support_specialist',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auth trigger: create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.aio_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.aio_profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', null),
    coalesce(new.raw_user_meta_data->>'last_name', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists aio_on_auth_user_created on auth.users;
create trigger aio_on_auth_user_created
  after insert on auth.users
  for each row execute function public.aio_handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper functions for RLS
-- ---------------------------------------------------------------------------
create or replace function public.aio_is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.aio_internal_staff s
    where s.user_id = auth.uid() and s.status = 'active'
  );
$$;

create or replace function public.aio_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from public.aio_organization_memberships m
  where m.user_id = auth.uid() and m.status = 'active';
$$;

create or replace function public.aio_internal_role()
returns public.aio_internal_role
language sql
stable
security definer
set search_path = public
as $$
  select s.role from public.aio_internal_staff s
  where s.user_id = auth.uid() and s.status = 'active'
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.aio_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aio_profiles_updated_at on public.aio_profiles;
create trigger aio_profiles_updated_at
  before update on public.aio_profiles
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_organizations_updated_at on public.aio_organizations;
create trigger aio_organizations_updated_at
  before update on public.aio_organizations
  for each row execute function public.aio_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — identity tables
-- ---------------------------------------------------------------------------
alter table public.aio_profiles enable row level security;
alter table public.aio_organizations enable row level security;
alter table public.aio_organization_memberships enable row level security;
alter table public.aio_internal_staff enable row level security;

-- Profiles: own row + internal staff read
create policy aio_profiles_select_own on public.aio_profiles
  for select using (id = auth.uid() or public.aio_is_internal_user());

create policy aio_profiles_update_own on public.aio_profiles
  for update using (id = auth.uid());

-- Organizations: members + internal staff
create policy aio_orgs_select on public.aio_organizations
  for select using (
    id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
  );

create policy aio_orgs_update_members on public.aio_organizations
  for update using (
    id in (
      select m.organization_id from public.aio_organization_memberships m
      where m.user_id = auth.uid()
        and m.status = 'active'
        and m.role in ('organization_owner', 'organization_admin')
    )
  );

create policy aio_orgs_insert_authenticated on public.aio_organizations
  for insert with check (auth.uid() is not null);

-- Memberships
create policy aio_memberships_select on public.aio_organization_memberships
  for select using (
    user_id = auth.uid()
    or organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

create policy aio_memberships_insert_own on public.aio_organization_memberships
  for insert with check (user_id = auth.uid());

-- Internal staff: only internal users see staff table
create policy aio_internal_staff_select on public.aio_internal_staff
  for select using (public.aio_is_internal_user());

create policy aio_internal_staff_admin on public.aio_internal_staff
  for all using (
    public.aio_internal_role() in ('super_admin', 'administrator')
  );
