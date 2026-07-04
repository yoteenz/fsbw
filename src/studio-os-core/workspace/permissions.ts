import type { WorkspacePermissions, WorkspaceSchema } from './types';

/** Default workspace permissions for admin operators. */
export const DEFAULT_WORKSPACE_PERMISSIONS: WorkspacePermissions = {
  canSwitchWorkspace: true,
  canEditBrand: true,
  canManageUsers: true,
  canAccessStudioModules: true,
};

export function canAccessWorkspaceStudio(workspace: WorkspaceSchema): boolean {
  return workspace.studioEnabled && workspace.permissions.canAccessStudioModules;
}

export function isPlaceholderWorkspace(workspace: WorkspaceSchema): boolean {
  return workspace.status === 'placeholder';
}
