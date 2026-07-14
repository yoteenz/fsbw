/**
 * Studio World permission model — Experience Lab is admin infrastructure only.
 * Founders customize approved headquarters in Creative Director Studio.
 */

import { canAccessStudioAdministration } from '../application/portfolio-access';

export const STUDIO_WORLD_PERMISSION_MODEL_VERSION = 'studio-world-permissions.v1' as const;

export type StudioWorldPrincipalRole = 'studio-world-admin' | 'founder';

/** Departments and tools reserved for Studio World platform operators. */
export const STUDIO_WORLD_ADMIN_INFRASTRUCTURE_IDS = [
  'experience-lab',
  'blueprint-author',
  'industry-pack-registry',
  'canonical-department-registry',
  'construction-planning',
  'world-compiler',
  'ai-workforce',
  'permit-system',
  'asset-publishing',
  'marketplace-publishing',
] as const;

export type StudioWorldAdminInfrastructureId = (typeof STUDIO_WORLD_ADMIN_INFRASTRUCTURE_IDS)[number];

/** Founder-facing creative workspace surfaces. */
export const STUDIO_WORLD_FOUNDER_WORKSPACE_IDS = [
  'creative-director-studio',
  'construction-mode',
  'asset-library',
  'marketplace',
  'property-management',
  'brand-settings',
] as const;

export type StudioWorldFounderWorkspaceId = (typeof STUDIO_WORLD_FOUNDER_WORKSPACE_IDS)[number];

/** Route prefixes founders must never access — redirect to CDS. */
export const STUDIO_WORLD_ADMIN_ONLY_PATH_PREFIXES = [
  '/admin/studio/experience-lab',
  '/admin/studio/experience-lab-v2',
  '/admin/studio/experience-lab-icon-qa',
  '/admin/studio/experience-lab-icon-crop-editor',
  '/admin/studio/studio-world-icon-grid-calibration',
  '/admin/studio/icon-manufacturing',
  '/admin/studio/studio-world-icon-system',
  '/admin/studio/studio-world-icon-builder',
  '/admin/studio/icon-state-tester',
  '/admin/studio/icon-state-matrix',
] as const;

export const FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH = '/admin/studio/department/creative-direction' as const;

export function resolveStudioWorldPrincipalRole(): StudioWorldPrincipalRole {
  return canAccessStudioAdministration() ? 'studio-world-admin' : 'founder';
}

export function isStudioWorldAdmin(): boolean {
  return resolveStudioWorldPrincipalRole() === 'studio-world-admin';
}

export function canAccessStudioWorldAdminInfrastructure(
  infrastructureId: StudioWorldAdminInfrastructureId
): boolean {
  if (!isStudioWorldAdmin()) return false;
  return STUDIO_WORLD_ADMIN_INFRASTRUCTURE_IDS.includes(infrastructureId);
}

export function canAccessFounderCreativeWorkspace(workspaceId: StudioWorldFounderWorkspaceId): boolean {
  if (isStudioWorldAdmin()) return true;
  return STUDIO_WORLD_FOUNDER_WORKSPACE_IDS.includes(workspaceId);
}

export function isStudioWorldAdminOnlyPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return STUDIO_WORLD_ADMIN_ONLY_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

export function resolveFounderRedirectFromAdminInfrastructure(pathname: string): string {
  if (isStudioWorldAdminOnlyPath(pathname)) {
    return FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH;
  }
  return FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH;
}

export function assertExperienceLabAccess(): { ok: true } | { ok: false; code: string; message: string } {
  if (isStudioWorldAdmin()) return { ok: true };
  return {
    ok: false,
    code: 'EXPERIENCE_LAB_ADMIN_ONLY',
    message:
      'Experience Lab is Studio World internal architecture infrastructure. Founders customize approved headquarters in Creative Director Studio.',
  };
}
