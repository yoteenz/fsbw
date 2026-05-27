import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';
import { sendBrandContactNotifyEmail } from '../_lib/contactNotifyEmail.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function isValidEmail(e: string): boolean {
  const s = e.trim().toLowerCase();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** POST /api/brand/contact-submit — public contact form (stores inquiry + emails admin). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: 'JSON body required' });

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 8000) : '';
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().slice(0, 80) : '';
  const isOrderRelatedRaw = body.isOrderRelated ?? body.is_order_related;
  const isOrderRelated =
    isOrderRelatedRaw === true ||
    isOrderRelatedRaw === 'yes' ||
    isOrderRelatedRaw === 'YES';

  if (!name || name.length < 2) return res.status(400).json({ error: 'name is required' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'valid email is required' });
  if (!message || message.length < 3) return res.status(400).json({ error: 'message is required' });

  let inquiryId = `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  let storedInDb = false;

  if (hasSupabaseServiceRole()) {
    try {
      const supabase = getSupabaseAdminServiceRole();
      const { data, error } = await supabase
        .from('brand_contact_inquiries')
        .insert({
          name: name.toUpperCase(),
          email,
          is_order_related: isOrderRelated,
          order_number: orderNumber ? orderNumber.toUpperCase() : null,
          message: message.toUpperCase(),
          status: 'new',
        })
        .select('id')
        .single();
      if (!error && data?.id) {
        storedInDb = true;
        inquiryId = String(data.id);
      }
    } catch {
      /* table may not exist yet */
    }
  }

  const emailResult = await sendBrandContactNotifyEmail({
    name: name.toUpperCase(),
    email,
    isOrderRelated,
    orderNumber: orderNumber.toUpperCase(),
    message: message.toUpperCase(),
    inquiryId,
  });

  if (!storedInDb && !emailResult.sent) {
    return res.status(503).json({
      error:
        emailResult.error ||
        'Could not deliver your message. Try emailing CONTACT@FRONTALSLAYER.COM directly.',
      inquiryId,
    });
  }

  return res.status(200).json({
    ok: true,
    inquiryId,
    storedInDb,
    emailSent: emailResult.sent,
  });
}
