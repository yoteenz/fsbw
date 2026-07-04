import { useCallback, useMemo, useState } from 'react';
import {
  advancePromotionStage,
  WORKSPACE_BLUEPRINTS,
  buildWorkspaceFromDraft,
  finalizeProvisionedWorkspace,
  getExecutiveTeamForWorkspace,
  getRegistryWorkspaceById,
  listRegistryWorkspaces,
  readWorkspaceCreationStore,
  upsertRegistryWorkspace,
  writeWorkspaceCreationStore,
  type CreateWorkspaceInput,
  type WorkspaceCreationDraft,
  type WorkspaceRegistryRecord,
} from '../studio-os-core/workspace-creation';

export function useWorkspaceCreationEngine() {
  const [storeVersion, setStoreVersion] = useState(0);

  const refresh = useCallback(() => setStoreVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void storeVersion;
    return readWorkspaceCreationStore();
  }, [storeVersion]);

  const workspaces = useMemo(() => listRegistryWorkspaces(), [store]);

  const createWorkspace = useCallback(
    (draft: WorkspaceCreationDraft) => {
      const record = buildWorkspaceFromDraft(draft);
      upsertRegistryWorkspace(record);
      refresh();
      return record;
    },
    [refresh]
  );

  const finalizeWorkspace = useCallback(
    (id: string) => {
      const existing = getRegistryWorkspaceById(id);
      if (!existing) return undefined;
      const finalized = finalizeProvisionedWorkspace(existing);
      upsertRegistryWorkspace(finalized);
      refresh();
      return finalized;
    },
    [refresh]
  );

  const getWorkspace = useCallback((id: string) => getRegistryWorkspaceById(id), [store]);

  const getExecutiveTeam = useCallback(
    (record: WorkspaceRegistryRecord) => getExecutiveTeamForWorkspace(record),
    []
  );

  const advancePromotion = useCallback(
    (itemId: string) => {
      const current = readWorkspaceCreationStore();
      const nextPipeline = current.promotionPipeline.map((item) =>
        item.id === itemId ? advancePromotionStage(item) : item
      );
      writeWorkspaceCreationStore({ ...current, promotionPipeline: nextPipeline });
      refresh();
    },
    [refresh]
  );

  return {
    store,
    workspaces,
    blueprints: WORKSPACE_BLUEPRINTS,
    createWorkspace,
    finalizeWorkspace,
    getWorkspace,
    getExecutiveTeam,
    advancePromotion,
    refresh,
  };
}

export type { CreateWorkspaceInput, WorkspaceCreationDraft, WorkspaceRegistryRecord };
