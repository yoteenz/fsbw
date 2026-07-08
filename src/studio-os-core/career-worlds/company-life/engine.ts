import type { CareerWorldBlueprint } from '../types';
import type { CareerWorldState } from '../core/schemas';

export function tickCompanyLife(
  state: CareerWorldState,
  blueprint: CareerWorldBlueprint,
  days: number
): CareerWorldState {
  const growthBoost = state.companyGrowthIndex * 0.01 * days;
  const openJobs =
    state.openJobs.length < 5 && Math.random() > 0.6
      ? [
          ...state.openJobs,
          {
            id: `${blueprint.slug}-job-${Date.now()}`,
            title: `${blueprint.profession} Specialist`,
            company: `${blueprint.profession} Studio ${state.simulatedWeek}`,
            district: blueprint.canonicalDistricts[1] ?? blueprint.canonicalDistricts[0] ?? 'Central',
            postedDay: state.simulatedDay,
            urgency: 'medium' as const,
          },
        ]
      : state.openJobs;

  const activeProjects =
    state.activeProjects.length < 3 && Math.random() > 0.55
      ? [
          ...state.activeProjects,
          {
            id: `project-${Date.now()}`,
            name: `${blueprint.profession} engagement`,
            client: blueprint.clientArchetypes[0] ?? 'New client',
            status: 'active' as const,
            dueDay: state.simulatedDay + 7,
          },
        ]
      : state.activeProjects;

  return {
    ...state,
    companyGrowthIndex: Math.min(1, state.companyGrowthIndex + growthBoost),
    openJobs: openJobs.slice(-8),
    activeProjects: activeProjects.slice(-6),
  };
}
