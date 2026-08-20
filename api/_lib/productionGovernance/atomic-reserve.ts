/**
 * Atomic budget reservation via production RPC (studio_world_atomic_reserve_budget).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type AtomicReserveInput = {
  billingOwnerId: string;
  organizationId: string;
  idempotencyKey: string;
  estimatedCost: number;
  operationType: string;
  provider: string;
  model?: string;
  periodStart?: string;
  periodEnd?: string;
  metadata?: Record<string, unknown>;
};

export type AtomicReserveResult =
  | {
      ok: true;
      reservationId: string;
      status: string;
      idempotent?: boolean;
      actual?: number;
      reserved?: number;
      projected?: number;
      hardLimit?: number | null;
    }
  | {
      ok: false;
      code: string;
      message: string;
      actual?: number;
      reserved?: number;
      projected?: number;
      hardLimit?: number | null;
    };

export async function atomicReserveBudget(
  supabase: SupabaseClient,
  input: AtomicReserveInput
): Promise<AtomicReserveResult> {
  const { data, error } = await supabase.rpc('studio_world_atomic_reserve_budget', {
    p_billing_owner_id: input.billingOwnerId,
    p_organization_id: input.organizationId,
    p_idempotency_key: input.idempotencyKey,
    p_estimated_cost: input.estimatedCost,
    p_operation_type: input.operationType,
    p_provider: input.provider,
    p_model: input.model ?? null,
    p_period_start: input.periodStart ?? null,
    p_period_end: input.periodEnd ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    return { ok: false, code: 'RESERVATION_RPC_FAILED', message: error.message };
  }

  const payload = (data ?? {}) as Record<string, unknown>;
  if (payload.ok === false) {
    return {
      ok: false,
      code: String(payload.code ?? 'BLOCKED_BUDGET'),
      message: String(payload.message ?? 'Budget reservation blocked'),
      actual: typeof payload.actual === 'number' ? payload.actual : undefined,
      reserved: typeof payload.reserved === 'number' ? payload.reserved : undefined,
      projected: typeof payload.projected === 'number' ? payload.projected : undefined,
      hardLimit: typeof payload.hard_limit === 'number' ? payload.hard_limit : null,
    };
  }

  return {
    ok: true,
    reservationId: String(payload.reservation_id),
    status: String(payload.status ?? 'pending'),
    idempotent: payload.idempotent === true,
    actual: typeof payload.actual === 'number' ? payload.actual : undefined,
    reserved: typeof payload.reserved === 'number' ? payload.reserved : undefined,
    projected: typeof payload.projected === 'number' ? payload.projected : undefined,
    hardLimit: typeof payload.hard_limit === 'number' ? payload.hard_limit : null,
  };
}
