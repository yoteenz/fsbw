import { useCallback, useMemo } from 'react';
import {
  evaluateBrandIntelligence,
  scoreBrandConsistency,
  type XbdBrandDnaRecord,
  type XbdIntelligenceQuery,
} from '../studio-os-core/genesis';

/** Hook for Brand Intelligence Layer™ — evaluate artifacts against Brand DNA */
export function useBrandIntelligence(brand: XbdBrandDnaRecord) {
  const evaluate = useCallback(
    (query: Omit<XbdIntelligenceQuery, 'brandId'>) =>
      evaluateBrandIntelligence({ ...query, brandId: brand.brandId }),
    [brand.brandId]
  );

  const score = useCallback(
    (artifactSummary: string, artifactType?: string) =>
      scoreBrandConsistency(brand, artifactSummary, artifactType),
    [brand]
  );

  return useMemo(() => ({ evaluate, score, brandId: brand.brandId }), [evaluate, score, brand.brandId]);
}
