import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ORB_RECOMMENDATION_EVENT,
  buildOrbRecommendationsSnapshot,
  buildOrbWorldSignals,
  hasShownOrbDailyBriefThisSession,
  markOrbDailyBriefSessionShown,
  readOrbPersonalization,
  recordOrbRoomVisit,
  setOrbFocusMode,
  type OrbFocusMode,
  type OrbRecommendation,
} from '../studio-os-core/orb-recommendations';

export function useStudioOrbRecommendations() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { workspaceId, workspace } = useWorkspace();
  const organizationId = workspaceId ?? 'frontal-slayer';
  const companyName = workspace?.displayName ?? 'Frontal Slayer';

  const [tick, setTick] = useState(0);
  const [showDailyBrief, setShowDailyBrief] = useState(false);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener(ORB_RECOMMENDATION_EVENT, onChange);
    return () => window.removeEventListener(ORB_RECOMMENDATION_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!pathname.startsWith('/admin/studio')) return;
    recordOrbRoomVisit(organizationId, pathname);
  }, [organizationId, pathname]);

  const snapshot = useMemo(() => {
    void tick;
    return buildOrbRecommendationsSnapshot(organizationId, companyName, pathname);
  }, [organizationId, companyName, pathname, tick]);

  const profile = useMemo(() => {
    void tick;
    return readOrbPersonalization(organizationId);
  }, [organizationId, tick]);

  useEffect(() => {
    if (!pathname.startsWith('/admin/studio')) return;
    if (hasShownOrbDailyBriefThisSession()) return;
    setShowDailyBrief(true);
    markOrbDailyBriefSessionShown();
  }, [pathname]);

  const dismissDailyBrief = useCallback(() => setShowDailyBrief(false), []);

  const changeFocusMode = useCallback(
    (mode: OrbFocusMode) => {
      setOrbFocusMode(organizationId, mode);
      setTick((t) => t + 1);
    },
    [organizationId]
  );

  const acceptRecommendation = useCallback(
    (rec: OrbRecommendation) => {
      if (rec.targetPath) navigate(rec.targetPath);
    },
    [navigate]
  );

  const acceptJourney = useCallback(() => {
    const first = snapshot.executiveJourney.stops.find((s) => s.path);
    if (first?.path) navigate(first.path);
  }, [navigate, snapshot.executiveJourney.stops]);

  const topAmbientInsight = useMemo(() => {
    const top = snapshot.recommendations[0];
    if (!top) return snapshot.dailyBrief.lines[0] ?? null;
    return top.title;
  }, [snapshot]);

  return {
    snapshot,
    profile,
    showDailyBrief,
    dismissDailyBrief,
    changeFocusMode,
    acceptRecommendation,
    acceptJourney,
    topAmbientInsight,
    buildWorldSignals: buildOrbWorldSignals,
  };
}
