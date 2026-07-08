import { listSceneStackStations, resolveStationLayerViews } from '../scene-stack';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';
import type { ExperienceObservatoryMetrics, ExperienceScores } from './types';

const IMMERSIVE_DEPARTMENTS = ['creative-direction', 'studio-warehouse', 'studio-command-center'] as const;

function baseScoreForPattern(pattern: string): number {
  switch (pattern) {
    case 'immersive-live':
      return 78;
    case 'immersive-partial-dashboard':
      return 48;
    case 'scrollable-admin-stage':
      return 22;
    default:
      return 35;
  }
}

function sceneDepthBoost(departmentId: string, projectId: string): number {
  const stations = listSceneStackStations(departmentId);
  if (stations.length === 0) return 0;
  let approved = 0;
  let total = 0;
  for (const s of stations) {
    const views = resolveStationLayerViews(departmentId, projectId, s.stationId);
    total += views.length;
    approved += views.filter((v) => v.status === 'approved').length;
  }
  return total > 0 ? Math.round((approved / total) * 25) : 0;
}

export function evaluateDestinationExperience(projectId = 'default'): {
  scores: ExperienceScores;
  observatory: ExperienceObservatoryMetrics;
} {
  const rows = STUDIO_WORLD_MIGRATION_AUDIT;
  const live = rows.filter((r) => r.currentUiPattern === 'immersive-live').length;
  const partial = rows.filter((r) => r.currentUiPattern === 'immersive-partial-dashboard').length;
  const webpage = rows.filter((r) => r.flaggedAsWebpage).length;
  const total = Math.max(rows.length, 1);

  const avgBase =
    rows.reduce((s, r) => s + baseScoreForPattern(r.currentUiPattern), 0) / total;

  let depthBoost = 0;
  for (const dept of IMMERSIVE_DEPARTMENTS) {
    depthBoost += sceneDepthBoost(dept, projectId);
  }
  depthBoost = Math.min(30, Math.round(depthBoost / IMMERSIVE_DEPARTMENTS.length));

  const immersion = Math.min(100, Math.round(avgBase + depthBoost * 0.6 + (live / total) * 20));
  const wonder = Math.min(100, Math.round(immersion * 0.85 + live * 3));
  const luxury = Math.min(100, Math.round(avgBase * 0.9 + depthBoost * 0.4 - webpage * 0.15));
  const discovery = Math.min(100, Math.round(live * 12 + partial * 4 + depthBoost));
  const cinematic = Math.min(100, Math.round(depthBoost + live * 8 + avgBase * 0.5));
  const flow = Math.min(100, Math.round(100 - webpage * 0.35 - partial * 0.2));
  const delight = Math.min(100, Math.round((wonder + luxury + discovery) / 3));

  const scores: ExperienceScores = {
    immersion,
    wonder,
    luxury,
    emotionalImpact: Math.round((cinematic + wonder) / 2),
    navigationClarity: flow,
    environmentalStorytelling: Math.round((depthBoost + discovery) * 1.2),
    cinematicQuality: cinematic,
    personality: Math.round(luxury * 0.7 + wonder * 0.3),
    senseOfDiscovery: discovery,
    senseOfScale: Math.round(immersion * 0.6 + cinematic * 0.4),
    believability: Math.round(avgBase + depthBoost * 0.5),
    flow,
    replayability: Math.round(discovery * 0.7 + live * 5),
    founderDelight: delight,
    guestDelight: Math.round(delight * 0.92),
    overallMagic: Math.round(
      (immersion + wonder + luxury + delight + cinematic) / 5
    ),
  };

  const observatory: ExperienceObservatoryMetrics = {
    immersionHealth: scores.immersion,
    wonderIndex: scores.wonder,
    luxuryScore: scores.luxury,
    discoveryDensity: scores.senseOfDiscovery,
    sceneVariety: Math.min(100, live * 15 + partial * 5 + 10),
    environmentalDepth: scores.environmentalStorytelling,
    emotionalImpact: scores.emotionalImpact,
    interactionQuality: Math.round((scores.personality + scores.flow) / 2),
    navigationFlow: scores.flow,
    founderDelight: scores.founderDelight,
  };

  return { scores, observatory };
}
