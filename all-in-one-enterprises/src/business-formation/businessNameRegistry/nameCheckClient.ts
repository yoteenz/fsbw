import { isDemoMode } from '../../config/dataMode';
import type { BusinessStructure } from '../../intake/intakeTypes';
import { checkBusinessNameAvailability } from './registryService';
import type { BusinessNameCheckResponse } from './types';
import { buildResultFromResponse } from './staleLogic';
import type { BusinessNameCheckResult } from './types';

const API_PATH = '/api/aio/business-name-check';

export async function requestBusinessNameCheck(input: {
  state: string;
  businessName: string;
  entityType?: BusinessStructure;
}): Promise<BusinessNameCheckResult> {
  let response: BusinessNameCheckResponse;

  if (isDemoMode()) {
    response = await checkBusinessNameAvailability({
      state: input.state,
      businessName: input.businessName,
      entityType: input.entityType,
      demoMode: true,
    });
  } else {
    const res = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: input.state,
        businessName: input.businessName,
        entityType: input.entityType,
      }),
    });

    if (res.status === 429) {
      response = {
        status: 'error',
        businessNameRaw: input.businessName,
        businessNameNormalized: input.businessName.trim().toUpperCase(),
        formationState: input.state.toUpperCase(),
        entityStructure: input.entityType,
        source: 'AIO Registry Service',
        checkedAt: new Date().toISOString(),
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        errorCode: 'RATE_LIMITED',
        message: 'Too many checks — try again in a few minutes.',
        disclaimer:
          'A registry search is not the same as state filing approval. Final name acceptance is determined by the state when your filing is reviewed.',
      };
    } else if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      response = {
        status: 'error',
        businessNameRaw: input.businessName,
        businessNameNormalized: input.businessName.trim().toUpperCase(),
        formationState: input.state.toUpperCase(),
        entityStructure: input.entityType,
        source: 'AIO Registry Service',
        checkedAt: new Date().toISOString(),
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        errorCode: 'HTTP_ERROR',
        message: err.message ?? err.error ?? 'Could not complete the name check.',
        disclaimer:
          'A registry search is not the same as state filing approval. Final name acceptance is determined by the state when your filing is reviewed.',
      };
    } else {
      response = (await res.json()) as BusinessNameCheckResponse;
    }
  }

  return buildResultFromResponse({
    businessNameRaw: response.businessNameRaw,
    businessNameNormalized: response.businessNameNormalized,
    formationState: response.formationState,
    entityStructure: response.entityStructure,
    status: response.status,
    source: response.source,
    sourceUrl: response.sourceUrl,
    checkedAt: response.checkedAt,
    queryId: response.queryId,
    matchCount: response.matchCount,
    topMatches: response.topMatches,
    manualReviewRequired: response.manualReviewRequired,
    errorCode: response.errorCode,
    message: response.message,
  });
}

export function responseToPersistedResult(response: BusinessNameCheckResponse): BusinessNameCheckResult {
  return buildResultFromResponse({
    businessNameRaw: response.businessNameRaw,
    businessNameNormalized: response.businessNameNormalized,
    formationState: response.formationState,
    entityStructure: response.entityStructure,
    status: response.status,
    source: response.source,
    sourceUrl: response.sourceUrl,
    checkedAt: response.checkedAt,
    queryId: response.queryId,
    matchCount: response.matchCount,
    topMatches: response.topMatches,
    manualReviewRequired: response.manualReviewRequired,
    errorCode: response.errorCode,
    message: response.message,
  });
}
