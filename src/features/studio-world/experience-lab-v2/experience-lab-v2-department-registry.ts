/**
 * Studio World departments — generation selectors for BUILD STUDIO WORLD program.
 */

import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';

export type StudioWorldDepartmentId =
  | 'experience-lab'
  | 'creative-director-studio'
  | 'asset-manufacturing'
  | 'permit-center'
  | 'marketplace'
  | 'command-center'
  | 'executive-atrium'
  | 'institute';

export type StudioWorldDepartmentEntry = {
  id: StudioWorldDepartmentId;
  label: string;
  /** Maps to canonical department when generating workspace context. */
  canonicalDepartmentId: CanonicalMainDepartmentId;
  /** Page-aware program actions profile injected downstream. */
  programActionsProfile: string;
};

export const STUDIO_WORLD_DEPARTMENT_REGISTRY: StudioWorldDepartmentEntry[] = [
  {
    id: 'experience-lab',
    label: 'EXPERIENCE LAB',
    canonicalDepartmentId: 'experience-lab',
    programActionsProfile: 'studio-world-generation',
  },
  {
    id: 'creative-director-studio',
    label: 'CREATIVE DIRECTOR STUDIO',
    canonicalDepartmentId: 'creative-director-studio',
    programActionsProfile: 'creative-approval',
  },
  {
    id: 'asset-manufacturing',
    label: 'ASSET MANUFACTURING',
    canonicalDepartmentId: 'animation-studio',
    programActionsProfile: 'asset-generation',
  },
  {
    id: 'permit-center',
    label: 'PERMIT OFFICE',
    canonicalDepartmentId: 'permit-center',
    programActionsProfile: 'permit-governance',
  },
  {
    id: 'marketplace',
    label: 'MARKETPLACE',
    canonicalDepartmentId: 'marketplace',
    programActionsProfile: 'package-publishing',
  },
  {
    id: 'command-center',
    label: 'COMMAND CENTER',
    canonicalDepartmentId: 'command-center',
    programActionsProfile: 'executive-bridge',
  },
  {
    id: 'executive-atrium',
    label: 'EXECUTIVE ATRIUM',
    canonicalDepartmentId: 'command-center',
    programActionsProfile: 'executive-arrival',
  },
  {
    id: 'institute',
    label: 'INSTITUTE',
    canonicalDepartmentId: 'observatory',
    programActionsProfile: 'institute-learning',
  },
];

export function listStudioWorldDepartments(): StudioWorldDepartmentEntry[] {
  return STUDIO_WORLD_DEPARTMENT_REGISTRY;
}

export function resolveStudioWorldDepartment(
  id: StudioWorldDepartmentId | null | undefined
): StudioWorldDepartmentEntry | undefined {
  if (!id) return undefined;
  return STUDIO_WORLD_DEPARTMENT_REGISTRY.find((d) => d.id === id);
}

export function defaultStudioWorldDepartmentId(): StudioWorldDepartmentId {
  return 'experience-lab';
}
