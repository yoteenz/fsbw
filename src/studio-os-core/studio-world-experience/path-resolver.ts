/**
 * Resolve Experience Profile™ from immersive route paths.
 */

import { getExperienceProfile } from './profile-registry';

const PATH_TO_DEPARTMENT: Array<{ pattern: RegExp; departmentId: string }> = [
  { pattern: /creative-direction|story-table/i, departmentId: 'creative-direction' },
  { pattern: /studio-archives|studio-warehouse|warehouse/i, departmentId: 'studio-warehouse' },
  { pattern: /world-atlas/i, departmentId: 'world-atlas' },
  { pattern: /world-knowledge|knowledge-engine|knowledge-library/i, departmentId: 'world-knowledge-engine' },
  { pattern: /marketplace/i, departmentId: 'marketplace' },
  { pattern: /museum/i, departmentId: 'museum-wing' },
  { pattern: /overview|command-center|executive/i, departmentId: 'studio-command-center' },
  { pattern: /innovation-district|innovation-constellations|innovation-expeditions|innovation-lineage/i, departmentId: 'studio-warehouse' },
  { pattern: /constitution-hall/i, departmentId: 'studio-command-center' },
  { pattern: /experience-observatory|architecture-observatory/i, departmentId: 'world-atlas' },
];

export function resolveExperienceDepartmentId(pathname: string): string {
  for (const { pattern, departmentId } of PATH_TO_DEPARTMENT) {
    if (pattern.test(pathname)) return departmentId;
  }
  return 'studio-world';
}

export function resolveExperienceProfileForPath(pathname: string) {
  return getExperienceProfile(resolveExperienceDepartmentId(pathname));
}
