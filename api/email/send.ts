import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { sendEmail, renderEmailTemplate } from '../_lib/email/sendEmail.js';
import { EMAIL_TEMPLATE_REGISTRY, isEmailTemplateType } from '../_lib/email/templateRegistry.js';
import type { EmailTemplateVariables } from '../_lib/email/types.js';

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

function isAuthorizedInternal(req: VercelRequest): boolean {
  const secret = process.env.EMAIL_SEND_SECRET?.trim();
  if (!secret) return false;
  const header = String(req.headers['x-email-send-secret'] || req.headers['x-internal-secret'] || '');
  return header === secret;
}

/**
 * POST /api/email/send — server-side transactional email (admin session or EMAIL_SEND_SECRET).
 * Body: { templateType, recipientEmail, subject?, variables? }
 * Never expose EMAIL_SEND_SECRET or RESEND_API_KEY to the frontend.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Email-Send-Secret');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const internal = isAuthorizedInternal(req);
  if (!internal) {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: 'Forbidden' });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: 'JSON body required' });

  const templateType = String(body.templateType || '').trim();
  if (!isEmailTemplateType(templateType)) {
    return res.status(400).json({ error: 'Invalid templateType', valid: Object.keys(EMAIL_TEMPLATE_REGISTRY) });
  }

  const recipientEmail = String(body.recipientEmail || '').trim();
  if (!recipientEmail) return res.status(400).json({ error: 'recipientEmail required' });

  const subject = typeof body.subject === 'string' ? body.subject : undefined;
  const variables =
    body.variables && typeof body.variables === 'object' && !Array.isArray(body.variables)
      ? (body.variables as EmailTemplateVariables)
      : {};

  const previewOnly = body.preview === true || req.query.preview === '1';

  if (previewOnly) {
    const rendered = renderEmailTemplate(templateType, variables, subject);
    return res.status(200).json({
      ok: true,
      preview: true,
      subject: rendered.subject,
      html: rendered.html,
    });
  }

  const result = await sendEmail({ templateType, recipientEmail, subject, variables });
  if (!result.sent) {
    return res.status(result.error?.includes('not configured') ? 503 : 400).json({
      ok: false,
      error: result.error,
    });
  }

  return res.status(200).json({ ok: true, id: result.id, templateType, recipientEmail });
}
