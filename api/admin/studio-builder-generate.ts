export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { generateStudioBuilderAsset } from '../_lib/studioBuilderGeneration.js';

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
 * POST /api/admin/studio-builder-generate
 * Department-agnostic Studio Builder generation — reuses FAL + Supabase stack.
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
  const departmentId = String(body?.departmentId || '').trim();
  const packageId = String(body?.packageId || '').trim();
  const projectId = String(body?.projectId || '').trim();
  const productionGroupId = String(body?.productionGroupId || '').trim();
  const heroAssetId = String(body?.heroAssetId || '').trim();
  const prompt = String(body?.prompt || '').trim();
  const aspectRatio = String(body?.aspectRatio || '16:9').trim();
  const outputFormat = body?.outputFormat === 'webp' ? 'webp' : 'png';

  if (!departmentId || !packageId || !projectId || !productionGroupId || !heroAssetId || !prompt) {
    return res.status(400).json({
      error: 'Missing departmentId, packageId, projectId, productionGroupId, heroAssetId, or prompt',
    });
  }

  const result = await generateStudioBuilderAsset({
    departmentId,
    packageId,
    projectId,
    productionGroupId,
    heroAssetId,
    prompt,
    aspectRatio,
    outputFormat,
  });

  if (!result.ok) {
    return res.status(result.error?.includes('FAL_KEY') ? 503 : 500).json(result);
  }

  return res.status(200).json({
    ok: true,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
    model: result.model,
  });
}
