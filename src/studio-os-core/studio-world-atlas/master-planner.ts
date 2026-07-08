import type {
  AtlasFutureVisionConcept,
  AtlasMasterPlanReservation,
  AtlasPlanFeature,
  AtlasPlanFeatureType,
  MasterPlanLandCategory,
} from './types';
import { estimatePlanBudget } from './master-planner-budget';
import { defaultPlanPhase } from './master-planner-phases';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultMasterPlanReservations(): AtlasMasterPlanReservation[] {
  return [
    {
      id: 'plan-marketing-hq',
      label: 'Marketing Headquarters™',
      mapX: 62,
      mapY: 38,
      districtSketch: 'North campus marketing district — campaign wings radiating from central plaza.',
      wingPlan: 'Campaign Wing™ · Launch Theater™ · Intelligence Wing™',
      headquartersPlan: 'Marketing Headquarters™ with glass atrium facing Command Center.',
      notes: 'Simulate before generation — reserve land only.',
      reservedAt: new Date(Date.now() - 86_400_000 * 14).toISOString(),
      phase: 'concept-blueprint',
      category: 'headquarters',
      amenities: ['plaza', 'transit-hub'],
      budget: estimatePlanBudget({
        id: 'plan-marketing-hq',
        label: 'Marketing Headquarters™',
        mapX: 62,
        mapY: 38,
        reservedAt: '',
        category: 'headquarters',
        amenities: ['plaza', 'transit-hub'],
      }),
    },
    {
      id: 'plan-innovation-quarter',
      label: 'Innovation Quarter™',
      mapX: 28,
      mapY: 22,
      districtSketch: 'Skybridge connection to Expedition Hub™ · innovation monuments.',
      notes: 'Future Vision mode — no generation until founder approves.',
      reservedAt: new Date(Date.now() - 86_400_000 * 7).toISOString(),
      phase: 'reserved-land',
      category: 'innovation',
      amenities: ['skybridge', 'observation-tower'],
    },
  ];
}

export function defaultPlanFeatures(): AtlasPlanFeature[] {
  return [
    {
      id: 'feat-transit-hub',
      type: 'transit-hub',
      label: 'Campus Transit Hub™',
      mapX: 50,
      mapY: 55,
      connectToPlanId: 'plan-marketing-hq',
    },
    {
      id: 'feat-potential-road',
      type: 'road',
      label: 'Potential Boulevard™',
      mapX: 45,
      mapY: 40,
    },
    {
      id: 'feat-plaza',
      type: 'plaza',
      label: 'Central Plaza™',
      mapX: 52,
      mapY: 45,
    },
  ];
}

export function defaultFutureVisionConcepts(): AtlasFutureVisionConcept[] {
  return [
    {
      id: 'vision-prototype-district',
      label: 'Prototype District™',
      description: 'Experimental layout — alternate wing ring without generation commitment.',
      mapX: 40,
      mapY: 65,
      alternativeLayout: 'Radial wings · water feature courtyard · no build until approved',
      createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    },
  ];
}

export function reserveMasterPlanLand(
  label: string,
  mapX: number,
  mapY: number,
  category: MasterPlanLandCategory = 'district',
  notes?: string
): AtlasMasterPlanReservation {
  const plan: AtlasMasterPlanReservation = {
    id: uid('plan'),
    label,
    mapX,
    mapY,
    notes,
    reservedAt: new Date().toISOString(),
    phase: defaultPlanPhase(),
    category,
    amenities: [],
  };
  plan.budget = estimatePlanBudget(plan);
  return plan;
}

export function updateMasterPlanReservation(
  plan: AtlasMasterPlanReservation,
  patch: Partial<
    Pick<
      AtlasMasterPlanReservation,
      | 'districtSketch'
      | 'wingPlan'
      | 'headquartersPlan'
      | 'notes'
      | 'label'
      | 'mapX'
      | 'mapY'
      | 'phase'
      | 'amenities'
      | 'isConcept'
    >
  >
): AtlasMasterPlanReservation {
  const next = { ...plan, ...patch };
  next.budget = estimatePlanBudget(next);
  return next;
}

export function createPlanFeature(
  type: AtlasPlanFeatureType,
  label: string,
  mapX: number,
  mapY: number,
  connectToPlanId?: string
): AtlasPlanFeature {
  return {
    id: uid('feat'),
    type,
    label,
    mapX,
    mapY,
    connectToPlanId,
  };
}

export function createFutureVisionConcept(
  label: string,
  mapX: number,
  mapY: number,
  description: string,
  alternativeLayout?: string
): AtlasFutureVisionConcept {
  return {
    id: uid('vision'),
    label,
    description,
    mapX,
    mapY,
    alternativeLayout,
    createdAt: new Date().toISOString(),
  };
}

/** Clamp map coordinates to holographic table bounds */
export function clampPlanCoords(mapX: number, mapY: number): { mapX: number; mapY: number } {
  return {
    mapX: Math.max(10, Math.min(90, mapX)),
    mapY: Math.max(12, Math.min(88, mapY)),
  };
}

export function buildPotentialRoadPaths(
  plans: AtlasMasterPlanReservation[],
  features: AtlasPlanFeature[],
  anchor: { mapX: number; mapY: number }
): string[] {
  const paths: string[] = [];
  for (const plan of plans) {
    const mx = (anchor.mapX + plan.mapX) / 2;
    const my = (anchor.mapY + plan.mapY) / 2 - 3;
    paths.push(`M ${anchor.mapX} ${anchor.mapY} Q ${mx} ${my} ${plan.mapX} ${plan.mapY}`);
  }
  for (const feat of features.filter((f) => f.type === 'road' || f.type === 'skybridge')) {
    paths.push(`M ${anchor.mapX} ${anchor.mapY} L ${feat.mapX} ${feat.mapY}`);
  }
  return paths;
}
