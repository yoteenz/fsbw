import type {
  BusinessNameCheckRequest,
  BusinessNameCheckResponse,
  BusinessNameRegistryAdapter,
  BusinessNameRegistryMatch,
} from '../types';
import { normalizeBusinessNameForLookup } from '../normalize';
import { getStateRegistryCapability } from '../stateCapabilities';
import { NAME_CHECK_DISCLAIMER } from '../types';

const DEMO_LIKELY_AVAILABLE = ['demo available', 'likely available demo', 'aio demo available'];
const DEMO_EXACT_CONFLICT = ['demo conflict exact', 'exact conflict demo'];
const DEMO_POSSIBLE_CONFLICT = ['demo conflict', 'perfect choice', 'possible conflict demo'];
const DEMO_MANUAL = ['demo manual', 'manual review demo'];
const DEMO_ERROR = ['demo error', 'registry error demo'];

function baseResponse(
  request: BusinessNameCheckRequest,
  partial: Partial<BusinessNameCheckResponse> & Pick<BusinessNameCheckResponse, 'status' | 'matchCount' | 'topMatches' | 'manualReviewRequired'>,
): BusinessNameCheckResponse {
  const cap = getStateRegistryCapability(request.state);
  const normalized = normalizeBusinessNameForLookup(request.businessName);
  return {
    businessNameRaw: request.businessName,
    businessNameNormalized: normalized,
    formationState: request.state.toUpperCase(),
    entityStructure: request.entityType,
    source: `AIO Demo Registry (${cap.sourceName})`,
    sourceUrl: cap.sourceUrl,
    checkedAt: new Date().toISOString(),
    queryId: `demo-${Date.now()}`,
    disclaimer: NAME_CHECK_DISCLAIMER,
    message: partial.message,
    errorCode: partial.errorCode,
    ...partial,
  };
}

function similarMatches(baseName: string): BusinessNameRegistryMatch[] {
  const stem = baseName.replace(/\s+(LLC|INC|CORP|CO)\.?$/i, '').trim() || baseName;
  return [
    { name: `${stem} Logistics LLC`, entityType: 'LLC', status: 'Active', similarity: 'partial' },
    { name: `${stem} Transport Inc.`, entityType: 'Corporation', status: 'Active', similarity: 'partial' },
    { name: `${stem} Enterprises LLC`, entityType: 'LLC', status: 'Active', similarity: 'partial' },
  ];
}

export class DemoBusinessNameRegistryAdapter implements BusinessNameRegistryAdapter {
  readonly adapterId = 'demo';

  supports(): boolean {
    return true;
  }

  async check(request: BusinessNameCheckRequest): Promise<BusinessNameCheckResponse> {
    const normalized = normalizeBusinessNameForLookup(request.businessName).toLowerCase();
    const cap = getStateRegistryCapability(request.state);

    if (!request.businessName.trim()) {
      return baseResponse(request, {
        status: 'error',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        errorCode: 'EMPTY_NAME',
        message: 'Enter a business name to check.',
      });
    }

    if (!request.state.trim()) {
      return baseResponse(request, {
        status: 'error',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        errorCode: 'MISSING_STATE',
        message: 'Select a formation state before checking.',
      });
    }

    if (DEMO_ERROR.some((k) => normalized.includes(k))) {
      return baseResponse(request, {
        status: 'error',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        errorCode: 'DEMO_REGISTRY_ERROR',
        message: 'Simulated registry timeout.',
      });
    }

    if (DEMO_MANUAL.some((k) => normalized.includes(k))) {
      return baseResponse(request, {
        status: 'manual_review_required',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: true,
        message: `Demo: manual verification required for ${cap.stateName}.`,
      });
    }

    if (DEMO_EXACT_CONFLICT.some((k) => normalized.includes(k))) {
      return baseResponse(request, {
        status: 'unavailable',
        matchCount: 1,
        topMatches: [{ name: request.businessName.trim().toUpperCase(), entityType: 'LLC', status: 'Active', similarity: 'exact' }],
        manualReviewRequired: false,
        message: `An existing business appears to use this name in ${cap.stateName}.`,
      });
    }

    if (DEMO_POSSIBLE_CONFLICT.some((k) => normalized.includes(k))) {
      const matches = similarMatches(request.businessName);
      return baseResponse(request, {
        status: 'possible_conflict',
        matchCount: matches.length,
        topMatches: matches,
        manualReviewRequired: false,
        message: 'We found existing businesses with similar names.',
      });
    }

    if (DEMO_LIKELY_AVAILABLE.some((k) => normalized.includes(k)) || normalized.startsWith('UNIQUE')) {
      return baseResponse(request, {
        status: 'likely_available',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: false,
        message: `No exact conflict was found in the ${cap.stateName} business registry.`,
      });
    }

    if (!cap.automatedLookupSupported) {
      return baseResponse(request, {
        status: 'lookup_unavailable',
        matchCount: 0,
        topMatches: [],
        manualReviewRequired: true,
        message: `Demo: ${cap.stateName} requires manual verification in production.`,
      });
    }

    return baseResponse(request, {
      status: 'likely_available',
      matchCount: 0,
      topMatches: [],
      manualReviewRequired: false,
      message: `No exact conflict was found in the ${cap.stateName} business registry (demo).`,
    });
  }
}

export const demoBusinessNameRegistryAdapter = new DemoBusinessNameRegistryAdapter();
