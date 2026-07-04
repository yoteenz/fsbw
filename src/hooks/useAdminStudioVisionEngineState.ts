import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import {
  getVisionModeById,
  queueVisionRecorderJob,
  readVisionEngineStore,
  upsertCustomVisionMode,
} from '../studio-os-core/vision-engine/store';
import type { VisionModeDefinition, VisionShareLink } from '../studio-os-core/vision-engine/types';
import {
  createAdminVisionShareLink,
  deleteAdminVisionShareLink,
  fetchAdminVisionShareLinks,
} from '../utils/visionShareApi';

export function useAdminStudioVisionEngineState() {
  const workspaceId = getRuntimeActiveWorkspaceId();
  const [storeVersion, bumpStore] = useState(0);
  const [serverLinks, setServerLinks] = useState<VisionShareLink[]>([]);
  const [shareMigrationRequired, setShareMigrationRequired] = useState(false);
  const [shareLoading, setShareLoading] = useState(true);

  const store = useMemo(() => {
    void storeVersion;
    return readVisionEngineStore();
  }, [storeVersion]);

  const manifest = store.manifests[workspaceId];
  const modes = manifest?.modes ?? [];
  const shareLinks = serverLinks.length > 0 ? serverLinks : store.shareLinks.filter((l) => l.workspaceId === workspaceId);
  const recorderJobs = store.recorderJobs.filter((j) => j.workspaceId === workspaceId);
  const analytics = store.analytics;

  const refresh = useCallback(() => bumpStore((v) => v + 1), []);

  const reloadShareLinks = useCallback(async () => {
    setShareLoading(true);
    try {
      const { links, migrationRequired } = await fetchAdminVisionShareLinks(workspaceId);
      setServerLinks(links);
      setShareMigrationRequired(Boolean(migrationRequired));
    } catch {
      setServerLinks([]);
    } finally {
      setShareLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void reloadShareLinks();
  }, [reloadShareLinks]);

  const saveCustomMode = useCallback(
    (mode: VisionModeDefinition) => {
      upsertCustomVisionMode(mode);
      refresh();
    },
    [refresh]
  );

  const createShareLink = useCallback(
    async (input: Omit<VisionShareLink, 'id' | 'views' | 'createdAt'>) => {
      const link = await createAdminVisionShareLink({
        slug: input.slug,
        modeId: input.modeId,
        workspaceId: input.workspaceId,
        label: input.label,
        password: input.password,
        expiresAt: input.expiresAt,
        autoplay: input.autoplay,
        presenterMode: input.presenterMode,
        selfGuided: input.selfGuided,
      });
      await reloadShareLinks();
      return link;
    },
    [reloadShareLinks]
  );

  const removeShareLink = useCallback(
    async (slug: string) => {
      await deleteAdminVisionShareLink(slug);
      await reloadShareLinks();
    },
    [reloadShareLinks]
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
    shareLoading,
    shareMigrationRequired,
    recorderJobs,
    analytics,
    saveCustomMode,
    createShareLink,
    removeShareLink,
    queueRecorder,
    getMode,
    refresh,
    reloadShareLinks,
  };
}
