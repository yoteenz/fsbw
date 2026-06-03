/**
 * PSA message usage — durable counts via Supabase RPC (service role).
 * Falls back to in-memory daily cap only when Supabase is unavailable.
 */
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './supabase.js';
import { checkRateLimit } from './rateLimit.js';
import type { PsaEngagementLimits } from './psaEngagementLimits.js';

export type PsaUsageSnapshot = {
  monthKey: string;
  dayKey: string;
  monthCount: number;
  monthLimit: number;
  dayCount: number;
  dayLimit: number;
  tierKey: string;
  tierLabel: string;
};

type ConsumeResult =
  | { ok: true; usage: PsaUsageSnapshot }
  | { ok: false; reason: 'daily' | 'monthly'; usage: PsaUsageSnapshot; retryAfterSec?: number };

function utcMonthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function utcDayKey(d = new Date()): string {
  return `${utcMonthKey(d)}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function endOfUtcDaySec(d = new Date()): number {
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0);
  return Math.max(1, Math.ceil((end - d.getTime()) / 1000));
}

function endOfUtcMonthSec(d = new Date()): number {
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0);
  return Math.max(1, Math.ceil((end - d.getTime()) / 1000));
}

function snapshotFromRow(
  limits: PsaEngagementLimits,
  monthKey: string,
  dayKey: string,
  monthCount: number,
  dayCount: number
): PsaUsageSnapshot {
  return {
    monthKey,
    dayKey,
    monthCount,
    monthLimit: limits.monthlyLimit,
    dayCount,
    dayLimit: limits.dailyLimit,
    tierKey: limits.tierKey,
    tierLabel: limits.tierLabel,
  };
}

async function consumeViaSupabase(
  userId: string,
  limits: PsaEngagementLimits,
  monthKey: string,
  dayKey: string
): Promise<ConsumeResult | null> {
  if (!hasSupabaseServiceRole()) return null;

  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.rpc('psa_try_consume_message', {
    p_user_id: userId,
    p_month_key: monthKey,
    p_day_key: dayKey,
    p_month_limit: limits.monthlyLimit,
    p_day_limit: limits.dailyLimit,
  });

  if (error) {
    console.error('[psaUsageLimit] rpc error', error.message);
    return null;
  }

  const row = (data ?? {}) as {
    ok?: boolean;
    reason?: string;
    month_count?: number;
    month_limit?: number;
    day_count?: number;
    day_limit?: number;
  };

  const usage = snapshotFromRow(
    limits,
    monthKey,
    dayKey,
    Number(row.month_count ?? 0),
    Number(row.day_count ?? 0)
  );

  if (row.ok) {
    return { ok: true, usage };
  }

  const reason = row.reason === 'daily' ? 'daily' : 'monthly';
  return {
    ok: false,
    reason,
    usage,
    retryAfterSec: reason === 'daily' ? endOfUtcDaySec() : endOfUtcMonthSec(),
  };
}

function consumeViaMemory(
  userId: string,
  limits: PsaEngagementLimits,
  monthKey: string,
  dayKey: string
): ConsumeResult {
  const dayCheck = checkRateLimit(`psa:day:${userId}:${dayKey}`, {
    max: limits.dailyLimit,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!dayCheck.ok) {
    return {
      ok: false,
      reason: 'daily',
      usage: snapshotFromRow(limits, monthKey, dayKey, 0, limits.dailyLimit),
      retryAfterSec: dayCheck.retryAfterSec,
    };
  }

  const monthCheck = checkRateLimit(`psa:month:${userId}:${monthKey}`, {
    max: limits.monthlyLimit,
    windowMs: 31 * 24 * 60 * 60 * 1000,
  });
  if (!monthCheck.ok) {
    return {
      ok: false,
      reason: 'monthly',
      usage: snapshotFromRow(limits, monthKey, dayKey, limits.monthlyLimit, 0),
      retryAfterSec: monthCheck.retryAfterSec,
    };
  }

  return {
    ok: true,
    usage: snapshotFromRow(limits, monthKey, dayKey, 0, 0),
  };
}

export async function consumePsaMessage(
  userId: string,
  limits: PsaEngagementLimits
): Promise<ConsumeResult> {
  const monthKey = utcMonthKey();
  const dayKey = utcDayKey();

  const viaDb = await consumeViaSupabase(userId, limits, monthKey, dayKey);
  if (viaDb) return viaDb;

  return consumeViaMemory(userId, limits, monthKey, dayKey);
}

export async function getPsaUsage(
  userId: string,
  limits: PsaEngagementLimits
): Promise<PsaUsageSnapshot> {
  const monthKey = utcMonthKey();
  const dayKey = utcDayKey();

  if (hasSupabaseServiceRole()) {
    const supabase = getSupabaseAdminServiceRole();
    const { data } = await supabase
      .from('psa_message_usage')
      .select('month_key, month_count, day_key, day_count')
      .eq('user_id', userId)
      .maybeSingle();

    const row = data as {
      month_key?: string;
      month_count?: number;
      day_key?: string;
      day_count?: number;
    } | null;

    const monthCount =
      row?.month_key === monthKey ? Number(row.month_count ?? 0) : 0;
    const dayCount = row?.day_key === dayKey ? Number(row.day_count ?? 0) : 0;
    return snapshotFromRow(limits, monthKey, dayKey, monthCount, dayCount);
  }

  return snapshotFromRow(limits, monthKey, dayKey, 0, 0);
}
