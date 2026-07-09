import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BUSINESS_DISCOVERY_UPDATED_EVENT,
  bootstrapBusinessDiscovery,
  syncBusinessDiscovery,
  type BusinessDiscoveryQuestion,
  type BusinessDiscoveryState,
  type DiscoveryInsight,
  type DiscoverySession,
  type DiscoveryVisualExperience,
} from '../studio-os-core/business-discovery';

const DEFAULT_ORG = 'studio-local-org';

export function useBusinessDiscoveryState(
  organizationId = DEFAULT_ORG,
  options?: {
    founderId?: string;
    founderName?: string;
    companyName?: string;
    industryId?: string;
  }
) {
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [visualExperience, setVisualExperience] = useState<DiscoveryVisualExperience | null>(null);
  const [nextQuestions, setNextQuestions] = useState<BusinessDiscoveryQuestion[]>([]);
  const [topInsight, setTopInsight] = useState<DiscoveryInsight | null>(null);

  const refresh = useCallback(() => {
    const next = syncBusinessDiscovery({
      organizationId,
      founderId: options?.founderId,
      companyName: options?.companyName,
      industryId: options?.industryId,
    });
    setSession(next.session);
    setVisualExperience(next.visualExperience);
    setNextQuestions(next.nextQuestions);
    setTopInsight(next.topInsight);
  }, [organizationId, options?.founderId, options?.companyName, options?.industryId]);

  useEffect(() => {
    bootstrapBusinessDiscovery(organizationId, {
      founderId: options?.founderId,
      founderName: options?.founderName,
      companyName: options?.companyName,
      industryId: options?.industryId,
    });
    refresh();
  }, [organizationId, options?.founderId, options?.founderName, options?.companyName, options?.industryId, refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(BUSINESS_DISCOVERY_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(BUSINESS_DISCOVERY_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const state: BusinessDiscoveryState | null = useMemo(() => {
    if (!session || !visualExperience) return null;
    return { session, visualExperience, nextQuestions, topInsight };
  }, [session, visualExperience, nextQuestions, topInsight]);

  return { session, visualExperience, nextQuestions, topInsight, state, refresh };
}
