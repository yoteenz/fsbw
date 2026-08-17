import type { BusinessNameCheckResult, BusinessNameCheckStatus } from './types';
import { buildNameCheckFingerprint, normalizeBusinessNameForLookup } from './normalize';
import { NAME_CHECK_STALE_MS } from './types';

export function isNameCheckStale(
  result: BusinessNameCheckResult | undefined,
  input: { businessNameRaw?: string; formationState?: string; entityStructure?: string },
  now = Date.now(),
): boolean {
  if (!result) return true;
  if (result.status === 'idle') return true;

  const fingerprint = buildNameCheckFingerprint({
    businessNameRaw: input.businessNameRaw ?? '',
    formationState: input.formationState ?? '',
    entityStructure: input.entityStructure,
  });
  if (result.fingerprint !== fingerprint) return true;

  const checkedAt = Date.parse(result.checkedAt);
  if (Number.isNaN(checkedAt)) return true;
  return now - checkedAt > NAME_CHECK_STALE_MS;
}

export function markNameCheckStale(result: BusinessNameCheckResult): BusinessNameCheckResult {
  return { ...result, status: 'stale_result' };
}

export function shouldRecheckBeforeSubmit(
  result: BusinessNameCheckResult | undefined,
  input: { businessNameRaw?: string; formationState?: string; entityStructure?: string },
): boolean {
  if (!input.businessNameRaw?.trim() || !input.formationState?.trim()) return false;
  if (!result) return true;
  if (result.status === 'error' || result.status === 'stale_result') return true;
  return isNameCheckStale(result, input);
}

export function invalidateNameCheckOnInputChange(
  previous: BusinessNameCheckResult | undefined,
  input: { businessNameRaw?: string; formationState?: string; entityStructure?: string },
): BusinessNameCheckResult | undefined {
  if (!previous || previous.status === 'idle') return previous;
  const fingerprint = buildNameCheckFingerprint({
    businessNameRaw: input.businessNameRaw ?? '',
    formationState: input.formationState ?? '',
    entityStructure: input.entityStructure,
  });
  if (previous.fingerprint === fingerprint) return previous;
  return markNameCheckStale(previous);
}

export function effectiveDisplayStatus(
  result: BusinessNameCheckResult | undefined,
  input: { businessNameRaw?: string; formationState?: string; entityStructure?: string },
): BusinessNameCheckStatus {
  if (!result || result.status === 'idle') return 'idle';
  if (isNameCheckStale(result, input)) return 'stale_result';
  return result.status;
}

export function hasSuccessfulCheck(result: BusinessNameCheckResult | undefined): boolean {
  if (!result) return false;
  return ['likely_available', 'possible_conflict', 'unavailable', 'manual_review_required', 'lookup_unavailable'].includes(
    result.status,
  );
}

export function buildResultFromResponse(
  response: Omit<BusinessNameCheckResult, 'fingerprint'>,
): BusinessNameCheckResult {
  return {
    ...response,
    fingerprint: buildNameCheckFingerprint({
      businessNameRaw: response.businessNameRaw,
      formationState: response.formationState,
      entityStructure: response.entityStructure,
    }),
  };
}

export { normalizeBusinessNameForLookup, buildNameCheckFingerprint };
