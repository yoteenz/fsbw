import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { parseStudioImageDataUrl, uploadStudioAssetBytes } from '../_lib/studioAssetGeneration.js';

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

/**
 * POST /api/admin/studio-replace-asset
 * Admin upload replacement for an Asset Director version tile (no Fal).
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
  const studioId = String(body?.studioId || '').trim();
  const variantId = String(body?.variantId || '').trim();
  const imageDataUrl = typeof body?.imageDataUrl === 'string' ? body.imageDataUrl : '';

  if (!studioId || !variantId || !imageDataUrl) {
    return res.status(400).json({ error: 'Missing studioId, variantId, or imageDataUrl' });
  }

  const parsed = parseStudioImageDataUrl(imageDataUrl);
  if (!parsed) return res.status(400).json({ error: 'Invalid image data URL' });
  if (parsed.bytes.byteLength > 8 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image must be <= 8MB' });
  }

  const upload = await uploadStudioAssetBytes(parsed.bytes, studioId, variantId, parsed.mime);
  if (!upload.ok) return res.status(500).json(upload);

  return res.status(200).json(upload);
}
