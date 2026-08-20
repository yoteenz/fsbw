/**
 * Studio World — Production governance enforcement layer.
 * Idempotent: safe when already applied to production (hyycomvcaqxxvyrfupes).
 */

-- Operator active-organization preference (server-authoritative org switching)
create table if not exists public.studio_world_operator_preferences (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  active_organization_slug text not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint studio_world_operator_preferences_email_unique unique (user_email)
);

create index if not exists studio_world_operator_preferences_slug_idx
  on public.studio_world_operator_preferences (active_organization_slug);

alter table public.studio_world_operator_preferences enable row level security;

-- Reservation idempotency + status indexes for atomic enforcement
create unique index if not exists studio_world_reservations_idempotency_unique
  on public.studio_world_production_cost_reservations (idempotency_key);

create index if not exists studio_world_reservations_status_idx
  on public.studio_world_production_cost_reservations (billing_owner_id, status);

-- Atomic budget reservation RPC (concurrent-safe hard limit enforcement)
create or replace function public.studio_world_atomic_reserve_budget(
  p_billing_owner_id uuid,
  p_organization_id uuid,
  p_idempotency_key text,
  p_estimated_cost numeric,
  p_operation_type text,
  p_provider text,
  p_model text default null,
  p_period_start timestamptz default null,
  p_period_end timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_existing record;
  v_hard_limit numeric;
  v_actual numeric := 0;
  v_reserved numeric := 0;
  v_projected numeric;
  v_reservation_id uuid;
  v_lock_key bigint;
begin
  select * into v_existing
  from studio_world_production_cost_reservations
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'ok', true,
      'reservation_id', v_existing.id,
      'status', v_existing.status,
      'idempotent', true
    );
  end if;

  v_lock_key := ('x' || substr(replace(p_billing_owner_id::text, '-', ''), 1, 15))::bit(60)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  select hard_limit into v_hard_limit
  from studio_world_production_budgets
  where organization_id = p_billing_owner_id
    and status = 'active'
    and period_start <= coalesce(p_period_end, now())
    and period_end > coalesce(p_period_start, now())
  order by period_start desc
  limit 1;

  select coalesce(sum(
    case when status = 'failed' then 0
         else coalesce(actual_cost, estimated_cost) end
  ), 0) into v_actual
  from studio_world_production_usage_events
  where billing_owner_id = p_billing_owner_id
    and created_at >= coalesce(p_period_start, date_trunc('month', now()))
    and created_at < coalesce(p_period_end, date_trunc('month', now()) + interval '1 month');

  select coalesce(sum(estimated_cost), 0) into v_reserved
  from studio_world_production_cost_reservations
  where billing_owner_id = p_billing_owner_id
    and status = 'pending';

  v_projected := v_actual + v_reserved + p_estimated_cost;

  if v_hard_limit is not null and v_projected > v_hard_limit then
    return jsonb_build_object(
      'ok', false,
      'code', 'BLOCKED_BUDGET',
      'message', format('Hard budget limit exceeded (%.2f > %.2f)', v_projected, v_hard_limit),
      'actual', v_actual,
      'reserved', v_reserved,
      'projected', v_projected,
      'hard_limit', v_hard_limit
    );
  end if;

  insert into studio_world_production_cost_reservations (
    organization_id,
    billing_owner_id,
    idempotency_key,
    estimated_cost,
    operation_type,
    provider,
    model,
    status,
    metadata,
    updated_at
  ) values (
    p_organization_id,
    p_billing_owner_id,
    p_idempotency_key,
    p_estimated_cost,
    p_operation_type,
    p_provider,
    p_model,
    'pending',
    p_metadata,
    now()
  )
  returning id into v_reservation_id;

  return jsonb_build_object(
    'ok', true,
    'reservation_id', v_reservation_id,
    'status', 'pending',
    'actual', v_actual,
    'reserved', v_reserved + p_estimated_cost,
    'projected', v_projected,
    'hard_limit', v_hard_limit
  );
end;
$$;
