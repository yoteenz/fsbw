import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureLiveValidationSystemSubsystem,
  getLiveValidationPlatformStats,
  getLiveValidationSystemReadyView,
  LVS_DASHBOARD_VIEWS,
  isValidLvsDashboardView,
  reviewGenesisProposal,
  type LvsDashboardView,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useLiveValidationSystemState(initialView: LvsDashboardView = 'overview') {
  const [activeView, setActiveView] = useState<LvsDashboardView>(initialView);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureLiveValidationSystemSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureLiveValidationSystemSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () => getLiveValidationSystemReadyView(activeView),
    [activeView, tick]
  );

  const stats = useMemo(() => getLiveValidationPlatformStats(), [tick]);

  const selectView = useCallback((viewId: string) => {
    if (isValidLvsDashboardView(viewId)) setActiveView(viewId);
  }, []);

  const acceptProposal = useCallback(
    (proposalId: string, note: string) => {
      reviewGenesisProposal(proposalId, 'accepted', note);
      refresh();
    },
    [refresh]
  );

  const rejectProposal = useCallback(
    (proposalId: string, note: string) => {
      reviewGenesisProposal(proposalId, 'rejected', note);
      refresh();
    },
    [refresh]
  );

  return {
    view,
    stats,
    activeView,
    dashboardViews: LVS_DASHBOARD_VIEWS,
    selectView,
    acceptProposal,
    rejectProposal,
    refresh,
    tick,
  };
}
