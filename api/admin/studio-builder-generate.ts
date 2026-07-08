export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { generateStudioBuilderAsset } from '../_lib/studioBuilderGeneration.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  evaluateCreativeDecision,
  getPersistedDecision,
  persistCreativeDecision,
} from '../_lib/creativeIntelligenceEngine/decision-engine.js';
import type { FounderIntentInput } from '../_lib/creativeIntelligenceEngine/types.js';

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
  const evaluateOnly = body?.evaluateOnly === true;
  const skipCie = body?.skipCie === true;
  const forceGenerate = body?.forceGenerate === true;
  const cieDecisionId = typeof body?.cieDecisionId === 'string' ? body.cieDecisionId.trim() : '';
  const orgId = typeof body?.org_id === 'string' ? body.org_id.trim() : 'frontal-slayer';

  if (!departmentId || !packageId || !projectId || !productionGroupId || !heroAssetId || !prompt) {
    return res.status(400).json({
      error: 'Missing departmentId, packageId, projectId, productionGroupId, heroAssetId, or prompt',
    });
  }

  if (!skipCie) {
    const supabase = getSupabaseAdmin();
    let decision = cieDecisionId
      ? await getPersistedDecision(supabase, orgId, cieDecisionId)
      : null;

    if (!decision) {
      const intent: FounderIntentInput = {
        org_id: orgId,
        raw_intent: prompt,
        category: productionGroupId,
        department_id: departmentId,
        workspace_id: projectId,
        asset_type: 'image',
        genome_snapshot:
          typeof body?.genome_snapshot === 'object' && body.genome_snapshot !== null
            ? (body.genome_snapshot as FounderIntentInput['genome_snapshot'])
            : undefined,
      };
      decision = await evaluateCreativeDecision(supabase, intent);
      await persistCreativeDecision(supabase, decision);
    }

    if (evaluateOnly) {
      return res.status(200).json({ ok: true, evaluateOnly: true, decision });
    }

    const reuseOnly =
      !forceGenerate &&
      decision.recommended_strategy === 'reuse_existing' &&
      decision.assets_missing.length === 0;

    if (reuseOnly || (!forceGenerate && !decision.should_generate)) {
      return res.status(200).json({
        ok: false,
        code: 'CIE_REUSE_RECOMMENDED',
        error: 'Creative Intelligence Engine recommends reusing existing assets — no generation required.',
        decision,
        reusable_assets: decision.reusable_assets.slice(0, 5),
        founder_messages: decision.founder_messages,
      });
    }

    if (cieDecisionId && cieDecisionId !== decision.id) {
      return res.status(400).json({ error: 'cieDecisionId does not match evaluated decision' });
    }
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
