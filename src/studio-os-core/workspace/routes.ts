import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from './storage';
import { STUDIO_ADMINISTRATION_ROUTES } from '../application/routes';
import { studioCompanyGrandAtriumPath } from '../company-routes/paths';
import { resolveCompanySlugFromWorkspaceId } from '../company-routes/registry';

const ADMIN_BASE = '/admin';

/** Workspace-aware route helpers — future workspaces inherit same patterns. */
export const STUDIO_OS_ROUTES = {
  entry: STUDIO_ADMINISTRATION_ROUTES.commandCenter,
  commandCenter: STUDIO_ADMINISTRATION_ROUTES.commandCenter,
  registry: STUDIO_ADMINISTRATION_ROUTES.registry,
  create: STUDIO_ADMINISTRATION_ROUTES.create,
  blueprints: STUDIO_ADMINISTRATION_ROUTES.blueprints,
  promotionCenter: STUDIO_ADMINISTRATION_ROUTES.promotionCenter,
  administration: STUDIO_ADMINISTRATION_ROUTES.administration,
  headquartersEntry: `${ADMIN_BASE}/headquarters`,
  workspaceShell: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}`,
  workspaceDashboard: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/dashboard`,
  workspaceNewsroom: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/newsroom`,
  workspaceSettings: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/settings`,
  workspaceAssets: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/assets`,
  workspaceProjects: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/projects`,
  workspaceContentPacks: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/content-packs`,
  workspaceLegacy: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/legacy`,
} as const;

/**
 * Studio module path for active workspace.
 * Frontal Slayer preserves legacy `/admin/studio/*` paths for zero UX regression.
 */
export function workspaceStudioModulePath(workspaceId: string, segment: string): string {
  const clean = segment.replace(/^\//, '');
  if (workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID) {
    return `${ADMIN_BASE}/studio/${clean}`;
  }
  return `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/studio/${clean}`;
}

export function workspaceStudioEntryPath(workspaceId: string, entryPath: string): string {
  if (workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID) {
    return entryPath;
  }
  if (entryPath.includes('/dashboard')) {
    return entryPath;
  }
  return STUDIO_OS_ROUTES.workspaceDashboard(workspaceId);
}

/** Canonical Mission Control / headquarters home for an organization workspace. */
export function resolveOrganizationMissionControlPath(workspaceId: string): string {
  if (workspaceId === 'ai-media') {
    return studioCompanyGrandAtriumPath('ndxbook');
  }
  const slug = resolveCompanySlugFromWorkspaceId(workspaceId);
  return studioCompanyGrandAtriumPath(slug);
}

/**
 * Resolve which organization to launch from admin HEADQUARTERS card / entry route.
 * Headquarters is the host company's executive HQ — not the Studio OS platform tenant
 * and not "resume last portfolio workspace" (that belongs in Command Center / registry).
 */
export function resolveHeadquartersLaunchWorkspaceId(
  assignedWorkspaceId: string | null,
  _lastActiveWorkspaceId?: string | null
): string {
  if (assignedWorkspaceId) return assignedWorkspaceId;
  return STUDIO_OS_DEFAULT_WORKSPACE_ID;
}
