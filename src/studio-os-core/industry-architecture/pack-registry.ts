import { DEPARTMENT_PACKS } from './department-packs';
import { EXPANSION_PACKS } from './expansion-packs';
import type { DepartmentPackDefinition, IndustryId } from './types';

export const ALL_PACKS: DepartmentPackDefinition[] = [...DEPARTMENT_PACKS, ...EXPANSION_PACKS];

export function getPackDefinition(packId: string): DepartmentPackDefinition | undefined {
  return ALL_PACKS.find((p) => p.id === packId);
}

export function listDepartmentPacks(): DepartmentPackDefinition[] {
  return DEPARTMENT_PACKS.filter((p) => p.kind === 'department-pack');
}

export function listExpansionPacks(): DepartmentPackDefinition[] {
  return ALL_PACKS.filter((p) => p.kind === 'expansion-pack');
}

export function listStarterPacksForIndustry(industryId: IndustryId): DepartmentPackDefinition[] {
  return DEPARTMENT_PACKS.filter(
    (p) => p.defaultForIndustries.includes(industryId) || p.id === 'marketing-department'
  );
}

export function listRecommendedExpansionPacks(industryId: IndustryId): DepartmentPackDefinition[] {
  return listExpansionPacks().filter((p) => p.recommendedForIndustries.includes(industryId));
}

export function listFeaturedExpansionPacks(): DepartmentPackDefinition[] {
  return ALL_PACKS.filter((p) => p.featured);
}
