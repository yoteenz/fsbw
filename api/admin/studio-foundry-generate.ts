export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { compileAssetIntent } from '../../src/studio-os-core/asset-compiler/compiler.js';
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
 * POST /api/admin/studio-foundry-generate
 * Studio Foundry™ FAL adapter — manufactures a single asset via existing integration.
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
  const slug = String(body?.slug || '').trim();
  const recipeId = String(body?.recipeId || 'hero-icon').trim() as 'hero-icon';
  const assetName = String(body?.assetName || slug.split('.').pop() || 'Foundry Asset').trim();
  const promptOverride = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

  if (!slug) return res.status(400).json({ ok: false, error: 'Missing slug' });

  const plan = compileAssetIntent({
    assetId: slug,
    assetName,
    recipeId,
    modifiers: promptOverride ? [promptOverride] : undefined,
    creator: String(body?.creator || 'Studio Foundry'),
    organizationId: typeof body?.organizationId === 'string' ? body.organizationId : undefined,
  });

  const safeSlug = slug.replace(/[^a-zA-Z0-9.-]/g, '_');
  const result = await generateStudioBuilderAsset({
    departmentId: 'studio-foundry',
    packageId: recipeId,
    projectId: 'hero-icons',
    productionGroupId: safeSlug,
    heroAssetId: safeSlug,
    prompt: plan.metadata.prompt,
    aspectRatio: plan.metadata.generationParameters.aspectRatio,
    outputFormat: plan.metadata.generationParameters.outputFormat === 'webp' ? 'webp' : 'png',
  });

  if (!result.ok) {
    return res.status(result.error?.includes('FAL_KEY') ? 503 : 500).json({
      ok: false,
      error: result.error ?? 'Foundry generation failed',
    });
  }

  return res.status(200).json({
    ok: true,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
    model: result.model,
    slug,
  });
}
