/** Stale/expired governed generation work-order recovery (non-FAL failure loop breaker). */

export const GOVERNED_GENERATION_JOB_STALE_INACTIVITY_MS = 15 * 60 * 1000;

const ACTIVE_JOB_STATUSES = new Set([
  'submit',
  'accepted',
  'queued',
  'generating',
  'normalizing',
  'storing',
  'registering',
]);

export type GovernedGenerationJobExpiryInput = {
  status: string;
  expires_at: string | null;
  updated_at: string;
};

export function isGovernedGenerationJobExpired(
  row: GovernedGenerationJobExpiryInput,
  nowMs: number = Date.now()
): boolean {
  if (isGovernedGenerationJobTerminal(row.status)) {
    return false;
  }

  if (row.expires_at) {
    const expiresMs = new Date(row.expires_at).getTime();
    if (!Number.isNaN(expiresMs) && nowMs > expiresMs) {
      return true;
    }
  }

  if (!ACTIVE_JOB_STATUSES.has(row.status)) {
    return false;
  }

  const updatedMs = new Date(row.updated_at).getTime();
  if (Number.isNaN(updatedMs)) {
    return false;
  }

  return nowMs - updatedMs > GOVERNED_GENERATION_JOB_STALE_INACTIVITY_MS;
}

export function governedGenerationJobExpiryMessage(row: GovernedGenerationJobExpiryInput): string {
  const nowMs = Date.now();
  if (row.expires_at) {
    const expiresMs = new Date(row.expires_at).getTime();
    if (!Number.isNaN(expiresMs) && nowMs > expiresMs) {
      return 'Generation work order expired — submit again to retry';
    }
  }
  return 'Generation work order stalled — submit again to retry';
}

export function isGovernedGenerationJobTerminal(status: string): boolean {
  return status === 'complete' || status === 'failed' || status === 'cancelled' || status === 'expired';
}
