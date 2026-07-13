import { randomUUID } from 'crypto';
import type { ConstructionPlan } from '../../src/studio-os-core/blueprint-author/construction-plan-schema.js';
import type { CanonicalMainDepartmentId } from '../../src/studio-os-core/canonical-studio-world/canonical-department-registry.js';
import {
  buildCanonicalDepartmentConstructionPlan,
  CANONICAL_QUEUE_CAPACITY,
  CANONICAL_QUEUE_PROGRAM,
  CANONICAL_RENDER_ORGANIZATION_ID,
} from '../../src/studio-os-core/canonical-studio-world/canonical-department-construction-plan.js';
import {
  buildCanonicalBatchQueuePlan,
  type CanonicalQueueEntry,
  type CanonicalQueueSnapshot,
  type CanonicalRenderKind,
  summarizeCanonicalQueue,
} from '../../src/studio-os-core/canonical-studio-world/canonical-department-queue.js';
import { getCanonicalDepartmentRecord } from '../../src/studio-os-core/canonical-studio-world/canonical-department-registry.js';
import {
  getFounderRenderJob,
  insertFounderRenderJob,
  type FounderRenderJobRow,
} from './founderRenderJobs.js';
import { getSupabaseAdminServiceRole } from './supabase.js';

const TABLE = 'studio_founder_render_jobs';

type CanonicalGovernanceContext = {
  program: typeof CANONICAL_QUEUE_PROGRAM;
  departmentId: CanonicalMainDepartmentId;
  departmentName: string;
  renderKind: CanonicalRenderKind;
  batchId: string;
  landscapeJobId?: string | null;
};

function isCanonicalGovernance(ctx: unknown): ctx is CanonicalGovernanceContext {
  if (!ctx || typeof ctx !== 'object') return false;
  const g = ctx as CanonicalGovernanceContext;
  return g.program === CANONICAL_QUEUE_PROGRAM && typeof g.departmentId === 'string';
}

function mapRowToQueueEntry(row: FounderRenderJobRow): CanonicalQueueEntry | null {
  const governance = row.governance_context;
  if (!isCanonicalGovernance(governance)) return null;
  return {
    jobId: row.job_id,
    departmentId: governance.departmentId,
    departmentName: governance.departmentName,
    renderKind: governance.renderKind,
    status: row.status as CanonicalQueueEntry['status'],
    batchId: governance.batchId ?? null,
    previewArtifactUrl: row.preview_artifact_url,
    failureReason: row.failure_reason,
    blueprintRevision: row.blueprint_revision,
    landscapeJobId: governance.landscapeJobId ?? null,
    modelRoute: row.model_route,
    providerModel: row.provider_model,
    queuedAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

async function listCanonicalJobRows(): Promise<FounderRenderJobRow[]> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin
    .from(TABLE)
    .select('*')
    .eq('organization_id', CANONICAL_RENDER_ORGANIZATION_ID)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return (data as FounderRenderJobRow[]).filter((row) => isCanonicalGovernance(row.governance_context));
}

export async function fetchCanonicalQueueSnapshot(): Promise<CanonicalQueueSnapshot> {
  const rows = await listCanonicalJobRows();
  const entries = rows.map(mapRowToQueueEntry).filter((e): e is CanonicalQueueEntry => e !== null);
  const summary = summarizeCanonicalQueue(entries);
  return {
    program: CANONICAL_QUEUE_PROGRAM,
    organizationId: CANONICAL_RENDER_ORGANIZATION_ID,
    capacity: CANONICAL_QUEUE_CAPACITY,
    entries,
    ...summary,
  };
}

async function insertQueuedCanonicalJob(input: {
  plan: ConstructionPlan;
  governance: CanonicalGovernanceContext;
  renderKind: CanonicalRenderKind;
}): Promise<{ ok: true; jobId: string } | { ok: false; error: string; code?: string }> {
  const admin = getSupabaseAdminServiceRole();
  const jobId = `cjq-${randomUUID()}`;
  const record = getCanonicalDepartmentRecord(input.governance.departmentId);
  const { FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION, FOUNDER_RENDER_ARTIFACT_INTENT } = await import(
    './creativeProduction/studio-os-server.bundle.js'
  );

  const { error } = await admin.from(TABLE).insert({
    job_id: jobId,
    organization_id: CANONICAL_RENDER_ORGANIZATION_ID,
    project_id: input.plan.planId,
    room_id: input.plan.room.roomId,
    blueprint_id: input.plan.planId,
    blueprint_revision: input.plan.metadata.revision,
    construction_plan_id: input.plan.planId,
    room_purpose: input.plan.room.purpose,
    artifact_intent: FOUNDER_RENDER_ARTIFACT_INTENT,
    status: 'queued',
    prompt_version: record?.departmentPromptVersion ?? FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
    governance_context: input.governance,
    diagnostics: {
      program: CANONICAL_QUEUE_PROGRAM,
      queuedAt: new Date().toISOString(),
    },
    output_aspect_ratio: input.renderKind === 'portrait' ? '9:16' : '16:9',
  });

  if (error) return { ok: false, error: error.message, code: 'QUEUE_INSERT_FAILED' };
  return { ok: true, jobId };
}

async function dispatchCanonicalJob(jobId: string): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  const row = await getFounderRenderJob(jobId);
  if (!row || row.status !== 'queued') return { ok: false, error: 'Job not queued', code: 'NOT_QUEUED' };

  const governance = row.governance_context;
  if (!isCanonicalGovernance(governance)) return { ok: false, error: 'Not a canonical queue job', code: 'NOT_CANONICAL' };

  if (governance.renderKind === 'portrait' && governance.landscapeJobId) {
    const landscape = await getFounderRenderJob(governance.landscapeJobId);
    if (!landscape || (landscape.status !== 'ready' && landscape.status !== 'approved')) {
      return { ok: false, error: 'Landscape not ready', code: 'LANDSCAPE_NOT_READY' };
    }
  }

  const built = buildCanonicalDepartmentConstructionPlan(governance.departmentId, governance.renderKind);
  if (!built.ok) return { ok: false, error: built.message, code: built.code };

  const [{ prepareFounderRenderDispatch }, { FOUNDER_RENDER_ROUTE_ID }] = await Promise.all([
    import('./founderRenderGeneration.js'),
    import('./creativeProduction/studio-os-server.bundle.js'),
  ]);

  const dispatch = await prepareFounderRenderDispatch({ plan: built.plan, actorId: 'canonical-queue' });
  if (!dispatch.ok) {
    const admin = getSupabaseAdminServiceRole();
    await admin
      .from(TABLE)
      .update({
        status: 'failed',
        failure_reason: dispatch.error,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', jobId);
    return { ok: false, error: dispatch.error, code: dispatch.code };
  }

  const admin = getSupabaseAdminServiceRole();
  const { error } = await admin
    .from(TABLE)
    .update({
      status: 'generating',
      model_route: FOUNDER_RENDER_ROUTE_ID,
      provider_model: dispatch.model,
      provider_request_id: dispatch.providerRequestId,
      prompt_hash: dispatch.promptHash,
      effective_prompt: dispatch.effectivePrompt,
      reference_count: dispatch.referenceCount,
      brand_material_refs: dispatch.brandMaterialRefs,
      started_at: new Date().toISOString(),
      diagnostics: {
        ...(row.diagnostics ?? {}),
        dispatchTimestamp: new Date().toISOString(),
        providerJobId: dispatch.providerRequestId,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', jobId);

  if (error) return { ok: false, error: error.message, code: 'DISPATCH_UPDATE_FAILED' };
  return { ok: true };
}

async function ensurePortraitQueuedForReadyLandscapes(entries: CanonicalQueueEntry[]): Promise<void> {
  const landscapes = entries.filter((e) => e.renderKind === 'landscape' && (e.status === 'ready' || e.status === 'approved'));
  const portraitKeys = new Set(
    entries.filter((e) => e.renderKind === 'portrait').map((e) => `${e.departmentId}:${e.blueprintRevision}`)
  );

  for (const landscape of landscapes) {
    const key = `${landscape.departmentId}:${landscape.blueprintRevision}`;
    if (portraitKeys.has(key)) continue;

    const record = getCanonicalDepartmentRecord(landscape.departmentId);
    if (!record) continue;

    const built = buildCanonicalDepartmentConstructionPlan(landscape.departmentId, 'portrait');
    if (!built.ok) continue;

    await insertQueuedCanonicalJob({
      plan: built.plan,
      renderKind: 'portrait',
      governance: {
        program: CANONICAL_QUEUE_PROGRAM,
        departmentId: landscape.departmentId,
        departmentName: record.name,
        renderKind: 'portrait',
        batchId: landscape.batchId ?? `portrait-${landscape.jobId}`,
        landscapeJobId: landscape.jobId,
      },
    });
  }
}

async function advanceGeneratingJobs(): Promise<void> {
  const rows = await listCanonicalJobRows();
  for (const row of rows) {
    if (row.status !== 'generating' || !row.provider_request_id || !row.provider_model) continue;

    const { pollStudioBuilderFalQueue, fetchStudioBuilderFalResult, finalizeStudioBuilderFromFalUrl } = await import(
      './studioBuilderGeneration.js'
    );
    const { resolveFounderRenderModelRoute } = await import('./creativeProduction/studio-os-server.bundle.js');
    const { updateFounderRenderJobReady, updateFounderRenderJobFailed } = await import('./founderRenderJobs.js');

    const { status } = await pollStudioBuilderFalQueue(row.provider_model, row.provider_request_id);
    if (status === 'COMPLETED') {
      const imageUrl = await fetchStudioBuilderFalResult(row.provider_model, row.provider_request_id);
      if (imageUrl) {
        const route = resolveFounderRenderModelRoute('16:9');
        const finalized = await finalizeStudioBuilderFromFalUrl(
          {
            departmentId: row.organization_id,
            packageId: 'founder-render',
            projectId: row.project_id,
            productionGroupId: `founder-render-${row.room_id}`,
            heroAssetId: 'full-room-preview',
            prompt: 'canonical-founder-render',
            aspectRatio: route.aspectRatio,
            outputFormat: route.outputFormat,
            organizationId: row.organization_id,
          },
          imageUrl,
          row.provider_model
        );
        if (finalized.ok && finalized.publicUrl) {
          await updateFounderRenderJobReady(row.job_id, {
            previewArtifactUrl: finalized.publicUrl,
            storagePath: finalized.storagePath ?? '',
            generationDurationMs: Date.now() - Date.parse(String(row.started_at ?? row.created_at)),
          });
        } else {
          await updateFounderRenderJobFailed(row.job_id, finalized.error ?? 'Finalize failed');
        }
      }
    } else if (status === 'FAILED') {
      await updateFounderRenderJobFailed(row.job_id, 'FAL provider job failed');
    }
  }
}

export async function advanceCanonicalRenderQueue(): Promise<CanonicalQueueSnapshot> {
  await advanceGeneratingJobs();

  let snapshot = await fetchCanonicalQueueSnapshot();
  await ensurePortraitQueuedForReadyLandscapes(snapshot.entries);
  snapshot = await fetchCanonicalQueueSnapshot();

  const generatingCount = snapshot.entries.filter((e) => e.status === 'generating').length;
  let slots = CANONICAL_QUEUE_CAPACITY - generatingCount;
  if (slots <= 0) return snapshot;

  const pending = snapshot.entries
    .filter((e) => e.status === 'queued')
    .sort((a, b) => Date.parse(a.queuedAt) - Date.parse(b.queuedAt));

  for (const entry of pending) {
    if (slots <= 0) break;
    const result = await dispatchCanonicalJob(entry.jobId);
    if (result.ok) slots -= 1;
    else if (result.code !== 'LANDSCAPE_NOT_READY') {
      // keep slot — failed dispatch already marked job
    }
  }

  await advanceGeneratingJobs();
  return fetchCanonicalQueueSnapshot();
}

async function assertCanonicalDepartmentPreviewApproved(
  departmentId: CanonicalMainDepartmentId
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin
    .from(TABLE)
    .select('job_id, approval_status, status')
    .eq('organization_id', CANONICAL_RENDER_ORGANIZATION_ID)
    .eq('room_id', departmentId)
    .eq('approval_status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      code: 'PREVIEW_NOT_APPROVED',
      message: `Founder Render preview must be approved for ${departmentId} before batch queue dispatch.`,
    };
  }
  return { ok: true };
}

export async function submitCanonicalDepartmentBatch(input: {
  departmentIds: CanonicalMainDepartmentId[];
  confirmed: boolean;
}): Promise<
  | { ok: true; batchId: string; queuedJobIds: string[]; plan: ReturnType<typeof buildCanonicalBatchQueuePlan> }
  | { ok: false; code: string; message: string }
> {
  const plan = buildCanonicalBatchQueuePlan(input);
  if ('ok' in plan && plan.ok === false) return plan;

  for (const departmentId of input.departmentIds) {
    const approved = await assertCanonicalDepartmentPreviewApproved(departmentId);
    if (!approved.ok) return approved;
  }

  const batchId = `cbatch-${randomUUID()}`;
  const queuedJobIds: string[] = [];

  for (const departmentId of input.departmentIds) {
    const record = getCanonicalDepartmentRecord(departmentId);
    if (!record) continue;

    const built = buildCanonicalDepartmentConstructionPlan(departmentId, 'landscape');
    if (!built.ok) {
      return { ok: false, code: built.code, message: built.message };
    }

    const inserted = await insertQueuedCanonicalJob({
      plan: built.plan,
      renderKind: 'landscape',
      governance: {
        program: CANONICAL_QUEUE_PROGRAM,
        departmentId,
        departmentName: record.name,
        renderKind: 'landscape',
        batchId,
      },
    });

    if (!inserted.ok) {
      return { ok: false, code: inserted.code ?? 'QUEUE_INSERT_FAILED', message: inserted.error };
    }
    queuedJobIds.push(inserted.jobId);
  }

  await advanceCanonicalRenderQueue();

  return { ok: true, batchId, queuedJobIds, plan };
}
