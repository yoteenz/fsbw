import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { sendEmailAsync } from '../_lib/email/sendEmail.js';

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
 * POST /api/inventory/back-in-stock-notify — email waitlist when a unit restocks (admin session).
 * Body: { entries: [{ email, productName }] }
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
  const raw = body.entries;
  if (!Array.isArray(raw) || raw.length === 0) {
    return res.status(400).json({ error: 'entries array required' });
  }

  let queued = 0;
  for (const item of raw.slice(0, 100)) {
    if (!item || typeof item !== 'object') continue;
    const email = String((item as { email?: string }).email || '')
      .trim()
      .toLowerCase();
    const productName = String((item as { productName?: string }).productName || 'YOUR FAVORITE UNIT')
      .trim()
      .toUpperCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    sendEmailAsync({
      templateType: 'back_in_stock',
      recipientEmail: email,
      variables: { productName, customerName: 'SLAYER' },
    });
    queued += 1;
  }

  return res.status(200).json({ ok: true, queued });
}
