export const config = {
  maxDuration: 300,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  runProductAssetFactoryPipeline,
  PRODUCT_ASSET_FACTORY_POC_UNIT,
} from '../_lib/productAssetFactory/pipeline.js';
import type {
  ProductAssetFactoryAction,
  ProductAssetFactoryStage,
} from '../_lib/productAssetFactory/types.js';

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

const VALID_ACTIONS: ProductAssetFactoryAction[] = [
  'generate-hero',
  'approve-hero',
  'run-derivatives',
  'regenerate-derivative',
  'retry',
];

/**
 * POST /api/admin/product-asset-factory-run
 * Creative DNA → Generate Master Hero → Approval → Derivatives (SOFT WAVE POC).
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
  const actionRaw = String(body?.action || 'generate-hero').trim();
  const action = (actionRaw === 'run' ? 'generate-hero' : actionRaw) as ProductAssetFactoryAction;
  const unitSlug = String(body?.unitSlug || PRODUCT_ASSET_FACTORY_POC_UNIT.slug).trim();
  const fromStage = body?.fromStage ? (String(body.fromStage) as ProductAssetFactoryStage) : undefined;
  const productReferenceSrc =
    typeof body?.productReferenceSrc === 'string' ? body.productReferenceSrc.trim() : undefined;
  const generatedMasterHeroSrc =
    typeof body?.generatedMasterHeroSrc === 'string' ? body.generatedMasterHeroSrc.trim() : undefined;
  const heroApproved = body?.heroApproved === true;
  const assetType = typeof body?.assetType === 'string' ? body.assetType.trim() : undefined;
  const transparentMasterUrl =
    typeof body?.transparentMasterUrl === 'string' ? body.transparentMasterUrl.trim() : undefined;
  const masterHeroGeneration =
    body?.masterHeroGeneration && typeof body.masterHeroGeneration === 'object'
      ? (body.masterHeroGeneration as import('../_lib/productPhotographyGeneration/types.js').MasterHeroGenerationRecord)
      : undefined;

  if (unitSlug !== PRODUCT_ASSET_FACTORY_POC_UNIT.slug) {
    return res.status(400).json({
      error: `Only ${PRODUCT_ASSET_FACTORY_POC_UNIT.slug} POC is enabled in this milestone`,
      pocUnit: PRODUCT_ASSET_FACTORY_POC_UNIT.slug,
    });
  }

  if (!VALID_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: 'Invalid action — use generate-hero, approve-hero, run-derivatives, or retry',
    });
  }

  if (action === 'retry' && !fromStage) {
    return res.status(400).json({ error: 'Retry requires fromStage (failed step to restart from)' });
  }

  const result = await runProductAssetFactoryPipeline({
    action,
    fromStage: action === 'retry' ? fromStage : undefined,
    productReferenceSrc,
    generatedMasterHeroSrc,
    masterHeroGeneration,
    heroApproved,
    assetType,
    transparentMasterUrl,
  });

  return res.status(result.ok ? 200 : 500).json(result);
}
