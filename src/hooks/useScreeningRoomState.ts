import { useCallback, useState } from 'react';
import { buildScreeningRoomSeed } from '../studio-os-core/screening-room/bootstrap';
import {
  bootstrapScreeningRoomStore,
  readScreeningRoomStore,
  recordScreeningAction,
  selectScreeningProduction,
  selectScreeningVersion,
  setScreeningCompareField,
  setScreeningCompareMode,
  setScreeningPlayerPlaying,
  toggleScreeningCompareVersion,
} from '../studio-os-core/screening-room/store';
import type { ComparisonFieldId, ScreeningReviewAction } from '../studio-os-core/screening-room/types';

function ensureBootstrap(): void {
  bootstrapScreeningRoomStore(buildScreeningRoomSeed());
}

export function useScreeningRoomState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readScreeningRoomStore();

  const selectedProduction =
    store.productions.find((p) => p.id === store.selectedProductionId) ?? store.productions[0] ?? null;

  const currentVersion =
    selectedProduction?.versions.find((v) => v.id === store.currentVersionId) ??
    selectedProduction?.versions.find((v) => v.isCurrent) ??
    selectedProduction?.versions[0] ??
    null;

  const compareVersions =
    selectedProduction?.versions.filter((v) => store.compareVersionIds.includes(v.id)) ?? [];

  const selectProduction = useCallback(
    (id: string) => {
      selectScreeningProduction(id);
      refresh();
    },
    [refresh]
  );

  const selectVersion = useCallback(
    (id: string) => {
      selectScreeningVersion(id);
      refresh();
    },
    [refresh]
  );

  const toggleCompare = useCallback(
    (id: string) => {
      toggleScreeningCompareVersion(id);
      refresh();
    },
    [refresh]
  );

  const setCompareMode = useCallback(
    (enabled: boolean) => {
      setScreeningCompareMode(enabled);
      refresh();
    },
    [refresh]
  );

  const setCompareField = useCallback(
    (field: ComparisonFieldId) => {
      setScreeningCompareField(field);
      refresh();
    },
    [refresh]
  );

  const setPlaying = useCallback(
    (playing: boolean) => {
      setScreeningPlayerPlaying(playing);
      refresh();
    },
    [refresh]
  );

  const runAction = useCallback(
    (action: ScreeningReviewAction, note: string) => {
      recordScreeningAction(action, note);
      refresh();
    },
    [refresh]
  );

  return {
    store,
    selectedProduction,
    currentVersion,
    compareVersions,
    selectProduction,
    selectVersion,
    toggleCompare,
    setCompareMode,
    setCompareField,
    setPlaying,
    runAction,
    refresh,
  };
}
