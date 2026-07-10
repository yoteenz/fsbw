import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildOrbReadyViewSnapshot,
  ensureOrbSubsystem,
  getOrbPlatformStats,
  overrideOrbRecommendation,
  recordFounderOrbMessage,
  recordOrbResponse,
  syncOrbRouteContext,
  type OrbPlatformStats,
  type OrbReadyView,
  type OrbRuntimeInput,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { useCompanyRouteOptional } from '../studio-os-core/company-routes';

export function useOrbState() {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const companyRoute = useCompanyRouteOptional();
  const genesisListenerRef = useRef<(event: Event) => void>(() => {});

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

  const readSnapshot = useCallback((): { view: OrbReadyView; stats: OrbPlatformStats } => {
    syncOrbRouteContext(runtimeInput);
    return {
      view: buildOrbReadyViewSnapshot(runtimeInput),
      stats: getOrbPlatformStats(runtimeInput),
    };
  }, [runtimeInput]);

  const [view, setView] = useState<OrbReadyView>(() => buildOrbReadyViewSnapshot(runtimeInput));
  const [stats, setStats] = useState<OrbPlatformStats>(() => ({
    memoryCount: 0,
    conversationCount: 0,
    recommendationCount: 0,
    missionAdviceCount: 0,
    presenceState: 'idle' as const,
    activeRole: 'executive-advisor' as const,
  }));

  const applySnapshot = useCallback(() => {
    const next = readSnapshot();
    setView(next.view);
    setStats(next.stats);
  }, [readSnapshot]);

  useEffect(() => {
    ensureOrbSubsystem(runtimeInput);
  }, [runtimeInput]);

  useEffect(() => {
    applySnapshot();
  }, [applySnapshot]);

  useEffect(() => {
    const onUpdate = () => applySnapshot();
    genesisListenerRef.current = onUpdate;
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [applySnapshot]);

  const refresh = useCallback(() => {
    applySnapshot();
  }, [applySnapshot]);

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
  };
}
