import { HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT } from './hairstyleAnalysisEntitlement.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './supabase.js';
import { checkRateLimit } from './rateLimit.js';

export type HairstyleAnalysisUsageSnapshot = {
  monthKey: string;
  monthCount: number;
  monthLimit: number;
  monthRemaining: number;
};

function utcMonthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function endOfUtcMonthSec(d = new Date()): number {
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0);
  return Math.max(1, Math.ceil((end - d.getTime()) / 1000));
}

function snapshot(monthKey: string, monthCount: number): HairstyleAnalysisUsageSnapshot {
  const monthLimit = HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT;
  return {
    monthKey,
    monthCount,
    monthLimit,
    monthRemaining: Math.max(0, monthLimit - monthCount),
  };
}

type ConsumeResult =
  | { ok: true; usage: HairstyleAnalysisUsageSnapshot }
  | { ok: false; usage: HairstyleAnalysisUsageSnapshot; retryAfterSec: number };

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

  const row = (data ?? {}) as { ok?: boolean; month_count?: number; month_limit?: number };
  const monthCount = Number(row.month_count ?? 0);
  const usage = snapshot(monthKey, monthCount);

  if (row.ok) {
    return { ok: true, usage };
  }

  return { ok: false, usage, retryAfterSec: endOfUtcMonthSec() };
}

function consumeViaMemory(userId: string, monthKey: string): ConsumeResult {
  const monthCheck = checkRateLimit(`hairstyle-analysis:month:${userId}:${monthKey}`, {
    max: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
    windowMs: 31 * 24 * 60 * 60 * 1000,
  });

  if (!monthCheck.ok) {
    return {
      ok: false,
      usage: snapshot(monthKey, HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT),
      retryAfterSec: monthCheck.retryAfterSec ?? endOfUtcMonthSec(),
    };
  }

  return { ok: true, usage: snapshot(monthKey, 0) };
}

export async function consumeHairstyleAnalysisGeneration(userId: string): Promise<ConsumeResult> {
  const monthKey = utcMonthKey();
  const viaDb = await consumeViaSupabase(userId, monthKey);
  if (viaDb) return viaDb;
  return consumeViaMemory(userId, monthKey);
}

export async function refundHairstyleAnalysisGeneration(userId: string): Promise<void> {
  const monthKey = utcMonthKey();
  if (!hasSupabaseServiceRole()) return;

  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase.rpc('hairstyle_analysis_refund_consume', {
    p_user_id: userId,
    p_month_key: monthKey,
  });
  if (error) {
    console.error('[hairstyleAnalysisUsage] refund rpc error', error.message);
  }
}

export async function getHairstyleAnalysisUsage(userId: string): Promise<HairstyleAnalysisUsageSnapshot> {
  const monthKey = utcMonthKey();

  if (hasSupabaseServiceRole()) {
    const supabase = getSupabaseAdminServiceRole();
    const { data } = await supabase
      .from('hairstyle_analysis_usage')
      .select('month_key, month_count')
      .eq('user_id', userId)
      .maybeSingle();

    const row = data as { month_key?: string; month_count?: number } | null;
    const monthCount = row?.month_key === monthKey ? Number(row.month_count ?? 0) : 0;
    return snapshot(monthKey, monthCount);
  }

  return snapshot(monthKey, 0);
}
