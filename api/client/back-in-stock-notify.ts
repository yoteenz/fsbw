import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { sendEmailAsync } from '../_lib/email/sendEmail.js';
import { getProfileContact } from '../_lib/email/triggers.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

/**
 * POST /api/client/back-in-stock-notify — email signed-in user that a unit is back (self only).
 * Body: { productName: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const productName = String(body.productName || '')
    .trim()
    .toUpperCase();
  if (!productName) return res.status(400).json({ error: 'productName required' });

  let customerName = 'SLAYER';
  try {
    const supabase = getSupabaseAdmin();
    const contact = await getProfileContact(supabase, user.id);
    if (contact) customerName = contact.customerName;
  } catch {
    /* optional */
  }

  sendEmailAsync({
    templateType: 'back_in_stock',
    recipientEmail: user.email,
    variables: { productName, customerName },
  });

  return res.status(200).json({ ok: true });
}
