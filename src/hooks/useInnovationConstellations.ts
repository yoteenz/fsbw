import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildCosmicGuideConstellationLines,
  buildCosmicGuideFounderLines,
  buildCosmicGuideWelcomeLines,
  ensureOrganizationInnovationConstellationsProfile,
  setActiveConstellationView,
  STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED,
  type ConstellationId,
  type CosmicGuideLine,
  type GalaxyId,
  type OrganizationInnovationConstellationsProfile,
} from '../studio-os-core/innovation-constellations';

export type ConstellationZoom = 'universe' | 'galaxy' | 'constellation';

export function useInnovationConstellations() {
  const { workspaceId } = useWorkspace();
  const orgId = workspaceId ?? 'frontal-slayer';

  const [profile, setProfile] = useState<OrganizationInnovationConstellationsProfile>(() =>
    ensureOrganizationInnovationConstellationsProfile(orgId)
  );
  const [zoom, setZoom] = useState<ConstellationZoom>('constellation');
  const [cosmicLines, setCosmicLines] = useState<CosmicGuideLine[]>(() => buildCosmicGuideWelcomeLines());

  const refresh = useCallback(() => {
    const next = ensureOrganizationInnovationConstellationsProfile(orgId);
    setProfile(next);
    return next;
  }, [orgId]);

  const focusGalaxy = useCallback(
    (galaxyId: GalaxyId) => {
      const updated = setActiveConstellationView(orgId, galaxyId, null) ?? profile;
      setProfile(updated);
      setZoom('galaxy');
      setCosmicLines(buildCosmicGuideWelcomeLines());
    },
    [orgId, profile]
  );

  const focusConstellation = useCallback(
    (constellationId: ConstellationId) => {
      const c = profile.universe.constellations.find((x) => x.id === constellationId);
      if (!c) return;
      const updated = setActiveConstellationView(orgId, c.galaxyId, constellationId) ?? profile;
      setProfile(updated);
      setZoom('constellation');
      setCosmicLines(buildCosmicGuideConstellationLines(c));
    },
    [orgId, profile]
  );

  const focusFounderStar = useCallback(() => {
    setCosmicLines(buildCosmicGuideFounderLines(profile.universe.foundersStar));
    setZoom('universe');
  }, [profile.universe.foundersStar]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED, onUpdate);
    return () => window.removeEventListener(STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED, onUpdate);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [orgId, refresh]);

  const activeConstellation = useMemo(
    () =>
      profile.activeConstellationId
        ? profile.universe.constellations.find((c) => c.id === profile.activeConstellationId) ?? null
        : profile.universe.constellations[0] ?? null,
    [profile]
  );

  const visibleStars = useMemo(() => {
    if (zoom === 'universe') return profile.universe.stars.slice(0, 12);
    if (zoom === 'galaxy') {
      return profile.universe.stars.filter((s) => {
        const c = profile.universe.constellations.find((x) => x.id === s.constellationId);
        return c?.galaxyId === profile.activeGalaxyId;
      });
    }
    return profile.universe.stars.filter((s) => s.constellationId === activeConstellation?.id);
  }, [profile, zoom, activeConstellation]);

  return {
    profile,
    zoom,
    setZoom,
    cosmicLines,
    activeConstellation,
    visibleStars,
    refresh,
    focusGalaxy,
    focusConstellation,
    focusFounderStar,
  };
}
