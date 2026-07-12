/**
 * Governed generation async work-order contract (ASYNC_GOVERNED_GENERATION_V1).
 */

export type GovernedGenerationJobStatus =
  | 'submit'
  | 'accepted'
  | 'queued'
  | 'generating'
  | 'normalizing'
  | 'storing'
  | 'registering'
  | 'complete'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type GovernedGenerationProgressPhase =
  | 'submitting'
  | 'accepted'
  | 'queued'
  | 'generating'
  | 'normalizing'
  | 'storing'
  | 'registering'
  | 'complete'
  | 'failed';

export type GovernedGenerationErrorCategory =
  | 'job-submit-failed'
  | 'authorization-failed'
  | 'provider-submit-failed'
  | 'provider-generation-failed'
  | 'provider-timeout'
  | 'provider-status-unavailable'
  | 'normalization-failed'
  | 'storage-failed'
  | 'registry-failed'
  | 'client-status-fetch-failed'
  | 'job-expired'
  | 'cancelled';

export type GovernedGenerationJobRecord = {
  jobId: string;
  organizationId: string;
  companyId: string | null;
  departmentId: string | null;
  stationId: string | null;
  projectId: string | null;
  conceptId: string | null;
  surface: string | null;
  compileRunId: string | null;
  clientRequestId: string | null;
  serverTraceId: string;
  provider: string;
  providerModel: string | null;
  providerRequestId: string | null;
  generationType: string;
  requestedAt: string;
  acceptedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  status: GovernedGenerationJobStatus;
  progressPhase: GovernedGenerationProgressPhase;
  progressPct: number;
  resultAssetUrl: string | null;
  normalizedAssetUrl: string | null;
  registryAssetId: string | null;
  storagePath: string | null;
  errorCategory: GovernedGenerationErrorCategory | null;
  errorMessage: string | null;
  retryCount: number;
  cancellationState: 'none' | 'requested' | 'cancelled';
  expiresAt: string | null;
  createdBy: string | null;
  governanceContext: Record<string, unknown>;
  providerState: string | null;
};

export type GovernedGenerationJobSubmitResponse = {
  ok: true;
  async: true;
  jobId: string;
  status: GovernedGenerationJobStatus;
  acceptedAt: string;
  statusUrl: string;
  traceId: string;
  reused?: boolean;
};

export type GovernedGenerationJobStatusResponse = {
  ok: boolean;
  jobId: string;
  status: GovernedGenerationJobStatus;
  progressPhase: GovernedGenerationProgressPhase;
  progressPct: number;
  providerState: string | null;
  resultAssetUrl?: string | null;
  normalizedAssetUrl?: string | null;
  registryAssetId?: string | null;
  publicUrl?: string | null;
  storagePath?: string | null;
  model?: string | null;
  traceId: string;
  errorCategory?: GovernedGenerationErrorCategory | null;
  errorMessage?: string | null;
  retryable?: boolean;
  recommendedNextAction?: string | null;
  requestedAt?: string;
  acceptedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  providerRequestId?: string | null;
};

export const GOVERNED_GENERATION_JOB_UI_LABELS: Record<GovernedGenerationProgressPhase, string> = {
  submitting: 'Submitting work order',
  accepted: 'Work order accepted',
  queued: 'Waiting for decorator',
  generating: 'Decorating in progress',
  normalizing: 'Processing completed asset',
  storing: 'Processing completed asset',
  registering: 'Registering asset',
  complete: 'Complete',
  failed: 'Failed',
};

export function governedGenerationJobStorageKey(compileRunId: string | null, stationId: string | null, layerKey: string): string {
  return `governed-gen-job:${compileRunId ?? 'run'}:${stationId ?? 'station'}:${layerKey}`;
}
