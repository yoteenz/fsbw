import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { sendEmailAsync } from '../_lib/email/sendEmail.js';
import { getProfileContact } from '../_lib/email/triggers.js';
import { isEmailTemplateType } from '../_lib/email/templateRegistry.js';
import type { EmailTemplateType, EmailTemplateVariables } from '../_lib/email/types.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

const REWARDS_EVENTS: EmailTemplateType[] = [
  'points_earned',
  'points_redeemed',
  'points_expiring',
  'referral_redeemed',
  'digital_cash_update',
  'tier_upgraded',
  'birthday_reward',
  'special_offer',
  'voucher_expiring',
  'wishlist_price_drop',
];

/**
 * POST /api/admin/rewards-notify — send rewards/loyalty lifecycle email (admin only).
 * Body: { event: EmailTemplateType, userId?, recipientEmail?, variables? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const body = parseBody(req);
  const event = String(body.event || body.templateType || '').trim();
  if (!isEmailTemplateType(event) || !REWARDS_EVENTS.includes(event as EmailTemplateType)) {
    return res.status(400).json({ error: 'Invalid rewards event', allowed: REWARDS_EVENTS });
  }

  let recipientEmail = String(body.recipientEmail || body.email || '')
    .trim()
    .toLowerCase();
  const userId = String(body.userId || '').trim();
  let customerName = '';

  if (userId) {
    const supabase = getSupabaseAdmin();
    const contact = await getProfileContact(supabase, userId);
    if (contact) {
      if (!recipientEmail) recipientEmail = contact.email;
      customerName = contact.customerName;
    }
  }

  if (!recipientEmail) return res.status(400).json({ error: 'recipientEmail or userId required' });

  const variables: EmailTemplateVariables = {
    ...(body.variables && typeof body.variables === 'object' && !Array.isArray(body.variables)
      ? (body.variables as EmailTemplateVariables)
      : {}),
  };
  variables.customerName = customerName || variables.customerName || 'SLAYER';

  sendEmailAsync({
    templateType: event as EmailTemplateType,
    recipientEmail,
    subject: typeof body.subject === 'string' ? body.subject : undefined,
    variables,
  });

  return res.status(200).json({ ok: true, event, recipientEmail });
}
