export const config = {
  maxDuration: 30,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { approveFounderRenderJob, getFounderRenderJob } from '../_lib/founderRenderJobs.js';
import { FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION } from '../_lib/creativeProduction/studio-os-server.bundle.js';

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
 * POST /api/admin/founder-render-approve
 * Persist Founder Render approval record before manufacturing.
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
  const jobId = String(body?.jobId ?? '').trim();
  const currentBlueprintRevision = Number(body?.currentBlueprintRevision ?? 0);
  const materialSet = String(body?.materialSet ?? '');
  const lightingProfile = String(body?.lightingProfile ?? '');
  const cameraProfile = String(body?.cameraProfile ?? '');

  if (!jobId) return res.status(400).json({ ok: false, error: 'jobId required', code: 'MISSING_JOB_ID' });

  const row = await getFounderRenderJob(jobId);
  if (!row) return res.status(404).json({ ok: false, error: 'Job not found', code: 'JOB_NOT_FOUND' });

  if (row.status !== 'ready' || !row.preview_artifact_url) {
    return res.status(422).json({
      ok: false,
      error: 'Founder render must be ready with preview artifact before approval',
      code: 'PREVIEW_NOT_READY',
    });
  }

  if (currentBlueprintRevision > row.blueprint_revision) {
    return res.status(422).json({
      ok: false,
      error: `Preview stale: revision ${row.blueprint_revision} vs current ${currentBlueprintRevision}`,
      code: 'PREVIEW_STALE',
    });
  }

  try {
    const approvalRecord = {
      previewArtifactId: row.job_id,
      previewArtifactUrl: row.preview_artifact_url,
      blueprintId: row.blueprint_id,
      blueprintRevision: row.blueprint_revision,
      constructionPlanId: row.construction_plan_id,
      founderId: auth.user.email,
      approvedAt: new Date().toISOString(),
      model: row.provider_model ?? '',
      promptVersion: row.prompt_version ?? FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
      materialSet,
      lightingProfile,
      cameraProfile,
    };

    await approveFounderRenderJob({
      jobId,
      approvedBy: auth.user.email,
      approvalRecord,
    });

    return res.status(200).json({ ok: true, jobId, status: 'approved', approvalRecord });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Founder render approval failed';
    console.error('[founder-render-approve] unhandled', err);
    return res.status(500).json({
      ok: false,
      error: message,
      code: 'FOUNDER_RENDER_APPROVE_HANDLER_ERROR',
    });
  }
}
