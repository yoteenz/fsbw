import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { ensureOrganizationArchitectureProfile } from '../studio-os-core/industry-architecture';
import {
  computeAllChapterProgress,
  getActiveServiceSession,
  getNextUnansweredPrompt,
  listPendingFollowUps,
  listPendingServiceNames,
  saveDiscoveryResponse,
  setCurrentChapter,
  startServiceDiscoverySession,
  saveServiceDiscoveryResponse,
  completeServiceDiscoverySession,
  addResourceUpload,
  syncBlueprintFromArchitecture,
  resolveLivingDiscoverySignal,
  type DiscoveryChapterId,
  type OrganizationDiscoveryBlueprint,
} from '../studio-os-core/business-discovery-blueprint';

export function useBusinessDiscoveryBlueprintState() {
  const { workspaceId } = useWorkspace();
  const [blueprint, setBlueprint] = useState<OrganizationDiscoveryBlueprint | null>(null);

  const refresh = useCallback(() => {
    const arch = ensureOrganizationArchitectureProfile(workspaceId);
    const next = syncBlueprintFromArchitecture(workspaceId, arch.industryId);
    setBlueprint(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onBoundary = () => refresh();
    window.addEventListener('studio-os-organization-boundary-changed', onBoundary);
    return () => window.removeEventListener('studio-os-organization-boundary-changed', onBoundary);
  }, [refresh]);

  const chapterProgress = useMemo(
    () => (blueprint ? computeAllChapterProgress(blueprint) : []),
    [blueprint]
  );

  const pendingFollowUps = useMemo(
    () => (blueprint ? listPendingFollowUps(blueprint) : []),
    [blueprint]
  );

  const activeServiceSession = useMemo(
    () => (blueprint ? getActiveServiceSession(blueprint) : null),
    [blueprint]
  );

  const pendingServiceNames = useMemo(
    () => (blueprint ? listPendingServiceNames(blueprint) : []),
    [blueprint]
  );

  const nextPrompt = useMemo(() => {
    if (!blueprint) return null;
    if (blueprint.currentChapterId === 'services') {
      if (!activeServiceSession && pendingServiceNames.length > 0) return null;
      if (activeServiceSession) {
        return getNextUnansweredPrompt(
          { ...blueprint, responses: activeServiceSession.responses },
          'services'
        );
      }
    }
    return getNextUnansweredPrompt(blueprint, blueprint.currentChapterId);
  }, [blueprint, activeServiceSession, pendingServiceNames]);

  const selectChapter = useCallback(
    (chapterId: DiscoveryChapterId) => {
      const next = setCurrentChapter(workspaceId, chapterId);
      setBlueprint(next);
    },
    [workspaceId]
  );

  const answerPrompt = useCallback(
    (promptId: string, chapterId: DiscoveryChapterId, answer: string) => {
      if (activeServiceSession) {
        const next = saveServiceDiscoveryResponse(workspaceId, activeServiceSession.id, {
          promptId,
          chapterId,
          answer,
        });
        setBlueprint(next);
        return;
      }
      const next = saveDiscoveryResponse(workspaceId, { promptId, chapterId, answer });
      setBlueprint(next);
    },
    [workspaceId, activeServiceSession]
  );

  const beginServiceSession = useCallback(
    (serviceName: string) => {
      const next = startServiceDiscoverySession(workspaceId, serviceName);
      setBlueprint(next);
    },
    [workspaceId]
  );

  const finishServiceSession = useCallback(() => {
    if (!activeServiceSession) return;
    const next = completeServiceDiscoverySession(workspaceId, activeServiceSession.id);
    setBlueprint(next);
  }, [workspaceId, activeServiceSession]);

  const uploadResource = useCallback(
    (fileName: string, category: string, note?: string) => {
      const next = addResourceUpload(workspaceId, { fileName, category, note });
      setBlueprint(next);
    },
    [workspaceId]
  );

  const dismissLivingSignal = useCallback(
    (signalId: string) => {
      const next = resolveLivingDiscoverySignal(workspaceId, signalId);
      setBlueprint(next);
    },
    [workspaceId]
  );

  return {
    blueprint,
    chapterProgress,
    pendingFollowUps,
    activeServiceSession,
    pendingServiceNames,
    nextPrompt,
    refresh,
    selectChapter,
    answerPrompt,
    beginServiceSession,
    finishServiceSession,
    uploadResource,
    dismissLivingSignal,
  };
}
