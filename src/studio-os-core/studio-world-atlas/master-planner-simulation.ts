import type { AtlasMasterPlanReservation, AtlasNode, AtlasSimulationResult } from './types';

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Simulation Mode™ — evaluate consequences before generation */
export function simulateMasterPlanPlacement(
  plan: AtlasMasterPlanReservation,
  existingNodes: AtlasNode[]
): AtlasSimulationResult {
  const occupied = existingNodes.filter((n) => !n.isPlanned && n.level <= 3);
  let placementScore = 72;

  const nearest = occupied
    .map((n) => ({
      node: n,
      dist: Math.hypot(n.mapX - plan.mapX, n.mapY - plan.mapY),
    }))
    .sort((a, b) => a.dist - b.dist)[0];

  const dist = nearest?.dist ?? 50;
  if (dist < 8) {
    placementScore -= 22;
  } else if (dist < 15) {
    placementScore -= 8;
  } else if (dist > 35) {
    placementScore -= 12;
  } else {
    placementScore += 8;
  }

  const crowdRisk: AtlasSimulationResult['crowdRisk'] =
    dist < 10 ? 'high' : dist < 18 ? 'medium' : 'low';

  const walkingDelta =
    dist < 12 ? 'Reduces average walking distance by ~12%' : 'Adds ~8% walking distance — consider transit hub';

  const discoverability =
    plan.mapY < 40
      ? 'High discoverability — visible from Executive Atrium sightline'
      : 'Moderate — add observation tower or plaza for visibility';

  const expansionFit =
    plan.category === 'headquarters' || plan.category === 'district'
      ? 'Strong expansion anchor — unlocks adjacent wings in forecast'
      : 'Supports satellite growth — pair with skybridge';

  const aiTraffic =
    plan.category === 'innovation' || plan.category === 'campus'
      ? 'AI concierge traffic increases ~15% — beneficial for Creative Intelligence routing'
      : 'Neutral AI traffic — operations concierges redistribute evenly';

  const navigationImpact =
    crowdRisk === 'high'
      ? 'Navigation bottleneck risk near existing flagship — add secondary entrance'
      : 'Navigation flow remains balanced — primary paths clear';

  const entranceRecommendation =
    crowdRisk !== 'low' ? 'Add glass atrium entrance facing Command Center plaza' : undefined;

  if (plan.amenities?.includes('transit-hub')) placementScore += 6;
  if (plan.amenities?.includes('plaza')) placementScore += 4;
  if (plan.amenities?.includes('skybridge')) placementScore += 5;

  placementScore = clampScore(placementScore);

  const summary =
    placementScore >= 75
      ? 'Excellent placement — proceed to Concept Blueprint™ with confidence.'
      : placementScore >= 55
        ? 'Viable with adjustments — simulate again after moving district or adding transit.'
        : 'Reconsider placement — crowded or isolated for long-term campus balance.';

  return {
    planId: plan.id,
    navigationImpact,
    crowdRisk,
    entranceRecommendation,
    placementScore,
    aiTrafficImpact: aiTraffic,
    walkingDistanceDelta: walkingDelta,
    discoverability,
    expansionFit,
    summary,
  };
}
