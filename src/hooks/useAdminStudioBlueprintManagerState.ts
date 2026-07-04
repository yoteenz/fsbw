import { useCallback, useMemo, useState } from 'react';
import {
  BLUEPRINT_LIBRARY_SEED,
  type BlueprintDefinition,
  type BlueprintStatus,
  type ChecklistItemStatus,
} from '../utils/adminStudioBlueprintManagerDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type BlueprintStore = {
  overrides?: Record<string, Partial<BlueprintDefinition> & { status?: BlueprintStatus }>;
  checklistOverrides?: Record<string, Record<string, ChecklistItemStatus>>;
};

function readStore(): BlueprintStore {
  return readStudioJson<BlueprintStore>(ADMIN_STUDIO_STORAGE_KEYS.blueprintManager) ?? {};
}

function writeStore(store: BlueprintStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.blueprintManager, store);
}

function mergeBlueprint(seed: BlueprintDefinition, store: BlueprintStore): BlueprintDefinition {
  const override = store.overrides?.[seed.id];
  const ckOverride = store.checklistOverrides?.[seed.id] ?? {};
  const checklist = seed.checklist.map((c) => ({
    ...c,
    status: ckOverride[c.id] ?? c.status,
  }));
  if (!override) return { ...seed, checklist };
  return {
    ...seed,
    ...override,
    identity: { ...seed.identity, ...override.identity },
    checklist,
    versionHistory: override.versionHistory ?? seed.versionHistory,
  };
}

export function exportBlueprintManagerSnapshot() {
  const store = readStore();
  const blueprints = BLUEPRINT_LIBRARY_SEED.map((b) => mergeBlueprint(b, store));
  return { blueprints, source: 'blueprint-manager-local' as const };
}

export function useAdminStudioBlueprintManager() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const blueprints = useMemo(
    () => BLUEPRINT_LIBRARY_SEED.map((b) => mergeBlueprint(b, store)),
    [store, version]
  );

  const getBlueprint = useCallback(
    (id: string) => blueprints.find((b) => b.id === id),
    [blueprints]
  );

  const setBlueprintStatus = useCallback(
    (id: string, status: BlueprintStatus) => {
      const s = readStore();
      const overrides = { ...(s.overrides ?? {}), [id]: { ...(s.overrides?.[id] ?? {}), status } };
      writeStore({ ...s, overrides });
      bump();
    },
    [bump]
  );

  const setChecklistStatus = useCallback(
    (blueprintId: string, itemId: string, status: ChecklistItemStatus) => {
      const s = readStore();
      const checklistOverrides = {
        ...(s.checklistOverrides ?? {}),
        [blueprintId]: { ...(s.checklistOverrides?.[blueprintId] ?? {}), [itemId]: status },
      };
      writeStore({ ...s, checklistOverrides });
      bump();
    },
    [bump]
  );

  const restoreVersion = useCallback(
    (blueprintId: string, versionNum: number) => {
      const s = readStore();
      const seed = BLUEPRINT_LIBRARY_SEED.find((b) => b.id === blueprintId);
      if (!seed) return;
      const note = `RESTORED TO V${versionNum}`;
      const versionHistory = [
        ...((s.overrides?.[blueprintId]?.versionHistory as BlueprintDefinition['versionHistory']) ?? seed.versionHistory),
        { version: versionNum, savedAt: new Date().toISOString().slice(0, 10), note, snapshot: `restore-v${versionNum}` },
      ];
      const overrides = {
        ...(s.overrides ?? {}),
        [blueprintId]: { ...(s.overrides?.[blueprintId] ?? {}), versionHistory },
      };
      writeStore({ ...s, overrides });
      bump();
    },
    [bump]
  );

  const submitForReview = useCallback(
    (id: string) => setBlueprintStatus(id, 'review'),
    [setBlueprintStatus]
  );

  const approveBlueprint = useCallback(
    (id: string) => setBlueprintStatus(id, 'approved'),
    [setBlueprintStatus]
  );

  return {
    blueprints,
    getBlueprint,
    setBlueprintStatus,
    setChecklistStatus,
    restoreVersion,
    submitForReview,
    approveBlueprint,
  };
}
