import { useCallback, useMemo, useState } from 'react';
import {
  buildContextPackage,
  type ContextBuilderInput,
  type ContextPackage,
  type MemoryBibleExportRecord,
  type MemoryBibleSnapshot,
  type MemoryBibleStore,
} from '../studio-os/memory-bible';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import { getDefaultMemoryBibleSnapshot } from '../utils/adminStudioMemoryBibleDemo';

function readStore(): MemoryBibleStore {
  return (
    readStudioJson<MemoryBibleStore>(ADMIN_STUDIO_STORAGE_KEYS.memoryBible) ?? {
      snapshot: getDefaultMemoryBibleSnapshot(),
      savedPackages: [],
      exportHistory: [],
      lastUpdated: new Date().toISOString(),
    }
  );
}

function writeStore(store: MemoryBibleStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.memoryBible, store);
}

export function useAdminStudioMemoryBible() {
  const [store, setStore] = useState<MemoryBibleStore>(() => readStore());

  const persist = useCallback((next: MemoryBibleStore) => {
    const withTs = { ...next, lastUpdated: new Date().toISOString() };
    writeStore(withTs);
    setStore(withTs);
  }, []);

  const snapshot = store.snapshot;

  const updateFounderNotes = useCallback(
    (founderNotes: string) => {
      persist({
        ...store,
        snapshot: {
          ...store.snapshot,
          founderProfile: { ...store.snapshot.founderProfile, founderNotes },
        },
      });
    },
    [persist, store]
  );

  const buildPackage = useCallback(
    (input: ContextBuilderInput): ContextPackage => buildContextPackage(input, snapshot),
    [snapshot]
  );

  const savePackage = useCallback(
    (pkg: ContextPackage) => {
      persist({
        ...store,
        savedPackages: [pkg, ...store.savedPackages.filter((p) => p.id !== pkg.id)].slice(0, 30),
      });
    },
    [persist, store]
  );

  const recordExport = useCallback(
    (pkg: ContextPackage, label: string) => {
      const record: MemoryBibleExportRecord = {
        id: `exp-${Date.now()}`,
        exportedAt: new Date().toISOString(),
        target: pkg.input.target,
        taskType: pkg.input.taskType,
        workspaceId: pkg.input.workspaceId,
        packageId: pkg.id,
        label,
      };
      persist({
        ...store,
        exportHistory: [record, ...store.exportHistory].slice(0, 50),
      });
    },
    [persist, store]
  );

  const decisionCount = useMemo(() => snapshot.decisionLog.length, [snapshot.decisionLog]);
  const namingCount = useMemo(() => snapshot.namingBible.length, [snapshot.namingBible]);

  return {
    store,
    snapshot,
    savedPackages: store.savedPackages,
    exportHistory: store.exportHistory,
    decisionCount,
    namingCount,
    updateFounderNotes,
    buildPackage,
    savePackage,
    recordExport,
  };
}

export type { MemoryBibleSnapshot, ContextBuilderInput, ContextPackage };
