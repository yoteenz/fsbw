import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_PREVIEW_SAMPLE_VARIABLES,
} from '../_lib/email/templateCatalog.js';

/**
 * GET /api/email/templates — catalog of template types by category (admin only).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  return res.status(200).json({
    categories: EMAIL_TEMPLATE_CATEGORIES,
    sampleVariables: EMAIL_PREVIEW_SAMPLE_VARIABLES,
  });
}
