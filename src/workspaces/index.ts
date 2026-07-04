import { configureWorkspaceRegistry } from '../studio-os-core/workspace/registry';
import { emptyWorkspaceDataAdapter } from '../studio-os-core/workspace/empty-data-adapter';
import type { WorkspaceDataAdapter } from '../studio-os-core/workspace/data-adapter';
import type { WorkspaceId, WorkspaceListItem, WorkspaceSchema } from '../studio-os-core/workspace/types';
import { FRONTAL_SLAYER_WORKSPACE } from './frontal-slayer/config';
import { frontalSlayerDataAdapter } from './frontal-slayer/dataAdapter';
import { SANDBOX_WORKSPACE } from './sandbox/config';
import { FUTURE_BRAND_WORKSPACE } from './future-brand/config';
import { FUTURE_CLIENT_WORKSPACE } from './future-client/config';

const WORKSPACE_REGISTRY: Record<WorkspaceId, WorkspaceSchema> = {
  'frontal-slayer': FRONTAL_SLAYER_WORKSPACE,
  sandbox: SANDBOX_WORKSPACE,
  'future-brand': FUTURE_BRAND_WORKSPACE,
  'future-client': FUTURE_CLIENT_WORKSPACE,
};

const DATA_ADAPTERS: Record<WorkspaceId, WorkspaceDataAdapter> = {
  'frontal-slayer': frontalSlayerDataAdapter,
  sandbox: emptyWorkspaceDataAdapter,
  'future-brand': emptyWorkspaceDataAdapter,
  'future-client': emptyWorkspaceDataAdapter,
};

export const WORKSPACE_IDS = Object.keys(WORKSPACE_REGISTRY) as WorkspaceId[];

export function getWorkspaceById(id: WorkspaceId): WorkspaceSchema | undefined {
  return WORKSPACE_REGISTRY[id];
}

export function listWorkspaces(): WorkspaceListItem[] {
  return WORKSPACE_IDS.map((id) => {
    const ws = WORKSPACE_REGISTRY[id];
    return {
      id: ws.id,
      displayName: ws.displayName,
      brandName: ws.brandName,
      status: ws.status,
      logoSrc: ws.logoSrc,
      studioEnabled: ws.studioEnabled,
      metadata: ws.metadata,
    };
  });
}

export function getWorkspaceDataAdapter(workspaceId: WorkspaceId): WorkspaceDataAdapter {
  return DATA_ADAPTERS[workspaceId] ?? emptyWorkspaceDataAdapter;
}

export function isKnownWorkspaceId(id: string): id is WorkspaceId {
  return id in WORKSPACE_REGISTRY;
}

configureWorkspaceRegistry({
  getWorkspaceById,
  getWorkspaceDataAdapter,
  isKnownWorkspaceId,
  listWorkspaces,
});
