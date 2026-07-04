export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { generateStudioAssetImage } from '../_lib/studioAssetGeneration.js';

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
 * POST /api/admin/studio-generate-asset
 * Admin-only Fal generation for Asset Director version tiles → Asset Factory pipeline.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  const body = parseBody(req);
  const blueprintId = String(body?.blueprintId || '').trim();
  const blueprintName = String(body?.blueprintName || '').trim();
  const studioId = String(body?.studioId || '').trim();
  const variantId = String(body?.variantId || '').trim();
  const variantName = String(body?.variantName || '').trim();
  const referenceImageUrl =
    typeof body?.referenceImageUrl === 'string' ? body.referenceImageUrl.trim() : undefined;
  const promptStack = Array.isArray(body?.promptStack)
    ? body.promptStack.map((line) => String(line).trim()).filter(Boolean)
    : [];

  if (!blueprintId || !studioId || !variantId || !variantName) {
    return res.status(400).json({ error: 'Missing blueprintId, studioId, variantId, or variantName' });
  }

  const result = await generateStudioAssetImage({
    blueprintId,
    blueprintName: blueprintName || blueprintId,
    studioId,
    variantId,
    variantName,
    promptStack,
    referenceImageUrl,
  });

  if (!result.ok) {
    return res.status(result.error?.includes('FAL_KEY') ? 503 : 500).json(result);
  }

  return res.status(200).json(result);
}
