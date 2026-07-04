import { configureWorkspaceRegistry } from '../studio-os-core/workspace/registry';
import { emptyWorkspaceDataAdapter } from '../studio-os-core/workspace/empty-data-adapter';
import type { WorkspaceDataAdapter } from '../studio-os-core/workspace/data-adapter';
import type { WorkspaceId, WorkspaceListItem, WorkspaceSchema } from '../studio-os-core/workspace/types';
import {
  bootstrapWorkspaceCreationEngine,
  listRegistryWorkspaces,
  registryRecordToWorkspaceSchema,
} from '../studio-os-core/workspace-creation';
import {
  bootstrapGrowthProfiles,
  registerOpportunityCatalog,
} from '../studio-os-core/growth-network';
import { buildDemoGrowthStorePatch, OPPORTUNITY_CATALOG } from '../utils/adminStudioGrowthNetworkDemo';
import { readGrowthNetworkStore, writeGrowthNetworkStore } from '../studio-os-core/growth-network/store';
import { bootstrapAiMediaLabs } from './ai-media/labs/bootstrap';
import { bootstrapFrontalSlayerVisionEngine } from './frontal-slayer/vision-engine';
import { FRONTAL_SLAYER_WORKSPACE } from './frontal-slayer/config';
import { frontalSlayerDataAdapter } from './frontal-slayer/dataAdapter';
import { SANDBOX_WORKSPACE } from './sandbox/config';
import { FUTURE_BRAND_WORKSPACE } from './future-brand/config';
import { FUTURE_CLIENT_WORKSPACE } from './future-client/config';

bootstrapWorkspaceCreationEngine();

function bootstrapGrowthNetworkPlatform(): void {
  registerOpportunityCatalog(OPPORTUNITY_CATALOG);
  bootstrapGrowthProfiles();
  const store = readGrowthNetworkStore();
  if (store.registry.length === 0) {
    writeGrowthNetworkStore({ ...store, ...buildDemoGrowthStorePatch() });
  }
}

bootstrapGrowthNetworkPlatform();
bootstrapAiMediaLabs();
bootstrapFrontalSlayerVisionEngine();

const STATIC_WORKSPACE_REGISTRY: Record<WorkspaceId, WorkspaceSchema> = {
  'frontal-slayer': FRONTAL_SLAYER_WORKSPACE,
  sandbox: SANDBOX_WORKSPACE,
  'future-brand': FUTURE_BRAND_WORKSPACE,
  'future-client': FUTURE_CLIENT_WORKSPACE,
};

function buildDynamicRegistry(): Record<WorkspaceId, WorkspaceSchema> {
  const dynamic: Record<WorkspaceId, WorkspaceSchema> = {};
  for (const record of listRegistryWorkspaces()) {
    if (record.id in STATIC_WORKSPACE_REGISTRY) continue;
    dynamic[record.id as WorkspaceId] = registryRecordToWorkspaceSchema(record);
  }
  return dynamic;
}

function getMergedRegistry(): Record<WorkspaceId, WorkspaceSchema> {
  return { ...STATIC_WORKSPACE_REGISTRY, ...buildDynamicRegistry() };
}

const DATA_ADAPTERS: Record<WorkspaceId, WorkspaceDataAdapter> = {
  'frontal-slayer': frontalSlayerDataAdapter,
  sandbox: emptyWorkspaceDataAdapter,
  'future-brand': emptyWorkspaceDataAdapter,
  'future-client': emptyWorkspaceDataAdapter,
};

export const WORKSPACE_IDS = Object.keys(STATIC_WORKSPACE_REGISTRY) as WorkspaceId[];

export function getWorkspaceById(id: WorkspaceId): WorkspaceSchema | undefined {
  return getMergedRegistry()[id];
}

export function listWorkspaces(): WorkspaceListItem[] {
  const merged = getMergedRegistry();
  return Object.keys(merged).map((id) => {
    const ws = merged[id as WorkspaceId];
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
  return id in getMergedRegistry();
}

export function isDynamicWorkspaceId(id: string): boolean {
  return listRegistryWorkspaces().some((w) => w.id === id);
}

configureWorkspaceRegistry({
  getWorkspaceById,
  getWorkspaceDataAdapter,
  isKnownWorkspaceId,
  listWorkspaces,
});
