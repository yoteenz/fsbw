import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureFounderAcceptanceTestingSubsystem,
  getFounderAcceptancePlatformStats,
  getFounderAcceptanceTestingReadyView,
  FAT_DASHBOARD_VIEWS,
  isValidDashboardView,
  type FatDashboardView,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useFounderAcceptanceTestingState(
  initialView: FatDashboardView = 'validation-dashboard'
) {
  const [activeView, setActiveView] = useState<FatDashboardView>(initialView);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureFounderAcceptanceTestingSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureFounderAcceptanceTestingSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () => getFounderAcceptanceTestingReadyView(activeView),
    [activeView, tick]
  );

  const stats = useMemo(() => getFounderAcceptancePlatformStats(), [tick]);

  const selectView = useCallback((viewId: string) => {
    if (isValidDashboardView(viewId)) {
      setActiveView(viewId);
    }
  }, []);

  return {
    view,
    stats,
    activeView,
    dashboardViews: FAT_DASHBOARD_VIEWS,
    selectView,
    refresh,
    tick,
  };
}
