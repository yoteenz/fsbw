/**
 * Async governed generation work orders — ASYNC_GOVERNED_GENERATION_V1.
 * Submit returns 202 quickly; FAL runs via queue; job persists in Supabase.
 */
import { createHash, randomUUID } from 'crypto';
import type { GovernedGenerationRequest, GovernedGenerationAudit } from '../../../src/studio-os-core/creative-production/types.js';
import type {
  GovernedGenerationErrorCategory,
  GovernedGenerationJobStatusResponse,
  GovernedGenerationJobSubmitResponse,
  GovernedGenerationProgressPhase,
} from '../../../src/studio-os-core/creative-production/governed-generation-job.js';
import { getSupabaseAdminServiceRole } from '../supabase.js';
import { isMissingTableError } from '../../../src/studio-os-core/immune-system/drift-detector.js';
import { attemptSchemaDriftRecoveryForMissingTable } from '../immuneSystem/schema-drift-orchestrator.js';
import { probeGovernedGenerationJobsTable } from '../immuneSystem/schema-probe.js';
import { getGovernedGenerationReadinessFromPresence } from '../../../src/studio-os-core/immune-system/readiness.js';
import { validateGovernedGenerationForExecution } from './generation-gateway.js';
import { registerGeneratedAssetWithLineage } from './registry-transaction.js';
import { createGenerationTraceId } from './generation-error-diagnostics.js';
import {
  finalizeStudioBuilderFromFalUrl,
  fetchStudioBuilderFalResult,
  pollStudioBuilderFalQueue,
  prepareStudioBuilderFalImageUrls,
  submitStudioBuilderFalQueue,
  STUDIO_BUILDER_FAL_MODEL,
  type StudioBuilderGenerateInput,
} from '../studioBuilderGeneration.js';

const JOB_TABLE = 'studio_governed_generation_jobs';
const JOB_TTL_MS = 2 * 60 * 60 * 1000;

type JobRow = {
  job_id: string;
  idempotency_key: string;
  org_id: string;
  company_id: string | null;
  department_id: string | null;
  station_id: string | null;
  project_id: string | null;
  concept_id: string | null;
  surface: string | null;
  compile_run_id: string | null;
  client_request_id: string | null;
  server_trace_id: string;
  provider: string;
  provider_model: string | null;
  provider_request_id: string | null;
  generation_type: string;
  source_route: string;
  source_system: string;
  status: string;
  progress_phase: string;
  progress_pct: number;
  result_asset_url: string | null;
  normalized_asset_url: string | null;
  registry_asset_id: string | null;
  storage_path: string | null;
  error_category: string | null;
  error_message: string | null;
  retry_count: number;
  cancellation_state: string;
  expires_at: string | null;
  created_by: string | null;
  actor_id: string;
  governance_context: Record<string, unknown>;
  request_payload: Record<string, unknown>;
  audit_payload: Record<string, unknown> | null;
  provider_state: string | null;
  requested_at: string;
  accepted_at: string;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
};

export function isAsyncGovernedGenerationV1Enabled(): boolean {
  const flag = process.env.ASYNC_GOVERNED_GENERATION_V1?.trim();
  return flag === '1' || flag === 'true';
}

export function isAsyncGovernedGenerationEnabledForRequest(request: GovernedGenerationRequest): boolean {
  const flag = process.env.ASYNC_GOVERNED_GENERATION_V1?.trim();
  if (flag === '0' || flag === 'false') return false;

  if (request.validationMode === true) {
    if (flag === '1' || flag === 'true') return true;
    if (!flag) return true;
    return false;
  }

  const cs = process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO?.trim();
  return (flag === '1' || flag === 'true') && (cs === '1' || cs === 'true');
}

export function buildGovernedGenerationIdempotencyKey(request: GovernedGenerationRequest): string {
  const e = request.execution;
  const parts = [
    request.orgId,
    request.compileRunId ?? '',
    String(e.stationId ?? ''),
    String(e.productionGroupId ?? ''),
    String(e.heroAssetId ?? ''),
    String(e.departmentId ?? ''),
    String(e.prompt ?? '').slice(0, 200),
    request.sourceSystem,
  ];
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

function builderInputFromRequest(request: GovernedGenerationRequest): StudioBuilderGenerateInput {
  const e = request.execution;
  return {
    departmentId: String(e.departmentId),
    packageId: String(e.packageId),
    projectId: String(e.projectId),
    productionGroupId: String(e.productionGroupId),
    heroAssetId: String(e.heroAssetId),
    prompt: String(e.prompt),
    aspectRatio: String(e.aspectRatio || '16:9'),
    outputFormat: e.outputFormat === 'webp' ? 'webp' : 'png',
    referenceImageUrls: Array.isArray(e.referenceImageUrls)
      ? (e.referenceImageUrls as unknown[]).filter((u): u is string => typeof u === 'string')
      : undefined,
    layerId: typeof e.layerId === 'string' ? e.layerId : undefined,
    generationMode: typeof e.generationMode === 'string' ? e.generationMode : undefined,
    textToImageOnly: e.textToImageOnly === true,
    providerModel: typeof e.model === 'string' ? e.model : undefined,
    isolationAttempt: typeof e.isolationAttempt === 'number' ? e.isolationAttempt : 0,
    negativePrompt: typeof e.negativePrompt === 'string' ? e.negativePrompt : undefined,
  };
}

function progressPctForPhase(phase: GovernedGenerationProgressPhase): number {
  switch (phase) {
    case 'submitting':
      return 5;
    case 'accepted':
      return 10;
    case 'queued':
      return 20;
    case 'generating':
      return 55;
    case 'normalizing':
      return 75;
    case 'storing':
      return 85;
    case 'registering':
      return 92;
    case 'complete':
      return 100;
    default:
      return 0;
  }
}

function toStatusResponse(row: JobRow): GovernedGenerationJobStatusResponse {
  const status = row.status as GovernedGenerationJobStatusResponse['status'];
  const progressPhase = row.progress_phase as GovernedGenerationProgressPhase;
  return {
    ok: status !== 'failed',
    jobId: row.job_id,
    status,
    progressPhase,
    progressPct: row.progress_pct,
    providerState: row.provider_state,
    resultAssetUrl: row.result_asset_url,
    normalizedAssetUrl: row.normalized_asset_url,
    registryAssetId: row.registry_asset_id,
    publicUrl: row.result_asset_url,
    storagePath: row.storage_path,
    model: row.provider_model,
    traceId: row.server_trace_id,
    errorCategory: (row.error_category as GovernedGenerationErrorCategory | null) ?? null,
    errorMessage: row.error_message,
    retryable: row.error_category === 'provider-timeout' || row.error_category === 'client-status-fetch-failed',
    recommendedNextAction:
      status === 'failed'
        ? row.error_category === 'provider-generation-failed'
          ? 'Retry with explicit forceGenerate after reviewing prompt'
          : 'Check job status and auth, then retry'
        : null,
    requestedAt: row.requested_at,
    acceptedAt: row.accepted_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    providerRequestId: row.provider_request_id,
  };
}

async function findJobByIdempotency(idempotencyKey: string): Promise<JobRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as JobRow;
  if (['complete', 'failed', 'cancelled', 'expired'].includes(row.status)) return null;
  return row;
}

async function findJobByJobId(jobId: string): Promise<JobRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.from(JOB_TABLE).select('*').eq('job_id', jobId).maybeSingle();
  if (error || !data) return null;
  return data as JobRow;
}

async function updateJob(jobId: string, patch: Partial<JobRow>): Promise<JobRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from(JOB_TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('job_id', jobId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  return data as JobRow;
}

export function scheduleGovernedGenerationWorker(jobId: string): void {
  const secret = process.env.STUDIO_GENERATION_WORKER_SECRET?.trim();
  const base =
    process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim()}`
      : process.env.SITE_URL?.trim() || 'http://localhost:3000';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['X-Studio-Generation-Worker-Secret'] = secret;
  void fetch(`${base}/api/admin/studio-generation-worker`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jobId }),
  }).catch(() => {
    /* worker is best-effort; status polls also advance jobs */
  });
}

export async function submitGovernedGenerationJobAsync(
  request: GovernedGenerationRequest,
  ctx: { sourceRoute: string; actorId: string; actorEmail?: string }
): Promise<
  | { ok: false; status: number; body: Record<string, unknown> }
  | { ok: true; status: 202; body: GovernedGenerationJobSubmitResponse }
> {
  const traceId = createGenerationTraceId('async');
  const validated = await validateGovernedGenerationForExecution(request, { sourceRoute: ctx.sourceRoute });
  if (!validated.ok) {
    const r = validated.result;
    return {
      ok: false,
      status: r.code?.startsWith('AUTH') ? 403 : 400,
      body: { ok: false, code: r.code, error: r.error, traceId: r.traceId ?? traceId },
    };
  }

  if (request.sourceSystem !== 'studio-builder') {
    return {
      ok: false,
      status: 400,
      body: { ok: false, code: 'UNSUPPORTED_SOURCE', error: 'Async jobs support studio-builder only in V1', traceId },
    };
  }

  try {
    const supabaseProbe = getSupabaseAdminServiceRole();
    const jobsProbe = await probeGovernedGenerationJobsTable(supabaseProbe);
    const readiness = getGovernedGenerationReadinessFromPresence(jobsProbe.tableExists);
    const { isImmuneAutoRepairEnabled, isImmuneProductionTargetVerified } = await import(
      '../immuneSystem/production-target.js'
    );
    const autoRepair = isImmuneAutoRepairEnabled() && isImmuneProductionTargetVerified();
    if (readiness.health === 'blocked' && !autoRepair) {
      return {
        ok: false,
        status: 503,
        body: {
          ok: false,
          code: 'INFRASTRUCTURE_BLOCKED',
          error: readiness.message,
          errorCategory: 'job-submit-failed',
          traceId,
          infrastructureHealth: readiness,
        },
      };
    }
  } catch {
    /* probe failure — continue; insert path may trigger immune recovery */
  }

  const idempotencyKey = buildGovernedGenerationIdempotencyKey(request);
  const existing = await findJobByIdempotency(idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: 202,
      body: {
        ok: true,
        async: true,
        jobId: existing.job_id,
        status: existing.status as GovernedGenerationJobSubmitResponse['status'],
        acceptedAt: existing.accepted_at,
        statusUrl: `/api/admin/studio-generation-status?jobId=${encodeURIComponent(existing.job_id)}`,
        traceId: existing.server_trace_id,
        reused: true,
      },
    };
  }

  const builderInput = builderInputFromRequest(request);
  const refs = await prepareStudioBuilderFalImageUrls(builderInput);
  if (!refs.ok) {
    return {
      ok: false,
      status: 503,
      body: {
        ok: false,
        code: 'provider-submit-failed',
        error: refs.error,
        errorCategory: 'provider-submit-failed',
        traceId,
      },
    };
  }

  const falSubmit = await submitStudioBuilderFalQueue(builderInput, refs.imageUrls);
  if (!falSubmit.ok) {
    return {
      ok: false,
      status: falSubmit.providerHttpStatus && falSubmit.providerHttpStatus >= 500 ? 503 : 400,
      body: {
        ok: false,
        code: 'provider-submit-failed',
        error: falSubmit.error,
        errorCategory: 'provider-submit-failed',
        traceId,
      },
    };
  }

  const jobId = randomUUID();
  const now = new Date().toISOString();
  const e = request.execution;
  const row: Omit<JobRow, 'requested_at' | 'accepted_at' | 'created_at' | 'updated_at'> & {
    requested_at: string;
    accepted_at: string;
  } = {
    job_id: jobId,
    idempotency_key: idempotencyKey,
    org_id: request.orgId,
    company_id: String(e.organizationId ?? request.orgId),
    department_id: String(e.departmentId ?? ''),
    station_id: String(e.stationId ?? ''),
    project_id: String(e.projectId ?? ''),
    concept_id: typeof e.conceptId === 'string' ? e.conceptId : null,
    surface: request.validationMode ? 'experience-lab-validation' : 'creative-studio',
    compile_run_id: request.compileRunId ?? null,
    client_request_id: typeof e.clientRequestId === 'string' ? e.clientRequestId : null,
    server_trace_id: traceId,
    provider: 'fal',
    provider_model: falSubmit.model,
    provider_request_id: falSubmit.providerRequestId,
    generation_type: 'studio-builder',
    source_route: ctx.sourceRoute,
    source_system: request.sourceSystem,
    status: 'queued',
    progress_phase: 'queued',
    progress_pct: progressPctForPhase('queued'),
    result_asset_url: null,
    normalized_asset_url: null,
    registry_asset_id: null,
    storage_path: null,
    error_category: null,
    error_message: null,
    retry_count: 0,
    cancellation_state: 'none',
    expires_at: new Date(Date.now() + JOB_TTL_MS).toISOString(),
    created_by: ctx.actorEmail ?? ctx.actorId,
    actor_id: ctx.actorId,
    governance_context: {
      productionAuthorizationId: validated.audit.productionAuthorizationId,
      outputClass: validated.audit.outputClass,
      validationMode: request.validationMode ?? false,
    },
    request_payload: { execution: request.execution, assetIntent: request.assetIntent },
    audit_payload: validated.audit as unknown as Record<string, unknown>,
    provider_state: 'IN_QUEUE',
    requested_at: now,
    accepted_at: now,
    started_at: now,
    completed_at: null,
    failed_at: null,
  };

  const supabase = getSupabaseAdminServiceRole();

  const insertOnce = async () => supabase.from(JOB_TABLE).insert(row);

  let { error: insertError } = await insertOnce();

  if (insertError && isMissingTableError(insertError.message)) {
    const recovery = await attemptSchemaDriftRecoveryForMissingTable(supabase, {
      organizationId: request.orgId,
      affectedSubsystem: 'Governed Generation Dispatch',
      affectedOperation: 'submitGovernedGenerationJobAsync.insert',
      errorCode: 'job-submit-failed',
      errorMessage: insertError.message,
      correlationIds: [traceId, jobId],
      hintedTable: JOB_TABLE,
    });
    if (recovery.shouldRetryOriginalOperation) {
      ({ error: insertError } = await insertOnce());
      if (!insertError) {
        scheduleGovernedGenerationWorker(jobId);
        return {
          ok: true,
          status: 202,
          body: {
            ok: true,
            async: true,
            jobId,
            status: 'queued',
            acceptedAt: now,
            statusUrl: `/api/admin/studio-generation-status?jobId=${encodeURIComponent(jobId)}`,
            traceId,
            immuneRecovery: recovery.response,
          },
        };
      }
    }
    return {
      ok: false,
      status: 500,
      body: {
        ok: false,
        code: 'job-submit-failed',
        error: insertError.message,
        errorCategory: 'job-submit-failed',
        traceId,
        immuneRecovery: recovery.response,
      },
    };
  }

  if (insertError) {
    return {
      ok: false,
      status: 500,
      body: {
        ok: false,
        code: 'job-submit-failed',
        error: insertError.message,
        errorCategory: 'job-submit-failed',
        traceId,
      },
    };
  }

  scheduleGovernedGenerationWorker(jobId);

  return {
    ok: true,
    status: 202,
    body: {
      ok: true,
      async: true,
      jobId,
      status: 'queued',
      acceptedAt: now,
      statusUrl: `/api/admin/studio-generation-status?jobId=${encodeURIComponent(jobId)}`,
      traceId,
    },
  };
}

export async function advanceGovernedGenerationJob(jobId: string): Promise<GovernedGenerationJobStatusResponse | null> {
  const row = await findJobByJobId(jobId);
  if (!row) return null;

  if (row.status === 'complete') return toStatusResponse(row);
  if (row.status === 'failed' || row.status === 'cancelled' || row.status === 'expired') {
    return toStatusResponse(row);
  }

  if (!row.provider_request_id || !row.provider_model) {
    const failed = await updateJob(jobId, {
      status: 'failed',
      progress_phase: 'failed',
      error_category: 'job-submit-failed',
      error_message: 'Missing provider request id',
      failed_at: new Date().toISOString(),
    });
    return failed ? toStatusResponse(failed) : null;
  }

  const request = {
    execution: row.request_payload.execution as Record<string, unknown>,
    assetIntent: row.request_payload.assetIntent,
    orgId: row.org_id,
    sourceSystem: row.source_system,
  } as GovernedGenerationRequest;
  const builderInput = builderInputFromRequest(request);
  const audit = row.audit_payload as GovernedGenerationAudit | null;

  let poll;
  try {
    poll = await pollStudioBuilderFalQueue(row.provider_model, row.provider_request_id);
  } catch (err) {
    const failed = await updateJob(jobId, {
      status: 'failed',
      progress_phase: 'failed',
      error_category: 'provider-status-unavailable',
      error_message: err instanceof Error ? err.message : 'Provider status unavailable',
      failed_at: new Date().toISOString(),
    });
    return failed ? toStatusResponse(failed) : null;
  }

  const providerState = poll.status;
  if (providerState === 'IN_QUEUE' || providerState === 'IN_PROGRESS') {
    const phase: GovernedGenerationProgressPhase = providerState === 'IN_QUEUE' ? 'queued' : 'generating';
    const updated = await updateJob(jobId, {
      status: 'generating',
      progress_phase: phase,
      progress_pct: progressPctForPhase(phase),
      provider_state: providerState,
    });
    return updated ? toStatusResponse(updated) : null;
  }

  if (providerState !== 'COMPLETED') {
    const failed = await updateJob(jobId, {
      status: 'failed',
      progress_phase: 'failed',
      progress_pct: 0,
      provider_state: providerState,
      error_category: 'provider-generation-failed',
      error_message: `Provider returned ${providerState}`,
      failed_at: new Date().toISOString(),
    });
    return failed ? toStatusResponse(failed) : null;
  }

  await updateJob(jobId, {
    status: 'normalizing',
    progress_phase: 'normalizing',
    progress_pct: progressPctForPhase('normalizing'),
    provider_state: providerState,
  });

  const imageUrl = await fetchStudioBuilderFalResult(row.provider_model, row.provider_request_id);
  if (!imageUrl) {
    const failed = await updateJob(jobId, {
      status: 'failed',
      progress_phase: 'failed',
      error_category: 'normalization-failed',
      error_message: 'FAL completed without image URL',
      failed_at: new Date().toISOString(),
    });
    return failed ? toStatusResponse(failed) : null;
  }

  await updateJob(jobId, {
    status: 'storing',
    progress_phase: 'storing',
    progress_pct: progressPctForPhase('storing'),
  });

  const finalized = await finalizeStudioBuilderFromFalUrl(builderInput, imageUrl);
  if (!finalized.ok || !finalized.publicUrl) {
    const failed = await updateJob(jobId, {
      status: 'failed',
      progress_phase: 'failed',
      error_category: 'storage-failed',
      error_message: finalized.error ?? 'Storage failed',
      failed_at: new Date().toISOString(),
    });
    return failed ? toStatusResponse(failed) : null;
  }

  let registryAssetId: string | null = null;
  if (audit && audit.outputClass === 'material') {
    await updateJob(jobId, {
      status: 'registering',
      progress_phase: 'registering',
      progress_pct: progressPctForPhase('registering'),
      normalized_asset_url: finalized.publicUrl,
      result_asset_url: finalized.publicUrl,
      storage_path: finalized.storagePath ?? null,
    });
    try {
      const supabase = getSupabaseAdminServiceRole();
      const registered = await registerGeneratedAssetWithLineage({
        supabase,
        orgId: row.org_id,
        audit,
        name: String(builderInput.heroAssetId || 'Generated Asset'),
        category: String((request.assetIntent as { discipline?: string })?.discipline ?? 'static-image'),
        artifactUrl: finalized.publicUrl,
        departmentId: builderInput.departmentId,
        generationModel: finalized.model,
        metadata: { storage_path: finalized.storagePath, job_id: jobId },
      });
      registryAssetId = registered.assetRegistryId;
    } catch (err) {
      const failed = await updateJob(jobId, {
        status: 'failed',
        progress_phase: 'failed',
        error_category: 'registry-failed',
        error_message: err instanceof Error ? err.message : 'Registry failed',
        failed_at: new Date().toISOString(),
      });
      return failed ? toStatusResponse(failed) : null;
    }
  }

  const completed = await updateJob(jobId, {
    status: 'complete',
    progress_phase: 'complete',
    progress_pct: 100,
    result_asset_url: finalized.publicUrl,
    normalized_asset_url: finalized.publicUrl,
    storage_path: finalized.storagePath ?? null,
    registry_asset_id: registryAssetId,
    provider_state: 'COMPLETED',
    completed_at: new Date().toISOString(),
  });
  return completed ? toStatusResponse(completed) : null;
}

export async function getGovernedGenerationJobStatus(
  jobId: string,
  actor: { actorId: string; orgId?: string }
): Promise<GovernedGenerationJobStatusResponse | null> {
  const row = await findJobByJobId(jobId);
  if (!row) return null;
  if (row.actor_id !== actor.actorId) {
    return null;
  }
  if (row.status !== 'complete' && row.status !== 'failed' && row.status !== 'cancelled') {
    const advanced = await advanceGovernedGenerationJob(jobId);
    return advanced ?? toStatusResponse(row);
  }
  return toStatusResponse(row);
}

export function isWorkerSecretValid(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const expected = process.env.STUDIO_GENERATION_WORKER_SECRET?.trim();
  if (!expected) return process.env.NODE_ENV !== 'production';
  const provided = req.headers['x-studio-generation-worker-secret'];
  return typeof provided === 'string' && provided === expected;
}
