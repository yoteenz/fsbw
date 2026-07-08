import { getOrganizationCollaborativeInnovationNetworkProfile } from '../collaborative-innovation-network/store';
import { getOrganizationInnovationLineageProfile } from '../innovation-lineage/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildAcademicModeViews } from './academic-mode';
import { buildCollaborationPathways } from './collaboration-pathways';
import { buildFoundersStar } from './founders-star';
import { buildLivingHistorySnapshots } from './living-history';
import { buildOpportunityMap } from './opportunity-map';
import { buildDemoUniverse, buildMarketplaceConstellationContexts, summarizeUniverse } from './universe-builder';
import type { ConstellationId, GalaxyId, OrganizationInnovationConstellationsProfile } from './types';

export function computeUniverseScore(
  starCount: number,
  constellationCount: number,
  pathwayStrength: number,
  opportunityFit: number
): number {
  return Math.min(99, 30 + starCount * 2 + constellationCount * 5 + pathwayStrength * 0.2 + opportunityFit);
}

export function buildDockCosmicLine(profile: OrganizationInnovationConstellationsProfile): string {
  const rapid = profile.universe.constellations.filter((c) => c.evolutionVelocity === 'rapid')[0];
  if (rapid) {
    return `${rapid.title} has evolved rapidly — explore ${rapid.starCount} stars in Innovation Constellations™.`;
  }
  const topStar = [...profile.universe.stars].sort((a, b) => b.brightness - a.brightness)[0];
  if (topStar) {
    return `Your "${topStar.title}" is ${topStar.influenceLabel} — navigate the living universe.`;
  }
  return 'Innovation Constellations™ — explore connected ideas, not lists.';
}

export function buildOrganizationInnovationConstellationsProfile(
  organizationId: string
): OrganizationInnovationConstellationsProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const lineage = getOrganizationInnovationLineageProfile(organizationId);
  const cin = getOrganizationCollaborativeInnovationNetworkProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  const universe = buildDemoUniverse(lineage, organizationId);
  universe.pathways = buildCollaborationPathways(organizationId);
  universe.opportunities = buildOpportunityMap();
  universe.livingHistory = buildLivingHistorySnapshots();

  const legacy = lineage?.founderLegacy;
  universe.foundersStar = buildFoundersStar(
    `founder-${organizationId}`,
    'Founder',
    legacy?.companiesHelped ?? 18400,
    legacy?.innovationScore ?? 78,
    legacy?.breakthroughsCreated ?? 3
  );

  const academicViews = buildAcademicModeViews(lineage);
  const marketplaceContexts = buildMarketplaceConstellationContexts(universe, lineage);

  const profile: OrganizationInnovationConstellationsProfile = {
    organizationId,
    companyName,
    updatedAt: new Date().toISOString(),
    universeScore: 0,
    universe,
    activeGalaxyId: 'beauty',
    activeConstellationId: 'customer-experience',
    academicViews,
    marketplaceContexts,
    dockCosmicLine: '',
    syncedSources: [
      'innovation-lineage',
      'collaborative-innovation-network',
      'world-graph',
      'marketplace',
      'global-atlas-layer',
    ],
    permanentKnowledgeUniverse: true,
  };

  const avgPathway = universe.pathways.reduce((s, p) => s + p.strength, 0) / Math.max(1, universe.pathways.length);
  profile.universeScore = computeUniverseScore(
    universe.stars.length,
    universe.constellations.length,
    avgPathway,
    universe.opportunities.filter((o) => o.darkness >= 75).length * 5
  );
  profile.dockCosmicLine = buildDockCosmicLine(profile);

  if (lineage) profile.syncedSources.push(`lineage:${lineage.graphs.length}-graphs`);
  if (cin) profile.syncedSources.push(`cin:${cin.liveCollaborators.length}-collaborators`);

  return profile;
}

export function summarizeInnovationConstellations(
  profile: OrganizationInnovationConstellationsProfile
): string {
  return [
    `Universe Score ${profile.universeScore}%`,
    summarizeUniverse(profile.universe),
    `${profile.universe.opportunities.length} opportunity regions`,
    `${profile.universe.pathways.length} collaboration pathways`,
  ].join(' · ');
}

export function getConstellationById(
  profile: OrganizationInnovationConstellationsProfile,
  id: ConstellationId
) {
  return profile.universe.constellations.find((c) => c.id === id) ?? null;
}

export function getGalaxyById(profile: OrganizationInnovationConstellationsProfile, id: GalaxyId) {
  return profile.universe.galaxies.find((g) => g.id === id) ?? null;
}
