import { getOrganizationInnovationConstellationsProfile } from '../innovation-constellations/store';
import { getOrganizationInnovationLineageProfile } from '../innovation-lineage/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildCommunityExpeditions } from './community-expeditions';
import { buildDemoExpeditionCatalog } from './expedition-catalog';
import { buildLiveExpeditionEvents } from './live-events';
import { computeExpeditionScore } from './rewards-engine';
import type { OrganizationInnovationExpeditionsProfile } from './types';

export function buildDockExpeditionLine(profile: OrganizationInnovationExpeditionsProfile): string {
  const featured = profile.expeditions.find((e) => e.featured);
  if (featured) {
    return `"${featured.title}" awaits — ${featured.stopCount} stops · ${featured.durationMinutes} min guided journey.`;
  }
  return 'Innovation Expeditions™ — learn by walking through real businesses inside Studio World.';
}

export function buildOrganizationInnovationExpeditionsProfile(
  organizationId: string
): OrganizationInnovationExpeditionsProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const lineage = getOrganizationInnovationLineageProfile(organizationId);
  const constellations = getOrganizationInnovationConstellationsProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  const expeditions = buildDemoExpeditionCatalog();
  const communityExpeditions = buildCommunityExpeditions();
  const liveEvents = buildLiveExpeditionEvents();

  const defaultExpedition = expeditions.find((e) => e.id === 'exp-luxury-beauty') ?? expeditions[0];

  const profile: OrganizationInnovationExpeditionsProfile = {
    organizationId,
    companyName,
    updatedAt: new Date().toISOString(),
    expeditionScore: 0,
    expeditions,
    communityExpeditions,
    liveEvents,
    activeExpeditionId: defaultExpedition?.id ?? null,
    activeStopIndex: 0,
    activePathLevel: 'beginner',
    completedExpeditionIds: [],
    unlockedRewards: [],
    dockExpeditionLine: '',
    syncedSources: [
      'innovation-constellations',
      'innovation-lineage',
      'collaborative-innovation-network',
      'global-atlas-layer',
      'studio-world-atlas',
    ],
    guidedKnowledgeNetwork: true,
  };

  const missionCount = expeditions.reduce((s, e) => s + e.missions.length, 0);
  profile.expeditionScore = computeExpeditionScore(
    profile.completedExpeditionIds.length,
    missionCount,
    profile.unlockedRewards.length,
    communityExpeditions.length
  );
  profile.dockExpeditionLine = buildDockExpeditionLine(profile);

  if (lineage) profile.syncedSources.push(`lineage:${lineage.galleryExhibits.length}-exhibits`);
  if (constellations) profile.syncedSources.push(`constellations:${constellations.universe.constellations.length}-constellations`);

  return profile;
}

export function summarizeInnovationExpeditions(profile: OrganizationInnovationExpeditionsProfile): string {
  const featured = profile.expeditions.filter((e) => e.featured).length;
  return [
    `Expedition Score ${profile.expeditionScore}%`,
    `${profile.expeditions.length} expeditions (${featured} featured)`,
    `${profile.completedExpeditionIds.length} completed`,
    `${profile.communityExpeditions.length} community`,
    `${profile.liveEvents.length} live events`,
  ].join(' · ');
}
