import type {
  BusinessNameCheckRequest,
  BusinessNameCheckResponse,
  BusinessNameRegistryAdapter,
  BusinessNameRegistryMatch,
} from '../types';
import { normalizeBusinessNameForLookup } from '../normalize';
import { getStateRegistryCapability } from '../stateCapabilities';
import { NAME_CHECK_DISCLAIMER } from '../types';

const TOPOGRAPH_COUNTRY: Record<string, string> = {
  TN: 'US-TN',
  GA: 'US-GA',
  IL: 'US-IL',
};

interface TopographSearchHit {
  id?: string;
  legalName?: string;
  status?: string;
  entityType?: string;
  match?: { matchType?: string };
}

function classifyMatches(
  normalizedQuery: string,
  hits: TopographSearchHit[],
): { status: BusinessNameCheckResponse['status']; matches: BusinessNameRegistryMatch[] } {
  const mapped: BusinessNameRegistryMatch[] = hits
    .filter((h) => h.legalName)
    .slice(0, 8)
    .map((h) => {
      const name = h.legalName!.trim();
      const normName = normalizeBusinessNameForLookup(name);
      let similarity: BusinessNameRegistryMatch['similarity'] = 'partial';
      if (normName === normalizedQuery) similarity = 'exact';
      else if (normName.startsWith(normalizedQuery) || normalizedQuery.startsWith(normName)) similarity = 'strong';
      return {
        name,
        entityType: h.entityType,
        status: h.status,
        controlNumber: h.id,
        similarity,
      };
    });

  const exact = mapped.find((m) => m.similarity === 'exact');
  if (exact) {
    return { status: 'unavailable', matches: mapped };
  }
  const strong = mapped.filter((m) => m.similarity === 'strong' || m.similarity === 'partial');
  if (strong.length > 0) {
    return { status: 'possible_conflict', matches: mapped };
  }
  return { status: 'likely_available', matches: [] };
}

export class TopographBusinessNameRegistryAdapter implements BusinessNameRegistryAdapter {
  readonly adapterId = 'topograph';

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.topograph.co') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  supports(state: string): boolean {
    return Boolean(TOPOGRAPH_COUNTRY[state.toUpperCase()]);
  }

  async check(request: BusinessNameCheckRequest): Promise<BusinessNameCheckResponse> {
    const state = request.state.toUpperCase();
    const cap = getStateRegistryCapability(state);
    const normalized = normalizeBusinessNameForLookup(request.businessName);
    const country = TOPOGRAPH_COUNTRY[state];

    if (!country) {
      return this.unavailable(request, cap.sourceName, cap.sourceUrl, 'STATE_NOT_SUPPORTED');
    }

    if (!normalized || normalized.length < 2) {
      return this.error(request, cap, 'INVALID_NAME', 'Business name must be at least 2 characters.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `${this.baseUrl}/v2/search?country=${encodeURIComponent(country)}&query=${encodeURIComponent(normalized)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'x-api-key': this.apiKey },
        signal: controller.signal,
      });

      if (res.status === 429) {
        return this.error(request, cap, 'RATE_LIMITED', 'Registry rate limit reached. Try again shortly.');
      }

      if (!res.ok) {
        return this.error(request, cap, `HTTP_${res.status}`, 'Registry provider returned an error.');
      }

      const hits = (await res.json()) as TopographSearchHit[];
      const { status, matches } = classifyMatches(normalized, Array.isArray(hits) ? hits : []);

      return {
        status,
        businessNameRaw: request.businessName,
        businessNameNormalized: normalized,
        formationState: state,
        entityStructure: request.entityType,
        source: cap.sourceName,
        sourceUrl: cap.sourceUrl,
        checkedAt: new Date().toISOString(),
        queryId: `topograph-${state}-${Date.now()}`,
        matchCount: matches.length,
        topMatches: matches.slice(0, 5),
        manualReviewRequired: false,
        disclaimer: NAME_CHECK_DISCLAIMER,
        message:
          status === 'likely_available'
            ? `No exact conflict was found in the ${cap.stateName} business registry.`
            : status === 'possible_conflict'
              ? 'We found existing businesses with similar names.'
              : `An existing business appears to use this name in ${cap.stateName}.`,
      };
    } catch (err) {
      const code = err instanceof Error && err.name === 'AbortError' ? 'TIMEOUT' : 'PROVIDER_ERROR';
      return this.error(request, cap, code, 'Could not reach the registry provider.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private error(
    request: BusinessNameCheckRequest,
    cap: ReturnType<typeof getStateRegistryCapability>,
    errorCode: string,
    message: string,
  ): BusinessNameCheckResponse {
    return {
      status: 'error',
      businessNameRaw: request.businessName,
      businessNameNormalized: normalizeBusinessNameForLookup(request.businessName),
      formationState: request.state.toUpperCase(),
      entityStructure: request.entityType,
      source: cap.sourceName,
      sourceUrl: cap.sourceUrl,
      checkedAt: new Date().toISOString(),
      matchCount: 0,
      topMatches: [],
      manualReviewRequired: false,
      errorCode,
      message,
      disclaimer: NAME_CHECK_DISCLAIMER,
    };
  }

  private unavailable(
    request: BusinessNameCheckRequest,
    source: string,
    sourceUrl: string,
    errorCode: string,
  ): BusinessNameCheckResponse {
    const cap = getStateRegistryCapability(request.state);
    return {
      status: 'lookup_unavailable',
      businessNameRaw: request.businessName,
      businessNameNormalized: normalizeBusinessNameForLookup(request.businessName),
      formationState: request.state.toUpperCase(),
      entityStructure: request.entityType,
      source,
      sourceUrl,
      checkedAt: new Date().toISOString(),
      matchCount: 0,
      topMatches: [],
      manualReviewRequired: true,
      errorCode,
      message: `AIO could not automatically verify this name with the ${cap.stateName} business registry.`,
      disclaimer: NAME_CHECK_DISCLAIMER,
    };
  }
}

export function createTopographAdapterFromEnv(): TopographBusinessNameRegistryAdapter | null {
  const key = typeof process !== 'undefined' ? process.env.AIO_TOPOGRAPH_API_KEY : undefined;
  if (!key) return null;
  const base = process.env.AIO_TOPOGRAPH_API_BASE ?? 'https://api.topograph.co';
  return new TopographBusinessNameRegistryAdapter(key, base);
}
