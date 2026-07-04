/**
 * Workspace registry injection — core never imports workspace implementations.
 * `src/workspaces/index.ts` registers implementations at module load.
 */

import type { WorkspaceDataAdapter } from './data-adapter';
import type { WorkspaceId, WorkspaceListItem, WorkspaceSchema } from './types';

export type WorkspaceRegistryApi = {
  getWorkspaceById: (id: WorkspaceId) => WorkspaceSchema | undefined;
  getWorkspaceDataAdapter: (id: WorkspaceId) => WorkspaceDataAdapter;
  isKnownWorkspaceId: (id: string) => id is WorkspaceId;
  listWorkspaces: () => WorkspaceListItem[];
};

let workspaceRegistry: WorkspaceRegistryApi | null = null;

export function configureWorkspaceRegistry(api: WorkspaceRegistryApi): void {
  workspaceRegistry = api;
}

export function getWorkspaceRegistry(): WorkspaceRegistryApi {
  if (!workspaceRegistry) {
    throw new Error(
      'StudioOS workspace registry is not configured. Import src/workspaces/index.ts before using workspace APIs.'
    );
  }
  return workspaceRegistry;
}
