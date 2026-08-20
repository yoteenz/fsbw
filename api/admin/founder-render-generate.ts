export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  executeGovernedProduction,
  finalizeGovernedProduction,
  releaseGovernedProductionReservation,
} from '../_lib/productionGovernance/executeGovernedProduction.js';
import type { ConstructionPlan } from '../../src/studio-os-core/blueprint-author/construction-plan-schema.js';

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
 * POST /api/admin/founder-render-generate
 * Submit Founder Render™ full-room photoreal preview job.
 * Heavy generation libs are dynamic-imported after auth to avoid cold-start module failures.
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
    return res.status(status).json({ ok: false, error, code });
  }

  const body = parseBody(req);
  const plan = body?.plan as ConstructionPlan | undefined;
  if (!plan?.planId || !plan.metadata?.organizationId) {
    return res.status(400).json({ ok: false, error: 'Construction plan payload required', code: 'MISSING_PLAN' });
  }

  const revisionNote = typeof body?.revisionNote === 'string' ? body.revisionNote : null;

  try {
    const supabase = getSupabaseAdmin();
    const orgSlug = plan.metadata.organizationId;
    const governance = await executeGovernedProduction(supabase, {
      routeKey: 'founder-render-generate',
      operatorEmail: auth.user.email ?? '',
      operatorUserId: auth.user.id,
      organizationSlug: orgSlug,
      operationType: 'IMAGE_GENERATION',
      provider: 'fal',
      estimatedCost: 8,
      projectId: plan.planId,
      clientGovernanceEnabled: body?.productionGovernance === false,
    });

    if (!governance.ok) {
      return res.status(403).json({
        ok: false,
        error: governance.error,
        code: governance.code,
      });
    }

    const [{ prepareFounderRenderDispatch }, { insertFounderRenderJob }, { FOUNDER_RENDER_ROUTE_ID }] =
      await Promise.all([
        import('../_lib/founderRenderGeneration.js'),
        import('../_lib/founderRenderJobs.js'),
        import('../_lib/creativeProduction/studio-os-server.bundle.js'),
      ]);

    const dispatch = await prepareFounderRenderDispatch({
      plan,
      actorId: auth.user.email,
      revisionNote,
    });

    if (!dispatch.ok) {
      return res.status(422).json({
        ok: false,
        error: dispatch.error,
        code: dispatch.code,
        missingRole: dispatch.missingRole,
      });
    }

    const inserted = await insertFounderRenderJob({
      plan,
      modelRoute: FOUNDER_RENDER_ROUTE_ID,
      providerModel: dispatch.model,
      promptHash: dispatch.promptHash,
      effectivePrompt: dispatch.effectivePrompt,
      referenceCount: dispatch.referenceCount,
      brandMaterialRefs: dispatch.brandMaterialRefs,
      providerRequestId: dispatch.providerRequestId,
      revisionNote,
      promptVersion: dispatch.promptVersion,
      departmentId: dispatch.departmentId,
      departmentClass: dispatch.departmentClass,
      cacheKey: dispatch.cacheKey,
      architecturalFingerprint: dispatch.architecturalFingerprint,
      referencePackageVersion: dispatch.referencePackageVersion,
      compilerDiagnostics: dispatch.compilerDiagnostics,
      negativePromptHash: dispatch.negativePromptHash,
    });

    if (!inserted.ok) {
      if (governance.reservationId) {
        await releaseGovernedProductionReservation(supabase, governance.reservationId);
      }
      return res.status(500).json({ ok: false, error: inserted.error, code: 'PERSISTENCE_FAILED' });
    }

    if (governance.reservationId) {
      await finalizeGovernedProduction(supabase, {
        reservationId: governance.reservationId,
        operatorUserId: auth.user.id,
        organizationId: governance.governance.billingOwner.billingOwnerId,
        billingOwnerId: governance.governance.billingOwner.billingOwnerId,
        operationType: 'IMAGE_GENERATION',
        provider: 'fal',
        model: dispatch.model,
        estimatedCost: 8,
        outcome: 'completed',
        projectId: plan.planId,
        metadata: { route: 'founder-render-generate', jobId: inserted.jobId },
      });
    }

    return res.status(202).json({
      ok: true,
      jobId: inserted.jobId,
      status: 'generating',
      artifactIntent: 'founder-full-room-preview',
      modelRoute: FOUNDER_RENDER_ROUTE_ID,
      providerModel: dispatch.model,
      promptVersion: dispatch.promptVersion,
      blueprintRevision: plan.metadata.revision,
      providerRequestId: dispatch.providerRequestId,
      referenceCount: dispatch.referenceCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Founder render generation failed';
    console.error('[founder-render-generate] unhandled', err);
    return res.status(500).json({
      ok: false,
      error: message,
      code: 'FOUNDER_RENDER_HANDLER_ERROR',
    });
  }
}
