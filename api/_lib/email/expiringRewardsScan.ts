import type { SupabaseClient } from '@supabase/supabase-js';
import { formatEmailDate } from './triggers.js';
import { sendEmailAsync } from './sendEmail.js';

const VOUCHER_VALIDITY_MONTHS = 6;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * ONE_DAY_MS;

function parseVoucherDate(dateStr: string): Date | null {
  const parts = (dateStr || '').trim().split('-').map(Number);
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getVoucherExpiration(addedDate: Date): Date {
  const exp = new Date(addedDate);
  exp.setMonth(exp.getMonth() + VOUCHER_VALIDITY_MONTHS);
  return exp;
}

function getVoucherExpirations(profile: Record<string, unknown>): Array<{ type: string; expiresAt: Date }> {
  const list = Array.isArray(profile.voucher_list) ? profile.voucher_list : [];
  const history = Array.isArray(profile.voucher_history)
    ? (profile.voucher_history as Array<{ date?: string; transaction?: string; amount?: number }>)
    : [];
  if (list.length === 0) return [];

  const countByType: Record<string, number> = {};
  for (const v of list) {
    const key = String(v || '')
      .trim()
      .toUpperCase();
    if (!key) continue;
    countByType[key] = (countByType[key] || 0) + 1;
  }

  const result: Array<{ type: string; expiresAt: Date }> = [];
  for (const type of Object.keys(countByType)) {
    const n = countByType[type];
    const credits = history
      .filter((h) => String(h.transaction || '').trim().toUpperCase() === type && Number(h.amount) > 0)
      .map((h) => parseVoucherDate(String(h.date || '')))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())
      .slice(0, n);
    for (const added of credits) {
      result.push({ type, expiresAt: getVoucherExpiration(added) });
    }
  }
  return result;
}

function shouldNotifyExpiring(expMs: number, now: number): boolean {
  const msLeft = expMs - now;
  if (msLeft <= 0) return false;
  return msLeft <= ONE_MONTH_MS;
}

/**
 * Scan profiles and send voucher_expiring emails (within 30 days).
 * Idempotence: best-effort — may resend if cron runs daily (acceptable for MVP).
 */
export async function sendExpiringVoucherEmails(supabase: SupabaseClient): Promise<{ scanned: number; sent: number }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, voucher_list, voucher_history, notification_order_tracking')
    .not('voucher_list', 'is', null)
    .limit(500);
  if (error) throw new Error(error.message);

  const rows = Array.isArray(data) ? data : [];
  const now = Date.now();
  let sent = 0;

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const email = String(r.email || '')
      .trim()
      .toLowerCase();
    if (!email) continue;

    const expirations = getVoucherExpirations(r);
    for (const { type, expiresAt } of expirations) {
      if (!shouldNotifyExpiring(expiresAt.getTime(), now)) continue;
      const first = String(r.first_name || '').trim();
      const last = String(r.last_name || '').trim();
      sendEmailAsync({
        templateType: 'voucher_expiring',
        recipientEmail: email,
        variables: {
          customerName: [first, last].filter(Boolean).join(' ') || 'SLAYER',
          voucherType: type.replace(/^1X\s+/i, '').trim() || type,
          expirationDate: formatEmailDate(expiresAt),
        },
      });
      sent += 1;
    }
  }

  return { scanned: rows.length, sent };
}
