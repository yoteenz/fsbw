import { STUDIO_WORLD_ROUTE_REGISTRY } from '../studio-world/route-registry';
import type { OrbExecutiveJourney, OrbPersonalizationProfile, OrbRecommendation } from './types';

function pathFor(routeId: string, fallback: string): string {
  return STUDIO_WORLD_ROUTE_REGISTRY.find((r) => r.id === routeId)?.legacyPath ?? fallback;
}

/** The Executive Journey™ — optimal route the founder can accept or customize. */
export function buildExecutiveJourney(
  recommendations: OrbRecommendation[],
  profile: OrbPersonalizationProfile
): OrbExecutiveJourney {
  const topPaths = recommendations
    .filter((r) => r.targetPath && r.actionable)
    .slice(0, 6);

  const defaultStops = [
    {
      order: 1,
      displayName: 'Executive Atrium™',
      path: '/admin/studio/overview',
      nodeId: 'atlas-flagship-studio-command-center',
      purpose: 'Orient · read Organization Pulse · accept today\'s brief',
    },
    {
      order: 2,
      displayName: 'Marketing Headquarters™',
      path: pathFor('brand-architect', '/admin/headquarters'),
      nodeId: 'hq-marketing-headquarters',
      purpose: 'Clear pending approvals · review overnight generations',
    },
    {
      order: 3,
      displayName: 'Campaign Studio™',
      path: pathFor('campaign-engine', '/admin/studio/campaign-engine'),
      nodeId: 'hq-marketing-headquarters',
      purpose: 'Continue launch-ready campaign assets',
    },
    {
      order: 4,
      displayName: 'Creative Direction Studio™',
      path: pathFor('creative-direction-immersive', '/admin/studio/department/creative-direction'),
      nodeId: 'atlas-flagship-creative-direction-studio',
      purpose: 'Finish Scene Stack · direct Golden Build layers',
    },
    {
      order: 5,
      displayName: 'Story Table™',
      path: pathFor('creative-director', '/admin/studio/creative-director'),
      nodeId: 'cds-story-table',
      purpose: 'Narrative alignment · creative direction decisions',
    },
    {
      order: 6,
      displayName: 'Studio Archives™',
      path: pathFor('studio-archives-entry', '/admin/studio/studio-archives'),
      nodeId: 'atlas-flagship-studio-archives',
      purpose: 'Review Golden Build · archive completed assets',
    },
    {
      order: 7,
      displayName: 'Marketplace Pavilion™',
      path: pathFor('marketplace', '/admin/studio/marketplace'),
      nodeId: 'atlas-flagship-studio-archives',
      purpose: 'Evaluate Genome-matched Blueprint purchase',
    },
    {
      order: 8,
      displayName: 'Executive Atrium™',
      path: '/admin/studio/overview',
      nodeId: 'atlas-flagship-studio-command-center',
      purpose: 'Return · celebrate milestones · plan tomorrow',
    },
  ];

  if (profile.focusMode === 'explorer') {
    defaultStops.splice(2, 0, {
      order: 3,
      displayName: 'Studio World Atlas™',
      path: '/admin/studio/world-atlas',
      nodeId: 'atlas-flagship-studio-command-center',
      purpose: 'Discover hidden landmarks · illuminate recommended routes',
    });
  }

  if (profile.focusMode === 'builder') {
    defaultStops.splice(4, 0, {
      order: 5,
      displayName: 'Asset Factory™',
      path: '/admin/studio/asset-factory',
      nodeId: 'atlas-flagship-creative-direction-studio',
      purpose: 'Queue next department generation',
    });
  }

  const estimatedMinutes = defaultStops.reduce((sum, stop) => {
    const match = topPaths.find((r) => r.targetPath === stop.path);
    return sum + (match?.estimatedMinutes ?? 12);
  }, 0);

  const reasoning =
    profile.focusMode === 'launch'
      ? 'Launch Mode™ — this route prioritizes shipping and approval gates before exploration.'
      : profile.focusMode === 'growth'
        ? 'Growth Mode™ — expansion and headquarters capacity precede creative work today.'
        : 'I\'ve prepared today\'s optimal route based on pending approvals, overnight generations, and your navigation habits.';

  return {
    id: `orb-journey-${new Date().toISOString().slice(0, 10)}`,
    title: 'Today\'s Optimal Route',
    preparedAt: new Date().toISOString(),
    stops: defaultStops.map((s, i) => ({ ...s, order: i + 1 })),
    estimatedMinutes: Math.min(estimatedMinutes, 180),
    reasoning,
  };
}

export function buildJourneyRoadPaths(
  journey: OrbExecutiveJourney,
  nodePositions: Record<string, { x: number; y: number }>
): string[] {
  const paths: string[] = [];
  for (let i = 0; i < journey.stops.length - 1; i++) {
    const from = journey.stops[i];
    const to = journey.stops[i + 1];
    if (!from?.nodeId || !to?.nodeId) continue;
    const a = nodePositions[from.nodeId];
    const b = nodePositions[to.nodeId];
    if (!a || !b) continue;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - 4;
    paths.push(`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`);
  }
  return paths;
}
