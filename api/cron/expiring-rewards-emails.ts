import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { sendExpiringVoucherEmails } from '../_lib/email/expiringRewardsScan.js';

function isAuthorizedCron(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.EMAIL_SEND_SECRET?.trim();
  if (!secret) return false;
  const auth = String(req.headers.authorization || '');
  if (auth === `Bearer ${secret}`) return true;
  return String(req.headers['x-cron-secret'] || '') === secret;
}

/**
 * GET /api/cron/expiring-rewards-emails — daily voucher expiring reminders (Vercel Cron).
 * Requires CRON_SECRET or EMAIL_SEND_SECRET in Authorization: Bearer header.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorizedCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const result = await sendExpiringVoucherEmails(supabase);
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Cron failed' });
  }
}
