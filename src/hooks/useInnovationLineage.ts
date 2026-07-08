import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildInnovationHistorianExhibitLines,
  buildInnovationHistorianLegacyLines,
  buildInnovationHistorianWelcomeLines,
  ensureOrganizationInnovationLineageProfile,
  STUDIO_OS_INNOVATION_LINEAGE_UPDATED,
  type InnovationHistorianLine,
  type OrganizationInnovationLineageProfile,
} from '../studio-os-core/innovation-lineage';

export function useInnovationLineage() {
  const { workspaceId } = useWorkspace();
  const orgId = workspaceId ?? 'frontal-slayer';

  const [profile, setProfile] = useState<OrganizationInnovationLineageProfile>(() =>
    ensureOrganizationInnovationLineageProfile(orgId)
  );
  const [historianLines, setHistorianLines] = useState<InnovationHistorianLine[]>(() =>
    buildInnovationHistorianWelcomeLines()
  );
  const [activeExhibitId, setActiveExhibitId] = useState<string | null>(
    () => profile.galleryExhibits[0]?.id ?? null
  );

  const refresh = useCallback(() => {
    const next = ensureOrganizationInnovationLineageProfile(orgId);
    setProfile(next);
    return next;
  }, [orgId]);

  const focusExhibit = useCallback(
    (exhibitId: string) => {
      setActiveExhibitId(exhibitId);
      const exhibit = profile.galleryExhibits.find((e) => e.id === exhibitId);
      if (exhibit) setHistorianLines(buildInnovationHistorianExhibitLines(exhibit));
    },
    [profile.galleryExhibits]
  );

  const focusLegacy = useCallback(() => {
    setHistorianLines(buildInnovationHistorianLegacyLines(profile.founderLegacy));
  }, [profile.founderLegacy]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_INNOVATION_LINEAGE_UPDATED, onUpdate);
    return () => window.removeEventListener(STUDIO_OS_INNOVATION_LINEAGE_UPDATED, onUpdate);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [orgId, refresh]);

  const activeExhibit =
    profile.galleryExhibits.find((e) => e.id === activeExhibitId) ?? profile.galleryExhibits[0] ?? null;

  return {
    profile,
    historianLines,
    activeExhibit,
    focusExhibit,
    focusLegacy,
    refresh,
  };
}
