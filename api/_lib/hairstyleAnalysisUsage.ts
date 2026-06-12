import { HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT } from './hairstyleAnalysisEntitlement.js';
import {
  HAIRSTYLE_ANALYSIS_PURCHASE_TIERS,
  type HairstyleAnalysisComparisonTier,
} from './hairstyleAnalysisPricing.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './supabase.js';
import { checkRateLimit } from './rateLimit.js';

export type HairstyleAnalysisUsageSnapshot = {
  monthKey: string;
  monthCount: number;
  monthLimit: number;
  monthRemaining: number;
  paidCreditsRemaining: number;
  canGenerate: boolean;
};

export type HairstyleAnalysisConsumeSource = 'monthly' | 'paid';

type ConsumeResult =
  | {
      ok: true;
      source: HairstyleAnalysisConsumeSource;
      comparisonCount?: HairstyleAnalysisComparisonTier;
      usage: HairstyleAnalysisUsageSnapshot;
    }
  | { ok: false; usage: HairstyleAnalysisUsageSnapshot; retryAfterSec: number; code: 'PURCHASE_REQUIRED' };

function utcMonthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function endOfUtcMonthSec(d = new Date()): number {
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0);
  return Math.max(1, Math.ceil((end - d.getTime()) / 1000));
}

function snapshot(
  monthKey: string,
  monthCount: number,
  paidCreditsRemaining = 0
): HairstyleAnalysisUsageSnapshot {
  const monthLimit = HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT;
  const monthRemaining = Math.max(0, monthLimit - monthCount);
  return {
    monthKey,
    monthCount,
    monthLimit,
    monthRemaining,
    paidCreditsRemaining,
    canGenerate: monthRemaining > 0 || paidCreditsRemaining > 0,
  };
}

function parseComparisonCount(raw: unknown): HairstyleAnalysisComparisonTier | undefined {
  if (raw === 1 || raw === 4) return raw;
  return undefined;
}

async function consumeViaSupabase(userId: string, monthKey: string): Promise<ConsumeResult | null> {
  if (!hasSupabaseServiceRole()) return null;

  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.rpc('hairstyle_analysis_try_consume', {
    p_user_id: userId,
    p_month_key: monthKey,
    p_month_limit: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
  });

  if (error) {
    console.error('[hairstyleAnalysisUsage] consume rpc error', error.message);
    return null;
  }

  const row = (data ?? {}) as {
    ok?: boolean;
    source?: string;
    reason?: string;
    month_count?: number;
    month_limit?: number;
    paid_remaining?: number;
    comparison_count?: number;
  };
  const monthCount = Number(row.month_count ?? 0);
  const paidCreditsRemaining = Number(row.paid_remaining ?? 0);
  const usage = snapshot(monthKey, monthCount, paidCreditsRemaining);

  if (row.ok) {
    const source: HairstyleAnalysisConsumeSource = row.source === 'paid' ? 'paid' : 'monthly';
    return {
      ok: true,
      source,
      comparisonCount: source === 'paid' ? parseComparisonCount(row.comparison_count) : undefined,
      usage,
    };
  }

  return {
    ok: false,
    usage,
    retryAfterSec: endOfUtcMonthSec(),
    code: 'PURCHASE_REQUIRED',
  };
}

function consumeViaMemory(userId: string, monthKey: string): ConsumeResult {
  const monthCheck = checkRateLimit(`hairstyle-analysis:month:${userId}:${monthKey}`, {
    max: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
    windowMs: 31 * 24 * 60 * 60 * 1000,
  });

  if (!monthCheck.ok) {
    return {
      ok: false,
      usage: snapshot(monthKey, HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT, 0),
      retryAfterSec: monthCheck.retryAfterSec ?? endOfUtcMonthSec(),
      code: 'PURCHASE_REQUIRED',
    };
  }

  return { ok: true, source: 'monthly', usage: snapshot(monthKey, 0, 0) };
}

export async function consumeHairstyleAnalysisGeneration(userId: string): Promise<ConsumeResult> {
  const monthKey = utcMonthKey();
  const viaDb = await consumeViaSupabase(userId, monthKey);
  if (viaDb) return viaDb;
  return consumeViaMemory(userId, monthKey);
}

export async function refundHairstyleAnalysisGeneration(
  userId: string,
  source: HairstyleAnalysisConsumeSource,
  comparisonCount?: HairstyleAnalysisComparisonTier
): Promise<void> {
  const monthKey = utcMonthKey();
  if (!hasSupabaseServiceRole()) return;

  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase.rpc('hairstyle_analysis_refund_consume', {
    p_user_id: userId,
    p_month_key: monthKey,
    p_source: source,
    p_comparison_count: source === 'paid' ? comparisonCount ?? null : null,
  });
  if (error) {
    console.error('[hairstyleAnalysisUsage] refund rpc error', error.message);
  }
}

export async function grantHairstyleAnalysisPurchaseCredits(
  userId: string,
  paymentIntentId: string,
  comparisonCounts: HairstyleAnalysisComparisonTier[]
): Promise<{ ok: boolean; duplicate?: boolean }> {
  if (!hasSupabaseServiceRole() || comparisonCounts.length === 0) {
    return { ok: false };
  }

  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.rpc('hairstyle_analysis_grant_purchase_credits', {
    p_user_id: userId,
    p_payment_intent_id: paymentIntentId,
    p_comparison_counts: comparisonCounts,
  });

  if (error) {
    console.error('[hairstyleAnalysisUsage] grant rpc error', error.message);
    return { ok: false };
  }

  const row = (data ?? {}) as { ok?: boolean; duplicate?: boolean };
  return { ok: row.ok === true, duplicate: row.duplicate === true };
}

export async function getHairstyleAnalysisUsage(userId: string): Promise<HairstyleAnalysisUsageSnapshot> {
  const monthKey = utcMonthKey();

  if (hasSupabaseServiceRole()) {
    const supabase = getSupabaseAdminServiceRole();
    const { data } = await supabase
      .from('hairstyle_analysis_usage')
      .select('month_key, month_count, paid_credit_queue')
      .eq('user_id', userId)
      .maybeSingle();

    const row = data as { month_key?: string; month_count?: number; paid_credit_queue?: number[] } | null;
    const monthCount = row?.month_key === monthKey ? Number(row.month_count ?? 0) : 0;
    const paidCreditsRemaining = Array.isArray(row?.paid_credit_queue) ? row.paid_credit_queue.length : 0;
    return snapshot(monthKey, monthCount, paidCreditsRemaining);
  }

  return snapshot(monthKey, 0, 0);
}

export function hairstyleAnalysisPurchaseOptions() {
  return HAIRSTYLE_ANALYSIS_PURCHASE_TIERS.map((tier) => ({
    comparisonCount: tier.comparisonCount,
    priceUsd: tier.priceUsd,
    label: tier.label,
  }));
}
