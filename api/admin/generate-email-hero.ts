import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  appendEmailHeroManifestReady,
  generateAndUploadEmailHero,
} from '../_lib/email/generateHeroAsset.js';
import { isEmailTemplateType } from '../_lib/email/templateRegistry.js';
import type { EmailTemplateType } from '../_lib/email/types.js';

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
 * POST /api/admin/generate-email-hero
 * Body: { templateType: string }
 * Admin session or X-Email-Send-Secret. Generates one Fal hero + Supabase upload.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Email-Send-Secret');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAuthorizedInternal(req)) {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: 'Forbidden' });
  }

  const body = parseBody(req);
  const templateType = String(body?.templateType || '').trim();
  if (!isEmailTemplateType(templateType)) {
    return res.status(400).json({ error: 'Invalid templateType' });
  }

  const result = await generateAndUploadEmailHero(templateType as EmailTemplateType, {
    uploadToSupabase: true,
    saveLocal: false,
  });

  if (!result.ok) {
    const status = result.error?.includes('FAL_KEY') ? 503 : 400;
    return res.status(status).json({ ok: false, error: result.error, templateType });
  }

  try {
    await appendEmailHeroManifestReady(templateType as EmailTemplateType);
  } catch {
    /* Vercel fs may be read-only */
  }

  return res.status(200).json({
    ok: true,
    templateType,
    publicUrl: result.publicUrl,
  });
}
