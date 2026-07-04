export const config = {
  maxDuration: 300,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { runProductAssetFactoryPipeline } from '../_lib/productAssetFactory/pipeline.js';
import { generateMasterHeroFromCreativeDna } from '../_lib/productPhotographyGeneration/generateMasterHero.js';
import { PRODUCT_PHOTOGRAPHY_POC_UNIT } from '../_lib/productPhotographyGeneration/creativeDnaV1.js';
import type {
  ProductPhotographyGenerateAction,
  ProductPhotographyGenerateResult,
} from '../_lib/productPhotographyGeneration/types.js';

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
 * POST /api/admin/product-photography-generate
 * Creative DNA v1.0 → Fal Master Hero generation → optional Asset Factory chain (SOFT WAVE POC).
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
  const action = String(body?.action || 'generate-variants').trim() as ProductPhotographyGenerateAction;
  const unitSlug = String(body?.unitSlug || PRODUCT_PHOTOGRAPHY_POC_UNIT.slug).trim();
  const productReferenceImageSrc =
    typeof body?.productReferenceImageSrc === 'string' ? body.productReferenceImageSrc.trim() : undefined;
  const runAssetFactory = body?.runAssetFactory !== false;

  if (action !== 'generate-variants' && action !== 'replace-reference') {
    return res.status(400).json({ error: 'Invalid action — use generate-variants or replace-reference' });
  }

  if (action === 'replace-reference' && !productReferenceImageSrc) {
    return res.status(400).json({ error: 'replace-reference requires productReferenceImageSrc' });
  }

  const generation = await generateMasterHeroFromCreativeDna({
    action,
    unitSlug,
    productReferenceImageSrc,
    includeBenchmarkAttachment: action === 'generate-variants',
  });

  const result: ProductPhotographyGenerateResult = {
    ok: generation.ok,
    action,
    unitSlug,
    falModel: generation.falModel,
    generatedMasterUrl: generation.generatedMasterUrl,
    storagePath: generation.storagePath,
    productReferenceImageSrc: generation.productReferenceImageSrc,
    displayBustSrc: generation.displayBustSrc,
    logs: generation.logs,
    error: generation.error,
  };

  if (!generation.ok || !generation.generatedMasterUrl) {
    return res.status(500).json(result);
  }

  if (runAssetFactory) {
    result.logs.push({
      timestamp: new Date().toISOString(),
      message: 'Chaining Asset Factory pipeline on generated master',
      level: 'info',
    });
    const factory = await runProductAssetFactoryPipeline({
      masterHeroSrc: generation.generatedMasterUrl,
    });
    result.assetFactory = factory;
    result.logs.push({
      timestamp: new Date().toISOString(),
      message: factory.ok ? 'Asset Factory pipeline complete' : `Asset Factory failed: ${factory.error ?? 'unknown'}`,
      level: factory.ok ? 'info' : 'error',
    });
    result.ok = factory.ok;
    if (!factory.ok) result.error = factory.error ?? 'Asset Factory pipeline failed after generation';
  }

  return res.status(result.ok ? 200 : 500).json(result);
}
