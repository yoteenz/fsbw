import { useCallback, useMemo, useState } from 'react';
import { buildDesignGenomeSeed } from '../studio-os-core/design-genome/bootstrap';
import {
  bootstrapDesignGenomeStore,
  capturePendingPromotion,
  getCurrentVersion,
  getSelectedEntry,
  getSelectedReview,
  promoteDesignFromFounderPhrase,
  queuePendingPromotion,
  readDesignGenomeStore,
  runPreBuildReview,
  searchDesignMemory,
  selectGenomeEntry,
  setDesignGenomeNav,
  setMemoryQuery,
} from '../studio-os-core/design-genome/store';
import { asModuleTenantId } from '../studio-os-core/workspace/tenant-ids';
import { getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import type { DesignGenomeNavId } from '../studio-os-core/design-genome/types';

function ensureBootstrap(): void {
  const orgId = asModuleTenantId(getRuntimeActiveWorkspaceId());
  bootstrapDesignGenomeStore(buildDesignGenomeSeed(orgId));
}

export function useDesignGenomeState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readDesignGenomeStore();
  const selectedEntry = getSelectedEntry(store);
  const currentVersion = selectedEntry ? getCurrentVersion(selectedEntry) : null;
  const selectedReview = getSelectedReview(store);
  const memoryMatches = useMemo(
    () => searchDesignMemory(store.memoryQuery),
    [store.memoryQuery, store.entries.length]
  );

  const selectEntry = useCallback(
    (id: string) => {
      selectGenomeEntry(id);
      refresh();
    },
    [refresh]
  );

  const setNav = useCallback(
    (navId: DesignGenomeNavId) => {
      setDesignGenomeNav(navId);
      refresh();
    },
    [refresh]
  );

  const setQuery = useCallback(
    (query: string) => {
      setMemoryQuery(query);
      refresh();
    },
    [refresh]
  );

  const capturePromotion = useCallback(
    (id: string) => {
      capturePendingPromotion(id);
      refresh();
    },
    [refresh]
  );

  const promoteFromPhrase = useCallback(
    (phrase: string, route: string, label: string) => {
      queuePendingPromotion(phrase, route, label);
      promoteDesignFromFounderPhrase(phrase, route, label);
      refresh();
    },
    [refresh]
  );

  const runPreBuild = useCallback(
    (problem: string) => {
      runPreBuildReview(problem);
      refresh();
    },
    [refresh]
  );

  return {
    store,
    selectedEntry,
    currentVersion,
    selectedReview,
    memoryMatches,
    selectEntry,
    setNav,
    setQuery,
    capturePromotion,
    promoteFromPhrase,
    runPreBuild,
    refresh,
  };
}
