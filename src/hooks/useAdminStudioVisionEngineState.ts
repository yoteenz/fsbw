import { useCallback, useMemo, useState } from 'react';
import { getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import {
  createVisionShareLink,
  getVisionModeById,
  queueVisionRecorderJob,
  readVisionEngineStore,
  upsertCustomVisionMode,
} from '../studio-os-core/vision-engine/store';
import type { VisionModeDefinition, VisionShareLink } from '../studio-os-core/vision-engine/types';

export function useAdminStudioVisionEngineState() {
  const workspaceId = getRuntimeActiveWorkspaceId();
  const [storeVersion, bumpStore] = useState(0);

  const store = useMemo(() => {
    void storeVersion;
    return readVisionEngineStore();
  }, [storeVersion]);

  const manifest = store.manifests[workspaceId];
  const modes = manifest?.modes ?? [];
  const shareLinks = store.shareLinks.filter((l) => l.workspaceId === workspaceId);
  const recorderJobs = store.recorderJobs.filter((j) => j.workspaceId === workspaceId);
  const analytics = store.analytics;

  const refresh = useCallback(() => bumpStore((v) => v + 1), []);

  const saveCustomMode = useCallback(
    (mode: VisionModeDefinition) => {
      upsertCustomVisionMode(mode);
      refresh();
    },
    [refresh]
  );

  const createShareLink = useCallback(
    (input: Omit<VisionShareLink, 'id' | 'views' | 'createdAt'>) => {
      const link = createVisionShareLink(input);
      refresh();
      return link;
    },
    [refresh]
  );

  const queueRecorder = useCallback(
    (modeId: string) => {
      queueVisionRecorderJob({
        modeId,
        workspaceId,
        outputFormats: ['mp4-16-9', 'mp4-9-16'],
        outputTypes: ['creative-partner-film', 'social-reel'],
      });
      refresh();
    },
    [refresh, workspaceId]
  );

  const getMode = useCallback(
    (modeId: string) => getVisionModeById(modeId, workspaceId),
    [workspaceId]
  );

  return {
    workspaceId,
    manifest,
    modes,
    shareLinks,
    recorderJobs,
    analytics,
    saveCustomMode,
    createShareLink,
    queueRecorder,
    getMode,
    refresh,
  };
}
