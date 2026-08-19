-- AIO Freight / Load Board production persistence (Phase 2 hardening)
-- Apply ONLY to dedicated All In One Supabase project — NOT Frontal Slayer (hyycomvcaqxxvyrfupes).

-- ---------------------------------------------------------------------------
-- Extend dispatch loads (additive — preserve legacy rate column)
-- ---------------------------------------------------------------------------
alter table public.aio_dispatch_loads
  add column if not exists source_type text not null default 'brokerage',
  add column if not exists shipper_organization_id uuid references public.aio_organizations(id) on delete set null,
  add column if not exists origin_city text,
  add column if not exists origin_state text,
  add column if not exists destination_city text,
  add column if not exists destination_state text,
  add column if not exists origin_lat double precision,
  add column if not exists origin_lng double precision,
  add column if not exists destination_lat double precision,
  add column if not exists destination_lng double precision,
  add column if not exists pickup_date date,
  add column if not exists delivery_date date,
  add column if not exists equipment_type text,
  add column if not exists loaded_miles integer,
  add column if not exists deadhead_miles integer default 0,
  add column if not exists operational_status text,
  add column if not exists coverage_status text,
  add column if not exists financial_split_status text not null default 'legacy_unclassified'
    check (financial_split_status in ('legacy_unclassified', 'complete', 'needs_review')),
  add column if not exists legacy_rate_minor bigint,
  add column if not exists currency text not null default 'USD',
  add column if not exists internal_notes text;

comment on column public.aio_dispatch_loads.rate is 'Legacy single-rate field — do not infer shipper vs carrier. Use aio_brokerage_load_financials.';
comment on column public.aio_dispatch_loads.financial_split_status is 'LEGACY_UNCLASSIFIED until staff assigns shipper/carrier split.';

-- Backfill legacy_rate_minor from numeric rate (cents) without classifying meaning
update public.aio_dispatch_loads
set legacy_rate_minor = round(coalesce(rate, 0) * 100)::bigint
where legacy_rate_minor is null and rate is not null;

update public.aio_dispatch_loads
set financial_split_status = 'legacy_unclassified'
where financial_split_status is null;

-- ---------------------------------------------------------------------------
-- Brokerage financial split (normalized — margin derived in app/view)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_brokerage_load_financials (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null unique references public.aio_dispatch_loads(id) on delete cascade,
  shipper_rate_minor bigint not null default 0,
  carrier_rate_minor bigint not null default 0,
  currency text not null default 'USD',
  pricing_version integer not null default 1,
  effective_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_brokerage_load_financial_revisions (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  field_name text not null check (field_name in ('shipper_rate_minor', 'carrier_rate_minor')),
  previous_value_minor bigint not null,
  new_value_minor bigint not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Carrier offers (staff + load board — offer privacy by carrier org)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_carrier_offers (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  carrier_organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  carrier_network_profile_id uuid,
  submitted_by uuid references auth.users(id) on delete set null,
  offer_source text not null default 'load_board'
    check (offer_source in ('staff', 'load_board', 'counter')),
  offer_amount_minor bigint not null,
  counter_amount_minor bigint,
  currency text not null default 'USD',
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'countered', 'declined', 'withdrawn', 'expired')),
  expires_at timestamptz,
  responded_at timestamptz,
  responded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aio_carrier_offers_load_idx on public.aio_carrier_offers(load_id);
create index if not exists aio_carrier_offers_carrier_org_idx on public.aio_carrier_offers(carrier_organization_id);
create unique index if not exists aio_carrier_offers_active_unique
  on public.aio_carrier_offers(load_id, carrier_organization_id, offer_source)
  where status in ('pending', 'countered');

-- ---------------------------------------------------------------------------
-- Load board publication metadata
-- ---------------------------------------------------------------------------
create table if not exists public.aio_load_board_publications (
  load_id uuid primary key references public.aio_dispatch_loads(id) on delete cascade,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'published', 'paused', 'private', 'filled', 'expired', 'removed')),
  visibility_type text not null default 'published'
    check (visibility_type in ('draft', 'published', 'hold', 'private')),
  source_type text not null default 'aio_shipper_freight',
  trailer_length_ft integer,
  full_partial text check (full_partial in ('full', 'partial')),
  max_weight_lbs integer,
  instant_book_enabled boolean not null default false,
  offer_enabled boolean not null default true,
  private_invite_only boolean not null default false,
  invited_carrier_organization_ids uuid[] default '{}',
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  post_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aio_lbp_status_published_idx
  on public.aio_load_board_publications(publication_status, published_at desc)
  where publication_status = 'published';

-- ---------------------------------------------------------------------------
-- Saved / recent searches
-- ---------------------------------------------------------------------------
create table if not exists public.aio_load_board_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  name text not null,
  filters_json jsonb not null default '{}',
  alerts_enabled boolean not null default false,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aio_lb_saved_org_idx on public.aio_load_board_saved_searches(organization_id);

create table if not exists public.aio_load_board_recent_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  filters_json jsonb not null default '{}',
  searched_at timestamptz not null default now()
);

create index if not exists aio_lb_recent_user_idx
  on public.aio_load_board_recent_searches(user_id, searched_at desc);

-- ---------------------------------------------------------------------------
-- Saved search alert deduplication
-- ---------------------------------------------------------------------------
create table if not exists public.aio_load_board_search_alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_search_id uuid not null references public.aio_load_board_saved_searches(id) on delete cascade,
  load_id uuid not null references public.aio_dispatch_loads(id) on delete cascade,
  trigger_version integer not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, saved_search_id, load_id, trigger_version)
);

-- ---------------------------------------------------------------------------
-- Status history extension
-- ---------------------------------------------------------------------------
alter table public.aio_load_status_history
  add column if not exists note text,
  add column if not exists actor_label text;

-- ---------------------------------------------------------------------------
-- Search performance indexes on loads
-- ---------------------------------------------------------------------------
create index if not exists aio_dispatch_loads_origin_state_idx
  on public.aio_dispatch_loads(origin_state) where origin_state is not null;
create index if not exists aio_dispatch_loads_dest_state_idx
  on public.aio_dispatch_loads(destination_state) where destination_state is not null;
create index if not exists aio_dispatch_loads_pickup_date_idx
  on public.aio_dispatch_loads(pickup_date) where pickup_date is not null;
create index if not exists aio_dispatch_loads_equipment_idx
  on public.aio_dispatch_loads(equipment_type) where equipment_type is not null;

-- ---------------------------------------------------------------------------
-- Derived margin view (staff/internal only — not exposed to carrier policies)
-- ---------------------------------------------------------------------------
create or replace view public.aio_brokerage_load_financials_internal
with (security_invoker = true) as
select
  f.load_id,
  f.shipper_rate_minor,
  f.carrier_rate_minor,
  f.currency,
  (f.shipper_rate_minor - f.carrier_rate_minor) as gross_margin_minor,
  case
    when f.shipper_rate_minor > 0
    then round(((f.shipper_rate_minor - f.carrier_rate_minor)::numeric / f.shipper_rate_minor) * 100, 2)
    else null
  end as gross_margin_percent,
  f.pricing_version,
  f.updated_at
from public.aio_brokerage_load_financials f;

-- Carrier-safe publication view — NO financial columns
create or replace view public.aio_load_board_carrier_loads
with (security_invoker = true) as
select
  l.id as load_id,
  l.load_number,
  l.origin_city,
  l.origin_state,
  l.destination_city,
  l.destination_state,
  l.origin_lat,
  l.origin_lng,
  l.destination_lat,
  l.destination_lng,
  l.pickup_date,
  l.delivery_date,
  l.equipment_type,
  l.loaded_miles,
  l.deadhead_miles,
  l.currency,
  f.carrier_rate_minor,
  p.publication_status,
  p.trailer_length_ft,
  p.full_partial,
  p.instant_book_enabled,
  p.offer_enabled,
  p.published_at,
  p.post_expires_at
from public.aio_dispatch_loads l
join public.aio_load_board_publications p on p.load_id = l.id
left join public.aio_brokerage_load_financials f on f.load_id = l.id
where p.publication_status = 'published'
  and p.visibility_type = 'published';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.aio_brokerage_load_financials enable row level security;
alter table public.aio_brokerage_load_financial_revisions enable row level security;
alter table public.aio_carrier_offers enable row level security;
alter table public.aio_load_board_publications enable row level security;
alter table public.aio_load_board_saved_searches enable row level security;
alter table public.aio_load_board_recent_searches enable row level security;
alter table public.aio_load_board_search_alert_events enable row level security;

-- Financials: staff full access; carriers NEVER (no policy = deny)
create policy aio_financials_staff on public.aio_brokerage_load_financials
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_financial_revisions_staff on public.aio_brokerage_load_financial_revisions
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- Carrier offers: own org + staff
create policy aio_carrier_offers_carrier on public.aio_carrier_offers
  for select using (
    carrier_organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

create policy aio_carrier_offers_carrier_insert on public.aio_carrier_offers
  for insert with check (
    carrier_organization_id in (select public.aio_user_org_ids())
  );

create policy aio_carrier_offers_staff on public.aio_carrier_offers
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- Publications: carriers read published; staff manage
create policy aio_lbp_carrier_read on public.aio_load_board_publications
  for select using (
    publication_status = 'published'
    or public.aio_is_internal_user()
  );

create policy aio_lbp_staff on public.aio_load_board_publications
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- Saved / recent searches: own user + org
create policy aio_lb_saved_own on public.aio_load_board_saved_searches
  for all using (
    user_id = auth.uid()
    and organization_id in (select public.aio_user_org_ids())
  )
  with check (
    user_id = auth.uid()
    and organization_id in (select public.aio_user_org_ids())
  );

create policy aio_lb_recent_own on public.aio_load_board_recent_searches
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy aio_lb_alert_own on public.aio_load_board_search_alert_events
  for select using (user_id = auth.uid());

create policy aio_lb_alert_insert on public.aio_load_board_search_alert_events
  for insert with check (user_id = auth.uid());

-- Carrier view: authenticated carriers in org can select published loads only
-- (View inherits base table RLS via security_invoker)

-- updated_at triggers
drop trigger if exists aio_financials_updated_at on public.aio_brokerage_load_financials;
create trigger aio_financials_updated_at before update on public.aio_brokerage_load_financials
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_carrier_offers_updated_at on public.aio_carrier_offers;
create trigger aio_carrier_offers_updated_at before update on public.aio_carrier_offers
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_lbp_updated_at on public.aio_load_board_publications;
create trigger aio_lbp_updated_at before update on public.aio_load_board_publications
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_lb_saved_updated_at on public.aio_load_board_saved_searches;
create trigger aio_lb_saved_updated_at before update on public.aio_load_board_saved_searches
  for each row execute function public.aio_set_updated_at();
