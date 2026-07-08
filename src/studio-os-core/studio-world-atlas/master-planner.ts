import type { AtlasMasterPlanReservation } from './types';

function uid(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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
    },
    {
      id: 'plan-innovation-quarter',
      label: 'Innovation Quarter™',
      mapX: 28,
      mapY: 22,
      districtSketch: 'Skybridge connection to Expedition Hub™ · innovation monuments.',
      notes: 'Future Vision mode — no generation until founder approves.',
      reservedAt: new Date(Date.now() - 86_400_000 * 7).toISOString(),
    },
  ];
}

export function reserveMasterPlanLand(
  label: string,
  mapX: number,
  mapY: number,
  notes?: string
): AtlasMasterPlanReservation {
  return {
    id: uid(),
    label,
    mapX,
    mapY,
    notes,
    reservedAt: new Date().toISOString(),
  };
}

export function updateMasterPlanReservation(
  plan: AtlasMasterPlanReservation,
  patch: Partial<Pick<AtlasMasterPlanReservation, 'districtSketch' | 'wingPlan' | 'headquartersPlan' | 'notes' | 'label'>>
): AtlasMasterPlanReservation {
  return { ...plan, ...patch };
}
