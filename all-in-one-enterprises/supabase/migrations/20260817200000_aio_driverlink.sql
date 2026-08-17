-- All In One Enterprises Inc. — DriverLink domain
-- Apply ONLY to dedicated All In One Supabase project (NOT Frontal Slayer hyycomvcaqxxvyrfupes).

do $$ begin
  create type public.aio_driver_marketplace_status as enum (
    'draft', 'profile_incomplete', 'under_review', 'active', 'paused',
    'unavailable', 'hired', 'suspended', 'archived'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_driver_application_status as enum (
    'matched', 'saved', 'invited', 'application_started', 'application_submitted',
    'under_review', 'documents_needed', 'interview_requested', 'interview_scheduled',
    'conditional_offer', 'employer_compliance', 'hired', 'not_selected', 'withdrawn', 'closed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.aio_job_opportunity_status as enum (
    'draft', 'published', 'paused', 'filled', 'closed', 'expired', 'archived'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.aio_driverlink_network_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  home_city text,
  home_state text,
  preferred_regions text[] not null default '{}',
  preferred_lanes text[] not null default '{}',
  route_preference text not null default 'any',
  solo_team_preference text not null default 'either',
  employment_preference text not null default 'either',
  cdl_class text not null default 'unknown',
  endorsements text[] not null default '{}',
  years_experience integer not null default 0,
  equipment_experience text[] not null default '{}',
  availability_date date,
  home_time_preference text,
  work_history_summary text,
  profile_visibility text not null default 'public_match',
  marketplace_status public.aio_driver_marketplace_status not null default 'draft',
  preferred_language text not null default 'en-US',
  hired_organization_id uuid references public.aio_organizations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aio_driver_profiles_user on public.aio_driver_profiles(user_id);
create index if not exists idx_aio_driver_profiles_status on public.aio_driver_profiles(marketplace_status);

create table if not exists public.aio_driver_credentials (
  id uuid primary key default gen_random_uuid(),
  driver_profile_id uuid not null references public.aio_driver_profiles(id) on delete cascade,
  credential_type text not null,
  document_id uuid references public.aio_documents(id) on delete set null,
  credential_number_masked text,
  issuing_authority text,
  jurisdiction text,
  issue_date date,
  expiration_date date,
  verification_status text not null default 'not_provided',
  clearinghouse_status text,
  review_status text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_driver_job_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  job_title text not null,
  status public.aio_job_opportunity_status not null default 'draft',
  driver_type text not null default 'company_driver',
  cdl_class_required text not null default 'A',
  endorsements_required text[] not null default '{}',
  equipment_type text[] not null default '{}',
  route_type text not null default 'regional',
  base_location jsonb not null default '{}'::jsonb,
  service_regions text[] not null default '{}',
  lanes text[] not null default '{}',
  home_time text,
  experience_required_years integer,
  compensation_type text,
  compensation_range text,
  start_date date,
  number_of_positions integer not null default 1,
  description text not null,
  requirements text,
  expires_at timestamptz,
  content_language text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aio_driver_jobs_org on public.aio_driver_job_opportunities(organization_id);

create table if not exists public.aio_driver_job_matches (
  id uuid primary key default gen_random_uuid(),
  driver_profile_id uuid not null references public.aio_driver_profiles(id) on delete cascade,
  opportunity_id uuid not null references public.aio_driver_job_opportunities(id) on delete cascade,
  match_score numeric(5, 2),
  match_factors jsonb not null default '{}'::jsonb,
  eligible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (driver_profile_id, opportunity_id)
);

create table if not exists public.aio_driver_applications (
  id uuid primary key default gen_random_uuid(),
  driver_profile_id uuid not null references public.aio_driver_profiles(id) on delete cascade,
  opportunity_id uuid not null references public.aio_driver_job_opportunities(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  status public.aio_driver_application_status not null default 'application_started',
  match_id uuid references public.aio_driver_job_matches(id) on delete set null,
  consent_granted_at timestamptz,
  consent_scope text[] not null default '{}',
  employer_access_level text not null default 'profile_only',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_driver_consent_records (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.aio_driver_applications(id) on delete cascade,
  driver_profile_id uuid not null references public.aio_driver_profiles(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  scope text[] not null default '{}',
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);

create table if not exists public.aio_driverlink_company_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  plan_code text not null,
  status text not null default 'inactive',
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz
);

-- User locale preference extension (if not on profiles elsewhere)
alter table public.aio_user_profiles add column if not exists preferred_language text default 'en-US';

-- RLS
alter table public.aio_driverlink_network_settings enable row level security;
alter table public.aio_driver_profiles enable row level security;
alter table public.aio_driver_credentials enable row level security;
alter table public.aio_driver_job_opportunities enable row level security;
alter table public.aio_driver_job_matches enable row level security;
alter table public.aio_driver_applications enable row level security;
alter table public.aio_driver_consent_records enable row level security;
alter table public.aio_driverlink_company_subscriptions enable row level security;

create policy aio_driver_profiles_self on public.aio_driver_profiles for all
  using (user_id = auth.uid() or public.aio_is_internal_user())
  with check (user_id = auth.uid() or public.aio_is_internal_user());

create policy aio_driver_jobs_org on public.aio_driver_job_opportunities for all
  using (organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user())
  with check (organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user());

create policy aio_driver_applications_access on public.aio_driver_applications for select
  using (
    organization_id in (select public.aio_user_org_ids())
    or driver_profile_id in (select id from public.aio_driver_profiles where user_id = auth.uid())
    or public.aio_is_internal_user()
  );

create policy aio_driver_credentials_self on public.aio_driver_credentials for all
  using (
    driver_profile_id in (select id from public.aio_driver_profiles where user_id = auth.uid())
    or public.aio_is_internal_user()
  );

create policy aio_driver_jobs_public_read on public.aio_driver_job_opportunities for select
  using (status = 'published' or organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user());
