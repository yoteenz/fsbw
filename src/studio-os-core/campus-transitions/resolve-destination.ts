import { getWorkspaceRegistry } from '../workspace/registry';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../workspace/storage';
import { STUDIO_OS_ROUTES, workspaceStudioModulePath } from '../workspace/routes';

type ResolveOptions = {
  missionControl?: boolean;
  registryById?: Set<string>;
};

/** Resolve destination path after campus arrival — preserves legacy Frontal Slayer routes. */
export function resolveWorkspaceDestinationPath(
  workspaceId: string,
  options: ResolveOptions = {}
): string {
  if (options.missionControl) {
    return workspaceStudioModulePath(workspaceId, 'mission-control');
  }
  if (workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID) {
    return '/admin/studio/mission-control';
  }
  if (workspaceId === 'ai-media') {
    return STUDIO_OS_ROUTES.workspaceDashboard(workspaceId);
  }
  const registry = getWorkspaceRegistry();
  if (registry.isDynamicWorkspaceId?.(workspaceId) || options.registryById?.has(workspaceId)) {
    return STUDIO_OS_ROUTES.workspaceDashboard(workspaceId);
  }
  return STUDIO_OS_ROUTES.workspaceShell(workspaceId);
}
