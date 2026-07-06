/** Centralized Studio localStorage keys — single source for Phase 2 scaling. */

import { scopeStorageKey, getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import {
  readStudioOsStorageValue,
  removeStudioOsStorageValue,
  writeStudioOsJson,
} from './studioOsBrowserStorage';
import {
  hydrateStudioWorkspaceStateFromCloud,
  scheduleStudioWorkspaceStateCloudSave,
} from './studioWorkspaceCloudSync';

export const ADMIN_STUDIO_STORAGE_KEYS = {
  shows: 'adminStudioShowsEditable_v1',
  contentPacks: 'adminStudioContentPacksEditable_v1',
  publishingQueue: 'adminStudioPublishingQueue_v1',
  aiForm: 'adminStudioAiForm_v1',
  promptLibrary: 'adminStudioPromptLibrary_v1',
  promptFavorites: 'adminStudioPromptFavorites_v1',
  contentBrainBrand: 'adminStudioContentBrainBrand_v1',
  contentBrainPsa: 'adminStudioContentBrainPsa_v1',
  contentBrainShowBible: 'adminStudioContentBrainShowBible_v1',
  contentBrainEditorial: 'adminStudioContentBrainEditorial_v1',
  contentBrainPromptFrameworks: 'adminStudioContentBrainPromptFrameworks_v1',
  contentBrainPromptFavorites: 'adminStudioContentBrainPromptFavorites_v1',
  contentBrainCampaigns: 'adminStudioContentBrainCampaigns_v1',
  contentBrainProducts: 'adminStudioContentBrainProducts_v1',
  contentBrainCtas: 'adminStudioContentBrainCtas_v1',
  contentBrainEngine: 'adminStudioContentBrainEngine_v1',
  contentBrainCalendar: 'adminStudioContentBrainCalendar_v1',
  contentBrainApproval: 'adminStudioContentBrainApproval_v1',
  creativeDirector: 'adminStudioCreativeDirector_v1',
  intelligenceEngine: 'adminStudioIntelligenceEngine_v1',
  orchestrator: 'adminStudioOrchestrator_v1',
  showBible: 'adminStudioShowBible_v1',
  showBibleCustom: 'adminStudioShowBibleCustom_v1',
  showBibleChecklist: 'adminStudioShowBibleChecklist_v1',
  studioLot: 'adminStudioStudioLot_v1',
  studioLotCustom: 'adminStudioStudioLotCustom_v1',
  talentAgency: 'adminStudioTalentAgency_v1',
  talentAgencyCustom: 'adminStudioTalentAgencyCustom_v1',
  castingProductions: 'adminStudioCastingProductions_v1',
  castingProductionsCustom: 'adminStudioCastingProductionsCustom_v1',
  castingTalent: 'adminStudioCastingTalent_v1',
  castingWorkflow: 'adminStudioCastingWorkflow_v1',
  production: 'adminStudioProduction_v1',
  productionCustom: 'adminStudioProductionCustom_v1',
  productionQa: 'adminStudioProductionQa_v1',
  aiProductionEngine: 'adminStudioAiProductionEngine_v1',
  aiProductionEngineCustom: 'adminStudioAiProductionEngineCustom_v1',
  distributionNetwork: 'adminStudioDistributionNetwork_v1',
  distributionNetworkCustom: 'adminStudioDistributionNetworkCustom_v1',
  distributionNetworkChannels: 'adminStudioDistributionNetworkChannels_v1',
  audienceBrain: 'adminStudioAudienceBrain_v1',
  growthNetwork: 'adminStudioGrowthNetwork_v1',
  labs: 'adminStudioLabs_v1',
  aiMediaNetwork: 'adminStudioAiMediaNetwork_v1',
  executiveCommandCenter: 'adminStudioExecutiveCommandCenter_v1',
  legacySystem: 'adminStudioLegacySystem_v1',
  assetDirector: 'adminStudioAssetDirector_v1',
  productionBuilder: 'adminStudioProductionBuilder_v1',
  directorMode: 'adminStudioDirectorMode_v1',
  executiveAiDirector: 'adminStudioExecutiveAiDirector_v1',
  campaignOrchestrator: 'adminStudioCampaignOrchestrator_v1',
  missionControl: 'adminStudioMissionControl_v1',
  blueprintManager: 'adminStudioBlueprintManager_v1',
  assetFactory: 'adminStudioAssetFactory_v1',
  knowledgeHub: 'adminStudioKnowledgeHub_v1',
  memoryBible: 'adminStudioMemoryBible_v1',
  productPhotographyBible: 'adminStudioProductPhotographyBible_v1',
  productPhotographyDerivatives: 'adminStudioProductPhotographyDerivatives_v1',
  brandAssetsProductAssetFactory: 'adminStudioBrandAssetsProductAssetFactory_v1',
} as const;

export type AdminStudioStorageKey = (typeof ADMIN_STUDIO_STORAGE_KEYS)[keyof typeof ADMIN_STUDIO_STORAGE_KEYS];

function resolveScopedKey(key: AdminStudioStorageKey): string {
  return scopeStorageKey(key, getRuntimeActiveWorkspaceId());
}

/** Request cloud hydration for workspace-scoped editable module state. */
export function ensureStudioModuleCloudHydration(key: AdminStudioStorageKey): void {
  hydrateStudioWorkspaceStateFromCloud(key, getRuntimeActiveWorkspaceId());
}

export function readStudioJson<T>(key: AdminStudioStorageKey): T | null {
  ensureStudioModuleCloudHydration(key);
  try {
    const scoped = readStudioOsStorageValue(resolveScopedKey(key));
    if (scoped) return JSON.parse(scoped) as T;
    const legacy = readStudioOsStorageValue(key);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as T;
        writeStudioJson(key, parsed);
        return parsed;
      } catch {
        removeStudioOsStorageValue(key);
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStudioJson(key: AdminStudioStorageKey, value: unknown): void {
  writeStudioOsJson(resolveScopedKey(key), value);
  scheduleStudioWorkspaceStateCloudSave(key, value, getRuntimeActiveWorkspaceId());
}

export function patchStudioRecord<T extends Record<string, unknown>>(
  key: AdminStudioStorageKey,
  recordId: string,
  patch: Partial<T>
): void {
  const store = readStudioJson<Record<string, Partial<T>>>(key) ?? {};
  store[recordId] = { ...(store[recordId] ?? {}), ...patch };
  writeStudioJson(key, store);
}
