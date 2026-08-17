import type { BusinessStructure } from '../../intake/intakeTypes';

/** Canonical name-check lifecycle statuses for Smart Intake UI and persistence. */
export type BusinessNameCheckStatus =
  | 'idle'
  | 'checking'
  | 'likely_available'
  | 'possible_conflict'
  | 'unavailable'
  | 'manual_review_required'
  | 'lookup_unavailable'
  | 'error'
  | 'stale_result';

export interface BusinessNameRegistryMatch {
  name: string;
  entityType?: string;
  status?: string;
  controlNumber?: string;
  similarity?: 'exact' | 'strong' | 'partial';
}

export interface BusinessNameCheckRequest {
  state: string;
  businessName: string;
  entityType?: BusinessStructure;
  /** When true, use deterministic demo adapter only. */
  demoMode?: boolean;
}

export interface BusinessNameCheckResponse {
  status: Exclude<BusinessNameCheckStatus, 'idle' | 'checking' | 'stale_result'>;
  businessNameRaw: string;
  businessNameNormalized: string;
  formationState: string;
  entityStructure?: BusinessStructure;
  source: string;
  sourceUrl?: string;
  checkedAt: string;
  queryId?: string;
  matchCount: number;
  topMatches: BusinessNameRegistryMatch[];
  manualReviewRequired: boolean;
  errorCode?: string;
  message?: string;
  disclaimer: string;
}

/** Persisted on intake answers — excludes transient checking state. */
export interface BusinessNameCheckResult {
  businessNameRaw: string;
  businessNameNormalized: string;
  formationState: string;
  entityStructure?: BusinessStructure;
  status: Exclude<BusinessNameCheckStatus, 'checking'>;
  source: string;
  sourceUrl?: string;
  checkedAt: string;
  queryId?: string;
  matchCount: number;
  topMatches: BusinessNameRegistryMatch[];
  manualReviewRequired: boolean;
  errorCode?: string;
  message?: string;
  /** Inputs used for this check — used to detect stale results. */
  fingerprint: string;
}

export interface BusinessNameRegistryAdapter {
  readonly adapterId: string;
  supports(state: string): boolean;
  check(request: BusinessNameCheckRequest): Promise<BusinessNameCheckResponse>;
}

export const NAME_CHECK_DISCLAIMER =
  'A registry search is not the same as state filing approval. Final name acceptance is determined by the state when your filing is reviewed.';

export const NAME_CHECK_STALE_MS = 24 * 60 * 60 * 1000;
