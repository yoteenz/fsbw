import {
  CONSTELLATION_LABELS,
  GALAXY_LABELS,
} from './constants';
import { influenceBrightness, influenceLabel, resolveStarInfluenceTier, shouldPromoteToSun } from './star-influence';
import type {
  ConstellationId,
  GalaxyId,
  InnovationConstellation,
  InnovationGalaxy,
  InnovationStar,
  InnovationUniverse,
  MarketplaceConstellationContext,
  SolarSystem,
} from './types';
import type { OrganizationInnovationLineageProfile } from '../innovation-lineage/types';

function starFromLineageNode(
  node: { id: string; innovationId: string; title: string; companiesUsing: number; marketplaceBestseller: boolean },
  constellationId: ConstellationId,
  solarSystemId: string,
  mapX: number,
  mapY: number,
  creativeEquity: number,
  descendants: number,
  collaborators: string[]
): InnovationStar {
  const isAnchor = node.marketplaceBestseller && node.companiesUsing >= 15_000;
  const tier = resolveStarInfluenceTier(node.companiesUsing, creativeEquity, isAnchor, isAnchor);
  const level = shouldPromoteToSun(node.companiesUsing, descendants) ? 'sun' : 'star';
  return {
    id: `star-${node.id}`,
    innovationId: node.innovationId,
    title: node.title,
    level,
    influenceTier: tier,
    influenceLabel: influenceLabel(tier),
    brightness: influenceBrightness(tier),
    companiesUsing: node.companiesUsing,
    creativeEquity,
    mapX,
    mapY,
    constellationId,
    solarSystemId,
    descendants,
    collaborators,
    evolving: node.companiesUsing > 1000,
  };
}

export function buildDemoUniverse(
  lineage: OrganizationInnovationLineageProfile | null,
  organizationId: string
): InnovationUniverse {
  const exhibit = lineage?.galleryExhibits[0];
  const graph = exhibit?.graph;
  const equity = exhibit?.equity;

  const stars: InnovationStar[] = [];
  if (graph && equity) {
    graph.nodes.forEach((node, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2;
      stars.push(
        starFromLineageNode(
          node,
          'customer-experience',
          'ss-hq-family',
          50 + Math.cos(angle) * 28,
          50 + Math.sin(angle) * 22,
          equity.creativeEquity,
          graph.edges.filter((e) => e.fromNodeId === node.id || e.toNodeId === node.id).length,
          exhibit.collaborators
        )
      );
    });
  } else {
    stars.push(
      starFromLineageNode(
        { id: 'demo', innovationId: 'INNOV-DEMO', title: 'Founder Blueprint™', companiesUsing: 420, marketplaceBestseller: false },
        'luxury-beauty',
        'ss-blueprint',
        45,
        55,
        55,
        0,
        ['Founder']
      )
    );
  }

  const solarSystems: SolarSystem[] = [
    { id: 'ss-hq-family', title: 'Headquarters Family™', familyKind: 'headquarters', starIds: stars.filter((s) => s.solarSystemId === 'ss-hq-family').map((s) => s.id), constellationId: 'customer-experience' },
    { id: 'ss-blueprint', title: 'Blueprint Family™', familyKind: 'blueprints', starIds: stars.filter((s) => s.solarSystemId === 'ss-blueprint').map((s) => s.id), constellationId: 'luxury-beauty' },
    { id: 'ss-workflow', title: 'Workflow Family™', familyKind: 'workflows', starIds: [], constellationId: 'automation' },
    { id: 'ss-ai', title: 'AI Family™', familyKind: 'ai-families', starIds: [], constellationId: 'ai-operations' },
  ];

  const constellations: InnovationConstellation[] = [
    {
      id: 'customer-experience',
      title: CONSTELLATION_LABELS['customer-experience'],
      galaxyId: 'beauty',
      solarSystemIds: ['ss-hq-family'],
      starCount: stars.filter((s) => s.constellationId === 'customer-experience').length,
      evolutionVelocity: 'rapid',
      mapX: 62,
      mapY: 38,
      influentialStars: stars.filter((s) => s.level === 'sun').map((s) => s.title),
      emergingStars: stars.filter((s) => s.influenceTier === 'blue-star').map((s) => s.title),
      marketplaceLeaders: stars.filter((s) => s.brightness >= 80).map((s) => s.title),
      opportunityGap: 'Luxury operations automation merge',
    },
    {
      id: 'luxury-beauty',
      title: CONSTELLATION_LABELS['luxury-beauty'],
      galaxyId: 'beauty',
      solarSystemIds: ['ss-blueprint'],
      starCount: stars.filter((s) => s.constellationId === 'luxury-beauty').length,
      evolutionVelocity: 'growing',
      mapX: 35,
      mapY: 42,
      influentialStars: ['Luxury Hospitality Blueprint™'],
      emergingStars: [],
      marketplaceLeaders: [],
    },
    {
      id: 'automation',
      title: CONSTELLATION_LABELS.automation,
      galaxyId: 'technology',
      solarSystemIds: ['ss-workflow', 'ss-ai'],
      starCount: 8,
      evolutionVelocity: 'growing',
      mapX: 72,
      mapY: 58,
      influentialStars: ['Automation Operations™'],
      emergingStars: ['Workflow Automation Pack™'],
      marketplaceLeaders: [],
    },
    {
      id: 'hair-industry',
      title: CONSTELLATION_LABELS['hair-industry'],
      galaxyId: 'beauty',
      solarSystemIds: [],
      starCount: 24,
      evolutionVelocity: 'stable',
      mapX: 28,
      mapY: 62,
      influentialStars: ['Scene Stack™ Family'],
      emergingStars: ['Parallel Futures™ concepts'],
      marketplaceLeaders: [],
    },
    {
      id: 'marketing',
      title: CONSTELLATION_LABELS.marketing,
      galaxyId: 'creator-economy',
      solarSystemIds: [],
      starCount: 18,
      evolutionVelocity: 'growing',
      mapX: 48,
      mapY: 72,
      influentialStars: [],
      emergingStars: ['Campaign Studio™ extensions'],
      marketplaceLeaders: [],
    },
    {
      id: 'commerce',
      title: CONSTELLATION_LABELS.commerce,
      galaxyId: 'retail',
      solarSystemIds: [],
      starCount: 31,
      evolutionVelocity: 'stable',
      mapX: 55,
      mapY: 28,
      influentialStars: [],
      emergingStars: [],
      marketplaceLeaders: [],
    },
    {
      id: 'ai-operations',
      title: CONSTELLATION_LABELS['ai-operations'],
      galaxyId: 'technology',
      solarSystemIds: ['ss-ai'],
      starCount: 14,
      evolutionVelocity: 'rapid',
      mapX: 78,
      mapY: 45,
      influentialStars: [],
      emergingStars: ['Joint AI Systems™'],
      marketplaceLeaders: [],
    },
  ];

  const galaxies: InnovationGalaxy[] = (Object.keys(GALAXY_LABELS) as GalaxyId[]).map((id) => ({
    id,
    title: GALAXY_LABELS[id],
    constellationIds: constellations.filter((c) => c.galaxyId === id).map((c) => c.id),
    expansionRate: id === 'beauty' ? 24 : id === 'technology' ? 18 : 12,
    starCount: constellations.filter((c) => c.galaxyId === id).reduce((s, c) => s + c.starCount, 0),
  }));

  void organizationId;

  return {
    title: 'Studio World Universe™',
    galaxies,
    constellations,
    solarSystems,
    stars,
    pathways: [],
    opportunities: [],
    foundersStar: { founderId: '', founderName: '', magnitude: 0, tier: 'blue-star', orbitingAchievements: [], planetarySystems: [], companyWorlds: [], growthRate: 0 },
    livingHistory: [],
  };
}

export function buildMarketplaceConstellationContexts(
  universe: InnovationUniverse,
  lineage: OrganizationInnovationLineageProfile | null
): MarketplaceConstellationContext[] {
  return universe.stars
    .filter((s) => s.brightness >= 50)
    .map((star) => {
      const constellation = universe.constellations.find((c) => c.id === star.constellationId);
      const listing = lineage?.marketplaceInventions.find((l) => l.innovationId === star.innovationId);
      return {
        innovationId: star.innovationId,
        title: star.title,
        constellationTitle: constellation?.title ?? 'Studio World™',
        lineageSummary: listing?.lineageTreeSummary ?? 'Lineage preserved in Innovation Graph™',
        descendants: star.descendants,
        influenceTier: star.influenceTier,
        collaborators: star.collaborators,
        creativeEquity: star.creativeEquity,
        marketplacePerformance: listing?.marketplacePerformanceScore ?? star.brightness,
        estimatedBusinessImpact: listing
          ? `${listing.estimatedTimeSavedHours.toLocaleString()}h saved · $${listing.creativeBudgetSavedUsd.toLocaleString()} budget`
          : `${star.companiesUsing.toLocaleString()} companies`,
      };
    });
}

export function summarizeUniverse(universe: InnovationUniverse): string {
  const totalStars = universe.stars.length;
  const suns = universe.stars.filter((s) => s.level === 'sun').length;
  return `${universe.galaxies.length} galaxies · ${universe.constellations.length} constellations · ${totalStars} stars (${suns} suns) — living knowledge universe`;
}
