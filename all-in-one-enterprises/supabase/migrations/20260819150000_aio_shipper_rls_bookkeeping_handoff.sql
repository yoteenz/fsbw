-- AIO shipper intake RLS, shipper-safe views, bookkeeping handoff, shipper invoices
-- Apply ONLY to dedicated All In One Supabase project — NOT Frontal Slayer.

-- ---------------------------------------------------------------------------
-- Align shipper org id for RLS (text stores uuid string from memberships)
-- ---------------------------------------------------------------------------
create or replace function public.aio_user_org_id_texts()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id::text
  from public.aio_organization_memberships m
  where m.user_id = auth.uid() and m.status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- Shipment request templates (shipper-owned)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_shipment_request_templates (
  id uuid primary key default gen_random_uuid(),
  shipper_organization_id text not null,
  label text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aio_srt_shipper on public.aio_shipment_request_templates (shipper_organization_id);

alter table public.aio_shipment_request_templates enable row level security;

-- ---------------------------------------------------------------------------
-- Brokerage shipper invoices (shipper-visible billing)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_brokerage_shipper_invoices (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.aio_dispatch_loads(id) on delete restrict,
  shipper_organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  invoice_number text not null,
  base_freight_charge_minor bigint not null,
  accessorials_minor bigint not null default 0,
  adjustments_minor bigint not null default 0,
  total_minor bigint not null,
  paid_amount_minor bigint not null default 0,
  balance_minor bigint not null,
  currency text not null default 'USD',
  status text not null default 'issued',
  invoice_date date not null,
  due_date date,
  pod_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique (load_id)
);

alter table public.aio_brokerage_shipper_invoices enable row level security;

-- ---------------------------------------------------------------------------
-- Idempotent bookkeeping handoff (AIO internal brokerage books only)
-- ---------------------------------------------------------------------------
create table if not exists public.aio_brokerage_bookkeeping_handoffs (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'BROKERAGE_LOAD',
  source_id uuid not null,
  idempotency_key text not null,
  revision_number integer not null default 1,
  load_number text not null,
  aio_brokerage_org_id uuid not null references public.aio_organizations(id) on delete restrict,
  shipper_organization_id uuid references public.aio_organizations(id) on delete set null,
  carrier_organization_id uuid references public.aio_organizations(id) on delete set null,
  shipper_invoice_amount_minor bigint not null,
  carrier_payable_amount_minor bigint not null,
  shipper_accessorial_revenue_minor bigint not null default 0,
  carrier_accessorial_expense_minor bigint not null default 0,
  gross_margin_minor bigint not null,
  gross_margin_percent numeric(6,2),
  shipper_payment_status text,
  carrier_payment_status text,
  delivery_date date,
  close_date date,
  invoice_date date,
  reference_ids jsonb not null default '{}'::jsonb,
  adjustment_note text,
  status text not null default 'handed_off',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, revision_number),
  unique (idempotency_key)
);

alter table public.aio_brokerage_bookkeeping_handoffs enable row level security;

-- ---------------------------------------------------------------------------
-- Shipper-safe views (no carrier rate, no margin, no pricing drafts)
-- ---------------------------------------------------------------------------
create or replace view public.aio_shipper_freight_quotes
with (security_invoker = true) as
select
  q.id,
  q.quote_number,
  q.shipment_request_id,
  q.shipper_organization_id,
  q.status,
  q.freight_charge_minor,
  q.currency,
  q.current_revision,
  q.expires_at,
  q.accepted_revision_id,
  q.converted_load_id,
  q.prepared_by_staff_id,
  q.created_at,
  q.updated_at,
  q.version
from public.aio_brokerage_freight_quotes q
where q.status not in ('draft');

create or replace view public.aio_shipper_freight_shipments
with (security_invoker = true) as
select
  l.id,
  l.load_number,
  l.organization_id,
  l.shipper_organization_id,
  l.source_type,
  l.origin_city,
  l.origin_state,
  l.destination_city,
  l.destination_state,
  l.pickup_date,
  l.delivery_date,
  l.equipment_type,
  l.loaded_miles,
  l.deadhead_miles,
  l.operational_status,
  l.coverage_status,
  l.commodity,
  l.weight,
  l.currency,
  l.internal_notes,
  l.created_at,
  l.updated_at
from public.aio_dispatch_loads l
where l.source_type = 'brokerage'
  and l.shipper_organization_id is not null;

-- ---------------------------------------------------------------------------
-- RLS — shipper intake
-- ---------------------------------------------------------------------------
create policy aio_sr_shipper on public.aio_shipment_requests
  for all using (
    shipper_organization_id in (select public.aio_user_org_id_texts())
    or public.aio_is_internal_user()
  )
  with check (
    shipper_organization_id in (select public.aio_user_org_id_texts())
    or public.aio_is_internal_user()
  );

create policy aio_bfq_shipper_read on public.aio_brokerage_freight_quotes
  for select using (
    shipper_organization_id in (select public.aio_user_org_id_texts())
    or public.aio_is_internal_user()
  );

create policy aio_bfq_shipper_update on public.aio_brokerage_freight_quotes
  for update using (
    shipper_organization_id in (select public.aio_user_org_id_texts())
  )
  with check (
    shipper_organization_id in (select public.aio_user_org_id_texts())
  );

create policy aio_bfq_staff on public.aio_brokerage_freight_quotes
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_bqr_shipper on public.aio_brokerage_quote_revisions
  for select using (
    quote_id in (
      select q.id from public.aio_brokerage_freight_quotes q
      where q.shipper_organization_id in (select public.aio_user_org_id_texts())
    )
    or public.aio_is_internal_user()
  );

create policy aio_bqr_staff on public.aio_brokerage_quote_revisions
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- Pricing drafts: staff ONLY — shippers and carriers never
create policy aio_bqpd_staff on public.aio_brokerage_quote_pricing_drafts
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_bir_shipper on public.aio_brokerage_info_requests
  for select using (
    shipment_request_id in (
      select r.id from public.aio_shipment_requests r
      where r.shipper_organization_id in (select public.aio_user_org_id_texts())
    )
    or public.aio_is_internal_user()
  );

create policy aio_bir_staff on public.aio_brokerage_info_requests
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_bae_shipper on public.aio_brokerage_audit_events
  for select using (
    (entity_type = 'shipment_request' and entity_id in (
      select r.id from public.aio_shipment_requests r
      where r.shipper_organization_id in (select public.aio_user_org_id_texts())
    ))
    or (entity_type = 'quote' and entity_id in (
      select q.id from public.aio_brokerage_freight_quotes q
      where q.shipper_organization_id in (select public.aio_user_org_id_texts())
    ))
    or public.aio_is_internal_user()
  );

create policy aio_bae_staff on public.aio_brokerage_audit_events
  for insert with check (public.aio_is_internal_user() or actor_type = 'shipper');

create policy aio_bae_shipper_insert on public.aio_brokerage_audit_events
  for insert with check (
    actor_type = 'shipper'
    and actor_id in (select public.aio_user_org_id_texts())
  );

create policy aio_srt_shipper on public.aio_shipment_request_templates
  for all using (
    shipper_organization_id in (select public.aio_user_org_id_texts())
  )
  with check (
    shipper_organization_id in (select public.aio_user_org_id_texts())
  );

-- Shipper read on brokerage loads they own
create policy aio_dispatch_shipper_read on public.aio_dispatch_loads
  for select using (
    shipper_organization_id in (select public.aio_user_org_ids())
  );

create policy aio_load_history_shipper on public.aio_load_status_history
  for select using (
    load_id in (
      select l.id from public.aio_dispatch_loads l
      where l.shipper_organization_id in (select public.aio_user_org_ids())
    )
  );

create policy aio_bsi_shipper on public.aio_brokerage_shipper_invoices
  for select using (
    shipper_organization_id in (select public.aio_user_org_ids())
    or public.aio_is_internal_user()
  );

create policy aio_bsi_staff on public.aio_brokerage_shipper_invoices
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- Bookkeeping handoffs: AIO internal staff only — NOT carrier client books
create policy aio_bbh_staff on public.aio_brokerage_bookkeeping_handoffs
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
drop trigger if exists aio_srt_updated_at on public.aio_shipment_request_templates;
create trigger aio_srt_updated_at before update on public.aio_shipment_request_templates
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_bsi_updated_at on public.aio_brokerage_shipper_invoices;
create trigger aio_bsi_updated_at before update on public.aio_brokerage_shipper_invoices
  for each row execute function public.aio_set_updated_at();

drop trigger if exists aio_bbh_updated_at on public.aio_brokerage_bookkeeping_handoffs;
create trigger aio_bbh_updated_at before update on public.aio_brokerage_bookkeeping_handoffs
  for each row execute function public.aio_set_updated_at();
