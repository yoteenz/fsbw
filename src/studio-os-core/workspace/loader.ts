import { getWorkspaceRegistry } from './registry';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from './storage';
import { STUDIO_PLATFORM_WORKSPACE, STUDIO_PLATFORM_WORKSPACE_ID } from '../platform/schema';
import { emptyWorkspaceDataAdapter } from './empty-data-adapter';
import type { WorkspaceDataAdapter } from './data-adapter';
import type { WorkspaceSchema } from './types';

export type LoadedWorkspace = {
  schema: WorkspaceSchema;
  dataAdapter: WorkspaceDataAdapter;
};

export function loadWorkspace(workspaceId: string): LoadedWorkspace | null {
  if (workspaceId === STUDIO_PLATFORM_WORKSPACE_ID) {
    return {
      schema: STUDIO_PLATFORM_WORKSPACE,
      dataAdapter: emptyWorkspaceDataAdapter,
    };
  }

  const registry = getWorkspaceRegistry();
  const id = registry.isKnownWorkspaceId(workspaceId) ? workspaceId : STUDIO_OS_DEFAULT_WORKSPACE_ID;
  const schema = registry.getWorkspaceById(id);
  if (!schema) return null;
  return {
    schema,
    dataAdapter: registry.getWorkspaceDataAdapter(id),
  };
}

/** Resolve module subtitle from active workspace config (core-safe accessor). */
export function getWorkspaceModuleSubtitle(
  workspace: WorkspaceSchema,
  moduleId: keyof WorkspaceSchema['moduleCopy']
): string | undefined {
  const copy = workspace.moduleCopy[moduleId];
  if (!copy || typeof copy !== 'object') return undefined;
  return 'subtitle' in copy ? copy.subtitle : undefined;
}

export function getWorkspaceStudioHubSubtitle(workspace: WorkspaceSchema): string {
  return workspace.moduleCopy.studioHub?.subtitle ?? workspace.brandName;
}

export function getWorkspaceStudioHubFooter(workspace: WorkspaceSchema): string {
  return workspace.moduleCopy.studioHub?.dashboardFooter ?? '';
}
