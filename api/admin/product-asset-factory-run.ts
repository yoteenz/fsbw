export const config = {
  maxDuration: 300,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  runProductAssetFactoryPipeline,
  PRODUCT_ASSET_FACTORY_POC_UNIT,
} from '../_lib/productAssetFactory/pipeline.js';
import type { ProductAssetFactoryStage } from '../_lib/productAssetFactory/types.js';

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
 * POST /api/admin/product-asset-factory-run
 * Photography Bible → Asset Factory pipeline (SOFT WAVE POC).
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
  const action = String(body?.action || 'run').trim();
  const unitSlug = String(body?.unitSlug || PRODUCT_ASSET_FACTORY_POC_UNIT.slug).trim();
  const fromStage = body?.fromStage ? (String(body.fromStage) as ProductAssetFactoryStage) : undefined;
  const masterHeroSrc =
    typeof body?.masterHeroSrc === 'string' ? body.masterHeroSrc.trim() : undefined;

  if (unitSlug !== PRODUCT_ASSET_FACTORY_POC_UNIT.slug) {
    return res.status(400).json({
      error: `Only ${PRODUCT_ASSET_FACTORY_POC_UNIT.slug} POC is enabled in this milestone`,
      pocUnit: PRODUCT_ASSET_FACTORY_POC_UNIT.slug,
    });
  }

  if (action === 'retry' && !fromStage) {
    return res.status(400).json({ error: 'Retry requires fromStage (failed step to restart from)' });
  }

  const result = await runProductAssetFactoryPipeline({
    fromStage: action === 'retry' ? fromStage : undefined,
    masterHeroSrc,
  });

  return res.status(result.ok ? 200 : 500).json(result);
}
