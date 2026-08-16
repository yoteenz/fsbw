-- All In One — Contacts, Customers, Roles & Permissions
-- Apply ONLY to dedicated All In One Supabase project.

-- ---------------------------------------------------------------------------
-- Contacts (separate from auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  preferred_contact_method text default 'email',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers (business relationship — not auth table)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_customers (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.aio_contacts(id) on delete set null,
  customer_number text unique,
  status text not null default 'active',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_customer_organizations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.aio_customers(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  relationship_type text not null default 'primary',
  created_at timestamptz not null default now(),
  unique (customer_id, organization_id)
);

-- ---------------------------------------------------------------------------
-- Staff profiles (extends internal staff)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_status text not null default 'active',
  title text,
  team text,
  manager_user_id uuid references auth.users(id) on delete set null,
  activated_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roles & permissions
-- ---------------------------------------------------------------------------
create table if not exists public.aio_roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  scope text not null default 'organization',
  created_at timestamptz not null default now()
);

create table if not exists public.aio_permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_role_permissions (
  role_id uuid not null references public.aio_roles(id) on delete cascade,
  permission_id uuid not null references public.aio_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.aio_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.aio_roles(id) on delete cascade,
  organization_id uuid references public.aio_organizations(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Regulatory identifiers
-- ---------------------------------------------------------------------------
create table if not exists public.aio_organization_regulatory_identifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  issuing_authority text,
  status text not null default 'active',
  source text not null default 'manual',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, identifier_type, identifier_value)
);

-- ---------------------------------------------------------------------------
-- Road Ready
-- ---------------------------------------------------------------------------
create table if not exists public.aio_road_ready_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.aio_organizations(id) on delete cascade,
  overall_status text not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_road_ready_requirements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.aio_road_ready_profiles(id) on delete cascade,
  requirement_code text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.aio_road_ready_requirement_statuses (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.aio_road_ready_requirements(id) on delete cascade,
  status text not null default 'pending',
  source text,
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Human-readable customer numbers
create sequence if not exists public.aio_customer_number_seq start 1;

create or replace function public.aio_next_customer_number()
returns text language sql as $$
  select 'AIO-CUS-' || lpad(nextval('public.aio_customer_number_seq')::text, 6, '0');
$$;

alter table public.aio_contacts enable row level security;
alter table public.aio_customers enable row level security;
alter table public.aio_customer_organizations enable row level security;
alter table public.aio_staff_profiles enable row level security;
alter table public.aio_roles enable row level security;
alter table public.aio_permissions enable row level security;
alter table public.aio_role_permissions enable row level security;
alter table public.aio_user_roles enable row level security;
alter table public.aio_organization_regulatory_identifiers enable row level security;
alter table public.aio_road_ready_profiles enable row level security;
alter table public.aio_road_ready_requirements enable row level security;
alter table public.aio_road_ready_requirement_statuses enable row level security;

create policy aio_regulatory_org on public.aio_organization_regulatory_identifiers for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_road_ready_org on public.aio_road_ready_profiles for all using (
  organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
);

create policy aio_road_ready_req on public.aio_road_ready_requirements for all using (
  profile_id in (
    select p.id from public.aio_road_ready_profiles p
    where p.organization_id in (select public.aio_user_org_ids())
  ) or public.aio_is_internal_user()
);

create policy aio_roles_read on public.aio_roles for select using (true);
create policy aio_permissions_read on public.aio_permissions for select using (true);
create policy aio_user_roles_staff on public.aio_user_roles for all using (public.aio_is_internal_user());
create policy aio_staff_profiles_staff on public.aio_staff_profiles for all using (public.aio_is_internal_user());
