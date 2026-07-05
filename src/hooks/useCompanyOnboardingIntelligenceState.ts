import { useCallback, useEffect, useState } from 'react';
import { buildCompanyOnboardingIntelligenceSeed } from '../studio-os-core/company-onboarding-intelligence/bootstrap';
import {
  bootstrapCompanyOnboardingIntelligenceStore,
  readCompanyOnboardingIntelligenceStore,
  selectCompanyOnboardingIntelligenceWorkspace,
} from '../studio-os-core/company-onboarding-intelligence/store';
import type { CompanyOnboardingIntelligenceWorkspaceId } from '../studio-os-core/company-onboarding-intelligence/types';

function ensureBootstrap(): void {
  bootstrapCompanyOnboardingIntelligenceStore(buildCompanyOnboardingIntelligenceSeed());
}

export function useCompanyOnboardingIntelligenceState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readCompanyOnboardingIntelligenceStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readCompanyOnboardingIntelligenceStore());
  }, []);

  const selectWorkspace = useCallback((id: CompanyOnboardingIntelligenceWorkspaceId) => {
    selectCompanyOnboardingIntelligenceWorkspace(id);
    setStore(readCompanyOnboardingIntelligenceStore());
  }, []);

  return { store, selectWorkspace };
}
