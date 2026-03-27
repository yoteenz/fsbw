import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { writeAuditLog } from '../_lib/auditLog';

const MAX_RECIPIENTS = 100;
const RESEND_API = 'https://api.resend.com/emails';

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

/**
 * POST /api/admin/newsletter-send — send HTML email to a list of addresses (admin only).
 * Requires RESEND_API_KEY and NEWSLETTER_FROM_EMAIL (or uses Resend onboarding sender in dev).
 * Body: { subject: string, html: string, to: string[] }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({
      error: 'Newsletter sending is not configured. Set RESEND_API_KEY (and NEWSLETTER_FROM_EMAIL) in Vercel env.',
    });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: 'JSON body required' });

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const html = typeof body.html === 'string' ? body.html.trim() : '';
  const rawTo = body.to;
  if (!subject || subject.length > 300) {
    return res.status(400).json({ error: 'subject is required (max 300 characters)' });
  }
  if (!html || html.length > 500_000) {
    return res.status(400).json({ error: 'html body is required (max 500k characters)' });
  }
  if (!Array.isArray(rawTo) || rawTo.length === 0) {
    return res.status(400).json({ error: 'to must be a non-empty array of email strings' });
  }
  if (rawTo.length > MAX_RECIPIENTS) {
    return res.status(400).json({ error: `Maximum ${MAX_RECIPIENTS} recipients per request. Split into multiple sends.` });
  }

  const toUnique = new Set<string>();
  for (const x of rawTo) {
    if (typeof x !== 'string') continue;
    const e = x.trim().toLowerCase();
    if (isValidEmail(e)) toUnique.add(e);
  }
  const recipients = [...toUnique];
  if (recipients.length === 0) {
    return res.status(400).json({ error: 'No valid email addresses in to[]' });
  }

  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Frontal Slayer <onboarding@resend.dev>';

  const failed: { email: string; error: string }[] = [];
  let sent = 0;

  for (const to of recipients) {
    try {
      const r = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], subject, html }),
      });
      if (!r.ok) {
        let msg = await r.text();
        try {
          const j = JSON.parse(msg) as { message?: string };
          if (typeof j?.message === 'string') msg = j.message;
        } catch {
          /* keep text */
        }
        failed.push({ email: to, error: msg.slice(0, 500) });
      } else {
        sent += 1;
      }
    } catch (e) {
      failed.push({
        email: to,
        error: e instanceof Error ? e.message : 'Request failed',
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  try {
    await writeAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'newsletter.send',
      resourceType: 'newsletter',
      resourceId: subject.slice(0, 80),
      details: { recipientCount: recipients.length, sent, failedCount: failed.length },
    });
  } catch {
    /* ignore */
  }

  return res.status(200).json({
    ok: true,
    sent,
    failed,
    attempted: recipients.length,
  });
}
