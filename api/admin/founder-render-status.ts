export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  getFounderRenderJob,
  updateFounderRenderJobFailed,
  updateFounderRenderJobReady,
} from '../_lib/founderRenderJobs.js';
import { FOUNDER_RENDER_ARTIFACT_INTENT } from '../_lib/creativeProduction/studio-os-server.bundle.js';

/**
 * GET /api/admin/founder-render-status?jobId=...
 * Poll Founder Render job — advances FAL queue and persists result.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ ok: false, error, code });
  }

  const jobId = String(req.query.jobId ?? '').trim();
  if (!jobId) return res.status(400).json({ ok: false, error: 'jobId required' });

  try {
    const row = await getFounderRenderJob(jobId);
    if (!row) return res.status(404).json({ ok: false, error: 'Job not found', code: 'JOB_NOT_FOUND' });

    if (row.status === 'generating' && row.provider_request_id && row.provider_model) {
      const started = row.diagnostics?.dispatchTimestamp
        ? Date.parse(String(row.diagnostics.dispatchTimestamp))
        : Date.now();
      const { pollStudioBuilderFalQueue, fetchStudioBuilderFalResult } = await import('../_lib/studioBuilderGeneration.js');
      const { status } = await pollStudioBuilderFalQueue(row.provider_model, row.provider_request_id);
      if (status === 'COMPLETED') {
        const imageUrl = await fetchStudioBuilderFalResult(row.provider_model, row.provider_request_id);
        if (imageUrl) {
          const { finalizeStudioBuilderFromFalUrl } = await import('../_lib/studioBuilderGeneration.js');
          const { resolveFounderRenderModelRoute } = await import('../_lib/creativeProduction/studio-os-server.bundle.js');
          const route = resolveFounderRenderModelRoute('16:9');
          const finalized = await finalizeStudioBuilderFromFalUrl(
            {
              departmentId: row.organization_id,
              packageId: 'founder-render',
              projectId: row.project_id,
              productionGroupId: `founder-render-${row.room_id}`,
              heroAssetId: 'full-room-preview',
              prompt: 'founder-render',
              aspectRatio: route.aspectRatio,
              outputFormat: route.outputFormat,
              organizationId: row.organization_id,
            },
            imageUrl,
            row.provider_model
          );
          if (finalized.ok && finalized.publicUrl) {
            await updateFounderRenderJobReady(jobId, {
              previewArtifactUrl: finalized.publicUrl,
              storagePath: finalized.storagePath ?? '',
              generationDurationMs: Date.now() - started,
            });
            row.status = 'ready';
            row.preview_artifact_url = finalized.publicUrl;
            row.storage_path = finalized.storagePath ?? null;
          } else {
            await updateFounderRenderJobFailed(jobId, finalized.error ?? 'Finalize failed');
            row.status = 'failed';
            row.failure_reason = finalized.error ?? 'Finalize failed';
          }
        }
      } else if (status === 'FAILED') {
        await updateFounderRenderJobFailed(jobId, 'FAL provider job failed');
        row.status = 'failed';
        row.failure_reason = 'FAL provider job failed';
      }
    }

    const currentRevision = Number(req.query.currentBlueprintRevision ?? row.blueprint_revision);
    const isStale =
      row.status === 'ready' &&
      row.preview_artifact_url &&
      currentRevision > row.blueprint_revision;

    return res.status(200).json({
      ok: true,
      jobId: row.job_id,
      status: isStale ? 'stale' : row.status,
      artifactIntent: row.artifact_intent ?? FOUNDER_RENDER_ARTIFACT_INTENT,
      previewArtifactUrl: row.preview_artifact_url,
      failureReason: row.failure_reason,
      blueprintRevision: row.blueprint_revision,
      currentBlueprintRevision: currentRevision,
      isStale,
      modelRoute: row.model_route,
      providerModel: row.provider_model,
      promptVersion: row.prompt_version,
      approvalStatus: row.approval_status,
      diagnostics: {
        artifactIntent: row.artifact_intent,
        modelRoute: row.model_route,
        providerModel: row.provider_model,
        promptVersion: row.prompt_version,
        blueprintRevision: row.blueprint_revision,
        referenceCount: row.reference_count,
        brandMaterialReferences: row.brand_material_refs,
        providerJobId: row.provider_request_id,
        outputUrl: row.preview_artifact_url,
        persistenceStatus: row.preview_artifact_url ? 'persisted' : row.status,
        approvalStatus: row.approval_status,
        effectivePromptPreview: row.effective_prompt ? row.effective_prompt.slice(0, 400) : null,
        ...row.diagnostics,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Founder render status failed';
    console.error('[founder-render-status] unhandled', err);
    return res.status(500).json({
      ok: false,
      error: message,
      code: 'FOUNDER_RENDER_STATUS_HANDLER_ERROR',
    });
  }
}
