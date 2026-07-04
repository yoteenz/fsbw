import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from './storage';

const ADMIN_BASE = '/admin';

/** Workspace-aware route helpers — future workspaces inherit same patterns. */
export const STUDIO_OS_ROUTES = {
  entry: `${ADMIN_BASE}/studio-os`,
  create: `${ADMIN_BASE}/studio-os/create`,
  blueprints: `${ADMIN_BASE}/studio-os/blueprints`,
  promotionCenter: `${ADMIN_BASE}/studio-os/promotion-center`,
  workspaceShell: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}`,
  workspaceDashboard: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}/dashboard`,
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
