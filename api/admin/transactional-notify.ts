import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { sendEmail } from '../_lib/email/sendEmail.js';
import { getProfileContact } from '../_lib/email/triggers.js';
import { emailTemplateForOrderStatus, emailTemplateForTrackingUpdate } from '../_lib/email/orderLifecycle.js';
import type { EmailTemplateType, EmailTemplateVariables } from '../_lib/email/types.js';
import { isEmailTemplateType } from '../_lib/email/templateRegistry.js';

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

/**
 * POST /api/admin/transactional-notify — send a lifecycle email (admin only).
 * Body: { templateType?, event?, userId?, recipientEmail?, subject?, variables?, orderStatus?, trackingNumber? }
 * Either templateType or event/orderStatus is required.
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
  let templateType = String(body.templateType || body.event || '').trim();
  const orderStatus = String(body.orderStatus || body.status || '').trim();
  const trackingNumber = String(body.trackingNumber || '').trim();

  if (!templateType && orderStatus) {
    templateType =
      emailTemplateForTrackingUpdate(Boolean(trackingNumber), orderStatus) ||
      emailTemplateForOrderStatus(orderStatus) ||
      '';
  }

  if (!isEmailTemplateType(templateType)) {
    return res.status(400).json({ error: 'templateType or orderStatus required' });
  }

  const typedTemplate = templateType as EmailTemplateType;
  let recipientEmail = String(body.recipientEmail || body.email || '')
    .trim()
    .toLowerCase();
  const userId = String(body.userId || '').trim();
  let customerName = String((body.variables as EmailTemplateVariables | undefined)?.customerName || '').trim();

  if (userId) {
    const supabase = getSupabaseAdmin();
    const contact = await getProfileContact(supabase, userId);
    if (contact) {
      if (!recipientEmail) recipientEmail = contact.email;
      if (!customerName) customerName = contact.customerName;
    }
  }

  if (!recipientEmail) return res.status(400).json({ error: 'recipientEmail or userId required' });

  const variables: EmailTemplateVariables = {
    ...(body.variables && typeof body.variables === 'object' && !Array.isArray(body.variables)
      ? (body.variables as EmailTemplateVariables)
      : {}),
  };
  variables.customerName = customerName || variables.customerName || 'SLAYER';
  if (trackingNumber && !variables.trackingNumber) variables.trackingNumber = trackingNumber;

  const subject = typeof body.subject === 'string' ? body.subject : undefined;
  const result = await sendEmail({
    templateType: typedTemplate,
    recipientEmail,
    subject,
    variables,
  });

  if (!result.sent) {
    return res.status(result.error?.includes('not configured') ? 503 : 400).json({ ok: false, error: result.error });
  }

  return res.status(200).json({ ok: true, id: result.id, templateType: typedTemplate, recipientEmail });
}
