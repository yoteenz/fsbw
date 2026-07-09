import { useCallback } from 'react';
import {
  evaluateExecutiveIntelligence,
  type XsilIntelligenceQuery,
} from '../studio-os-core/genesis';

/** Hook for Executive Intelligence™ queries */
export function useExecutiveIntelligence(companyId: string) {
  const evaluate = useCallback(
    (query: Omit<XsilIntelligenceQuery, 'companyId'>) =>
      evaluateExecutiveIntelligence({ ...query, companyId }),
    [companyId]
  );

  return { evaluate, companyId };
}
