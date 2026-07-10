export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { assertSceneStackFalReferencesAllowed } from '../_lib/sceneStackReferenceEnforcement.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  evaluateCreativeDecision,
  getPersistedDecision,
  persistCreativeDecision,
} from '../_lib/creativeIntelligenceEngine/decision-engine.js';
import type { FounderIntentInput } from '../_lib/creativeIntelligenceEngine/types.js';
import { adaptLegacyBuilderRequest } from '../_lib/creativeProduction/legacy-adapters.js';
import { executeGovernedGeneration } from '../_lib/creativeProduction/generation-gateway.js';

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
 * Governed Studio Builder generation — routes through Creative Production Gateway™.
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
  const evaluateOnly = body?.evaluateOnly === true;
  const orgId = typeof body?.org_id === 'string' ? body.org_id.trim() : 'frontal-slayer';

  if (!departmentId || !packageId || !projectId || !productionGroupId || !heroAssetId || !prompt) {
    return res.status(400).json({
      error: 'Missing departmentId, packageId, projectId, productionGroupId, heroAssetId, or prompt',
    });
  }

  if (evaluateOnly) {
    const supabase = getSupabaseAdmin();
    const cieDecisionId = typeof body?.cieDecisionId === 'string' ? body.cieDecisionId.trim() : '';
    let decision = cieDecisionId ? await getPersistedDecision(supabase, orgId, cieDecisionId) : null;
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
    return res.status(200).json({ ok: true, evaluateOnly: true, decision });
  }

  const referenceImageUrls = Array.isArray(body?.referenceImageUrls)
    ? (body.referenceImageUrls as unknown[]).filter((u): u is string => typeof u === 'string' && u.startsWith('http'))
    : undefined;

  const refCheck = assertSceneStackFalReferencesAllowed({ productionGroupId, referenceImageUrls });
  if (!refCheck.ok) {
    return res.status(400).json({ ok: false, error: refCheck.error, code: 'SCENE_STACK_REFERENCE_LAW' });
  }

  const adapted = adaptLegacyBuilderRequest(body ?? {}, '/api/admin/studio-builder-generate');
  if ('error' in adapted) {
    return res.status(adapted.code === 'AUTH_REQUIRED' ? 403 : 400).json({
      ok: false,
      code: adapted.code,
      error: adapted.error,
    });
  }

  if (body?.skipCie === true || body?.forceGenerate === true) {
    if (adapted.assetIntent.outputClass === 'material') {
      return res.status(403).json({
        ok: false,
        code: body.skipCie ? 'CIE_SKIP_FORBIDDEN' : 'CIE_FORCE_FORBIDDEN',
        error: `${body.skipCie ? 'skipCie' : 'forceGenerate'} is forbidden on material generation paths`,
      });
    }
  }

  const result = await executeGovernedGeneration(adapted, {
    sourceRoute: '/api/admin/studio-builder-generate',
  });

  if (!result.ok) {
    const status =
      result.code === 'CIE_REUSE_RECOMMENDED'
        ? 200
        : result.code === 'AUTH_REQUIRED' || result.code.startsWith('AUTH_')
          ? 403
          : result.error?.includes('FAL_KEY')
            ? 503
            : 500;
    return res.status(status).json(result);
  }

  return res.status(200).json({
    ok: true,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
    model: result.model,
    productionAuthorizationId: result.audit.productionAuthorizationId,
    assetRegistryId: result.assetRegistryId,
    audit: result.audit,
    legacyCompat: result.audit.legacyCompat ?? false,
  });
}
