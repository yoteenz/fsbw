import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildCollaborationCuratorInnovationLines,
  buildCollaborationCuratorRecommendationLines,
  buildCollaborationCuratorWelcomeLines,
  ensureOrganizationCollaborativeInnovationNetworkProfile,
  publishJointInnovationInStore,
  STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED,
  type CollaborationCuratorLine,
  type OrganizationCollaborativeInnovationNetworkProfile,
  type PublicationVisibility,
} from '../studio-os-core/collaborative-innovation-network';

export function useCollaborativeInnovationNetwork() {
  const { workspaceId } = useWorkspace();
  const orgId = workspaceId ?? 'frontal-slayer';

  const [profile, setProfile] = useState<OrganizationCollaborativeInnovationNetworkProfile>(() =>
    ensureOrganizationCollaborativeInnovationNetworkProfile(orgId)
  );
  const [curatorLines, setCuratorLines] = useState<CollaborationCuratorLine[]>(() =>
    buildCollaborationCuratorWelcomeLines()
  );
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(() => {
    const next = ensureOrganizationCollaborativeInnovationNetworkProfile(orgId);
    setProfile(next);
    return next;
  }, [orgId]);

  const publishInnovation = useCallback(
    async (innovationId: string, visibility: PublicationVisibility) => {
      setPublishing(true);
      try {
        const updated = publishJointInnovationInStore(orgId, innovationId, visibility);
        if (updated) {
          setProfile(updated);
          const record = updated.jointInnovations.find(
            (j) => j.id === innovationId || j.innovationId === innovationId
          );
          if (record) setCuratorLines(buildCollaborationCuratorInnovationLines(record));
        }
        return updated;
      } finally {
        setPublishing(false);
      }
    },
    [orgId]
  );

  const focusRecommendations = useCallback(() => {
    setCuratorLines(buildCollaborationCuratorRecommendationLines(profile.recommendations));
  }, [profile.recommendations]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED, onUpdate);
    return () => window.removeEventListener(STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED, onUpdate);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [orgId, refresh]);

  const pendingInnovation = useMemo(
    () => profile.jointInnovations.find((j) => !j.published) ?? null,
    [profile.jointInnovations]
  );

  return {
    profile,
    curatorLines,
    pendingInnovation,
    publishing,
    refresh,
    publishInnovation,
    focusRecommendations,
  };
}
