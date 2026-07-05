import { configureWorkspaceRegistry } from '../studio-os-core/workspace/registry';
import { emptyWorkspaceDataAdapter } from '../studio-os-core/workspace/empty-data-adapter';
import type { WorkspaceDataAdapter } from '../studio-os-core/workspace/data-adapter';
import type { WorkspaceId, WorkspaceListItem, WorkspaceSchema } from '../studio-os-core/workspace/types';
import { listRegistryWorkspaces } from '../studio-os-core/workspace-creation/registry';
import { registryRecordToWorkspaceSchema } from '../studio-os-core/workspace-creation/schemaBridge';
import { FRONTAL_SLAYER_WORKSPACE } from './frontal-slayer/config';
import { frontalSlayerDataAdapter } from './frontal-slayer/dataAdapter';
import { SANDBOX_WORKSPACE } from './sandbox/config';
import { FUTURE_BRAND_WORKSPACE } from './future-brand/config';
import { FUTURE_CLIENT_WORKSPACE } from './future-client/config';

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

/** Yield so admin UI can paint before the next heavy seed runs. */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** Heavy demo seeds — call from Studio OS routes only (not on /admin/dashboard). */
export function bootstrapWorkspacesPlatform(): void {
  void (async () => {
    await yieldToMain();

    const { bootstrapWorkspaceCreationEngine } = await import('../studio-os-core/workspace-creation');
    bootstrapWorkspaceCreationEngine();
    await yieldToMain();

    const growthNetwork = await import('../studio-os-core/growth-network');
    const growthDemo = await import('../utils/adminStudioGrowthNetworkDemo');
    const growthStore = await import('../studio-os-core/growth-network/store');
    growthNetwork.registerOpportunityCatalog(growthDemo.OPPORTUNITY_CATALOG);
    growthNetwork.bootstrapGrowthProfiles();
    const store = growthStore.readGrowthNetworkStore();
    if (store.registry.length === 0) {
      growthStore.writeGrowthNetworkStore({ ...store, ...growthDemo.buildDemoGrowthStorePatch() });
    }
    await yieldToMain();

    const labs = await import('./ai-media/labs/bootstrap');
    labs.bootstrapAiMediaLabs();
    await yieldToMain();

    const network = await import('./ai-media/network/bootstrap');
    network.bootstrapAiMediaNetwork();
    await yieldToMain();

    const talent = await import('./ai-media/talent-network/bootstrap');
    talent.bootstrapAiMediaTalentNetwork();
    await yieldToMain();

    const marketplace = await import('./ai-media/marketplace/bootstrap');
    marketplace.bootstrapAiMediaMarketplace();
    await yieldToMain();

    const bme = await import('./ai-media/business-model-engine/bootstrap');
    bme.bootstrapAiMediaBusinessModelEngine();
    await yieldToMain();

    const ecosystem = await import('./ai-media/ecosystem/bootstrap');
    ecosystem.bootstrapAiMediaEcosystem();
    await yieldToMain();

    const governance = await import('./ai-media/governance/bootstrap');
    governance.bootstrapAiMediaGovernance();
    await yieldToMain();

    const studioIntel = await import('./ai-media/studio-intelligence/bootstrap');
    studioIntel.bootstrapAiMediaStudioIntelligence();
    await yieldToMain();

    const simulation = await import('./ai-media/simulation-engine/bootstrap');
    simulation.bootstrapAiMediaSimulationEngine();
    await yieldToMain();

    const ndxbook = await import('./ai-media/ndxbook/bootstrap');
    ndxbook.bootstrapAiMediaNdxbook();
    await yieldToMain();

    const missionControl = await import('./ai-media/ndxbook/mission-control-bootstrap');
    missionControl.bootstrapAiMediaNdxbookMissionControl();
    await yieldToMain();

    const chiefOfStaff = await import('../studio-os-core/chief-of-staff/bootstrap');
    chiefOfStaff.bootstrapChiefOfStaffPlatform();
    await yieldToMain();

    const vision = await import('./frontal-slayer/vision-engine');
    vision.bootstrapFrontalSlayerVisionEngine();
  })();
}
