import type { BusinessNameCheckRequest, BusinessNameCheckResponse, BusinessNameRegistryAdapter } from '../types';
import { normalizeBusinessNameForLookup } from '../normalize';
import { getStateRegistryCapability } from '../stateCapabilities';
import { NAME_CHECK_DISCLAIMER } from '../types';

export class UnsupportedStateRegistryAdapter implements BusinessNameRegistryAdapter {
  readonly adapterId = 'unsupported';

  supports(): boolean {
    return true;
  }

  async check(request: BusinessNameCheckRequest): Promise<BusinessNameCheckResponse> {
    const cap = getStateRegistryCapability(request.state);
    return {
      status: 'lookup_unavailable',
      businessNameRaw: request.businessName,
      businessNameNormalized: normalizeBusinessNameForLookup(request.businessName),
      formationState: request.state.toUpperCase(),
      entityStructure: request.entityType,
      source: cap.sourceName,
      sourceUrl: cap.sourceUrl,
      checkedAt: new Date().toISOString(),
      matchCount: 0,
      topMatches: [],
      manualReviewRequired: true,
      errorCode: 'LOOKUP_UNAVAILABLE',
      message: `AIO could not automatically verify this name with the ${cap.stateName} business registry.`,
      disclaimer: NAME_CHECK_DISCLAIMER,
    };
  }
}

export const unsupportedStateRegistryAdapter = new UnsupportedStateRegistryAdapter();
