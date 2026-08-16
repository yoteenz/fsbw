import { useMemo } from 'react';
import { useDemoStore } from '../demo/useDemoStore';
import {
  getOrganizationId,
  getRoadReadySummary,
  getRoadReadyProfile,
  getRoadReadyItems,
  getFleetUnits,
  getTrailers,
} from '../demo/roadReadyActions';
import { pickNextBestAction, nextBestActionCopy } from './roadReadyPriority';
import { ONBOARDING_STEPS } from './roadReadyConfig';

export function useRoadReady(orgId?: string) {
  const store = useDemoStore();
  const organizationId = orgId ?? getOrganizationId(store);

  return useMemo(() => {
    const summary = getRoadReadySummary(organizationId);
    const profile = getRoadReadyProfile(organizationId, store);
    const items = getRoadReadyItems(organizationId, store);
    const units = getFleetUnits(organizationId, store);
    const trailers = getTrailers(organizationId, store);
    const drivers = store.drivers.filter((d) => d.organizationId === organizationId);
    const history = store.roadReadyHistory.filter((h) => h.organizationId === organizationId && h.visibility === 'customer');
    const client = store.clients.find((c) => c.id === organizationId);
    const isShipper = client?.clientType === 'shipper';

    const attention = summary?.attention ?? [];
    const nextAction = pickNextBestAction(attention);
    const nextCopy = nextBestActionCopy(nextAction);

    const onboardingProgress = profile
      ? Math.round((profile.onboardingStep / ONBOARDING_STEPS.length) * 100)
      : 0;

    return {
      organizationId,
      profile,
      items,
      units,
      trailers,
      drivers,
      history,
      client,
      isShipper,
      summary,
      attention,
      nextAction,
      nextCopy,
      onboardingProgress,
      hasProfile: Boolean(profile),
      needsOnboarding: Boolean(profile && !profile.onboardingComplete && !profile.onboardingSkipped),
    };
  }, [organizationId, store]);
}
