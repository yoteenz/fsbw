import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureOrbSubsystem,
  getOrbPlatformStats,
  getOrbReadyView,
  overrideOrbRecommendation,
  recordFounderOrbMessage,
  recordOrbResponse,
  type OrbRuntimeInput,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { useCompanyRouteOptional } from '../studio-os-core/company-routes';

export function useOrbState() {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const companyRoute = useCompanyRouteOptional();
  const [tick, setTick] = useState(0);

  const runtimeInput = useMemo<OrbRuntimeInput>(
    () => ({
      pathname,
      companyDisplayName: workspace?.displayName,
      founderDisplayName: undefined,
      companyIdentityId: companyRoute?.companyId,
      departmentLabel: companyRoute?.activeDepartment ?? null,
      roomLabel: undefined,
    }),
    [pathname, workspace?.displayName, companyRoute?.companyId, companyRoute?.activeDepartment]
  );

  const refresh = useCallback(() => {
    ensureOrbSubsystem(runtimeInput);
    setTick((n) => n + 1);
  }, [runtimeInput]);

  useEffect(() => {
    ensureOrbSubsystem(runtimeInput);
  }, [runtimeInput]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(() => getOrbReadyView(runtimeInput), [runtimeInput, tick]);
  const stats = useMemo(() => getOrbPlatformStats(runtimeInput), [runtimeInput, tick]);

  const sendFounderMessage = useCallback(
    (content: string) => {
      recordFounderOrbMessage(content);
      recordOrbResponse(
        'I understand. Let me review the company context and recommend the safest next move.',
        'system',
        'executive-advisor',
        ['Orb™', 'Executive Headquarters™']
      );
      refresh();
    },
    [refresh]
  );

  const dismissRecommendation = useCallback(
    (recommendationId: string) => {
      overrideOrbRecommendation(recommendationId);
      recordOrbResponse('Understood. I will adjust future recommendations.', 'recommendation', 'executive-advisor');
      refresh();
    },
    [refresh]
  );

  return {
    view,
    stats,
    runtimeInput,
    sendFounderMessage,
    dismissRecommendation,
    refresh,
    tick,
  };
}
