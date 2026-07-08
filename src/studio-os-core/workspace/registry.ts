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
  /** True when workspace was provisioned via Workspace Creation Engine (not static registry). */
  isDynamicWorkspaceId?: (id: string) => boolean;
  /** Organization-specific vision engine bootstrap — core never imports workspace folders. */
  bootstrapVisionEngine?: (workspaceId: string) => void;
};

let workspaceRegistry: WorkspaceRegistryApi | null = null;

export function isWorkspaceRegistryConfigured(): boolean {
  return workspaceRegistry !== null;
}

export function configureWorkspaceRegistry(api: WorkspaceRegistryApi): void {
  workspaceRegistry = api;
}

export function getWorkspaceRegistry(): WorkspaceRegistryApi {
  if (!workspaceRegistry) {
    throw new Error(
      'studio os workspace registry is not configured. Import src/workspaces/index.ts before using workspace APIs.'
    );
  }
  return workspaceRegistry;
}
