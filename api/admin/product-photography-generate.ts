export const config = {
  maxDuration: 300,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  buildHeroAwaitingApprovalJob,
} from '../_lib/productAssetFactory/pipeline.js';
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
 * Creative DNA v1.0 → Fal Master Hero generation (SOFT WAVE POC).
 * Derivative processing is blocked until the generated master is approved in Asset Factory.
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
    includeBenchmarkAttachment: false,
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
    generation: generation.generation,
    logs: generation.logs,
    error: generation.error,
  };

  if (!generation.ok || !generation.generatedMasterUrl) {
    return res.status(500).json(result);
  }

  result.logs.push({
    timestamp: new Date().toISOString(),
    message: 'Master Hero generated — awaiting approval before Asset Factory derivative processing',
    level: 'info',
  });

  const heroJob = buildHeroAwaitingApprovalJob({
    productReferenceSrc: generation.productReferenceImageSrc,
    generatedMasterHeroUrl: generation.generatedMasterUrl,
    generation: generation.generation,
  });

  result.generation = generation.generation;

  result.assetFactory = {
    ok: true,
    job: heroJob,
    registry: [],
    logs: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: 'awaiting-hero-approval',
        message: 'Generated master queued for approval — background removal blocked',
        level: 'info',
      },
    ],
  };

  return res.status(200).json(result);
}
