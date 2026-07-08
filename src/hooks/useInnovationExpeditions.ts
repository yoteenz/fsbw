import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildExpeditionGuideCompleteLines,
  buildExpeditionGuideStopLines,
  buildExpeditionGuideWelcomeLines,
  ensureOrganizationInnovationExpeditionsProfile,
  filterStopsForPath,
  getExpeditionById,
  advanceExpeditionStop,
  setExpeditionPathLevel,
  startExpedition,
  STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED,
  type ExpeditionGuideLine,
  type ExpeditionPathLevel,
  type ExpeditionType,
  type OrganizationInnovationExpeditionsProfile,
} from '../studio-os-core/innovation-expeditions';

export function useInnovationExpeditions() {
  const { workspaceId } = useWorkspace();
  const orgId = workspaceId ?? 'frontal-slayer';

  const [profile, setProfile] = useState<OrganizationInnovationExpeditionsProfile>(() =>
    ensureOrganizationInnovationExpeditionsProfile(orgId)
  );
  const [guideLines, setGuideLines] = useState<ExpeditionGuideLine[]>(() => buildExpeditionGuideWelcomeLines());
  const [typeFilter, setTypeFilter] = useState<ExpeditionType | 'all'>('all');

  const refresh = useCallback(() => {
    const next = ensureOrganizationInnovationExpeditionsProfile(orgId);
    setProfile(next);
    return next;
  }, [orgId]);

  const activeExpedition = useMemo(
    () =>
      profile.activeExpeditionId
        ? getExpeditionById(profile.expeditions, profile.activeExpeditionId)
        : null,
    [profile]
  );

  const activeStops = useMemo(() => {
    if (!activeExpedition) return [];
    return filterStopsForPath(activeExpedition, profile.activePathLevel);
  }, [activeExpedition, profile.activePathLevel]);

  const activeStop = useMemo(
    () => activeStops[profile.activeStopIndex] ?? null,
    [activeStops, profile.activeStopIndex]
  );

  const filteredExpeditions = useMemo(() => {
    if (typeFilter === 'all') return profile.expeditions;
    return profile.expeditions.filter((e) => e.type === typeFilter);
  }, [profile.expeditions, typeFilter]);

  const beginExpedition = useCallback(
    (expeditionId: string, pathLevel?: ExpeditionPathLevel) => {
      const updated = startExpedition(orgId, expeditionId, pathLevel) ?? profile;
      setProfile(updated);
      const exp = getExpeditionById(updated.expeditions, expeditionId);
      if (exp) {
        const stops = filterStopsForPath(exp, updated.activePathLevel);
        const first = stops[0];
        setGuideLines(first ? buildExpeditionGuideStopLines(first) : buildExpeditionGuideWelcomeLines());
      }
    },
    [orgId, profile]
  );

  const nextStop = useCallback(() => {
    const updated = advanceExpeditionStop(orgId) ?? profile;
    setProfile(updated);
    const exp = updated.activeExpeditionId
      ? getExpeditionById(updated.expeditions, updated.activeExpeditionId)
      : null;
    if (!exp) return;
    const stops = filterStopsForPath(exp, updated.activePathLevel);
    const stop = stops[updated.activeStopIndex];
    if (stop) {
      setGuideLines(buildExpeditionGuideStopLines(stop));
    } else if (updated.completedExpeditionIds.includes(exp.id)) {
      setGuideLines(buildExpeditionGuideCompleteLines(exp));
    }
  }, [orgId, profile]);

  const changePath = useCallback(
    (pathLevel: ExpeditionPathLevel) => {
      const updated = setExpeditionPathLevel(orgId, pathLevel) ?? profile;
      setProfile(updated);
      setGuideLines(buildExpeditionGuideWelcomeLines());
    },
    [orgId, profile]
  );

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED, onUpdate);
    return () => window.removeEventListener(STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED, onUpdate);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [orgId, refresh]);

  useEffect(() => {
    if (activeStop) {
      setGuideLines(buildExpeditionGuideStopLines(activeStop));
    }
  }, [activeStop?.id]);

  return {
    profile,
    guideLines,
    typeFilter,
    setTypeFilter,
    activeExpedition,
    activeStop,
    activeStops,
    filteredExpeditions,
    refresh,
    beginExpedition,
    nextStop,
    changePath,
  };
}
