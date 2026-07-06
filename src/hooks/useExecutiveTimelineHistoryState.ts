import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED,
  syncExecutiveTimelineHistoryFromSources,
  type HistoryFilterState,
  type OrganizationExecutiveHistoryProfile,
} from '../studio-os-core/executive-timeline';

const DEFAULT_FILTERS: HistoryFilterState = {
  department: 'all',
  projectId: 'all',
  organizationId: 'all',
  yearFrom: null,
  yearTo: null,
  eventType: 'all',
};

export function useExecutiveTimelineHistoryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExecutiveHistoryProfile | null>(null);
  const [filters, setFilters] = useState<HistoryFilterState>(DEFAULT_FILTERS);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayActive, setReplayActive] = useState(false);

  const refresh = useCallback(() => {
    const next = syncExecutiveTimelineHistoryFromSources(workspaceId);
    setProfile(next);
    if (selectedYear == null && next.yearSnapshots.length > 0) {
      setSelectedYear(next.yearSnapshots[next.yearSnapshots.length - 1]?.year ?? null);
    }
  }, [workspaceId, selectedYear]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED, onUpdate);
    window.addEventListener('studio-os-organizational-consciousness-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-organizational-consciousness-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const updateFilter = useCallback(
    (patch: Partial<HistoryFilterState>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const startReplay = useCallback(() => {
    setReplayActive(true);
    setReplayIndex(0);
  }, []);

  const stopReplay = useCallback(() => {
    setReplayActive(false);
    setReplayIndex(0);
  }, []);

  const advanceReplay = useCallback(() => {
    if (!profile) return;
    setReplayIndex((i) => Math.min(i + 1, profile.yearSnapshots.length - 1));
  }, [profile]);

  return {
    profile,
    filters,
    selectedYear,
    replayActive,
    replayIndex,
    refresh,
    updateFilter,
    setSelectedYear,
    startReplay,
    stopReplay,
    advanceReplay,
  };
}
