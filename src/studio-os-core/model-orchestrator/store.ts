import {
  MODEL_ORCHESTRATOR_STORAGE_KEY,
  MODEL_ORCHESTRATOR_VERSION,
  STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED,
} from './constants';
import {
  buildOrganizationModelOrchestratorProfile,
  buildDockOrchestratorLine,
  orchestrateModelRequest,
} from './orchestrator-builder';
import { buildMultiModelRoutes } from './multi-model-router';
import { buildAiSwapEngineLine } from './ai-swap-engine';
import { ORCHESTRATOR_PROVIDER_LABELS } from './constants';
import type { OrganizationModelOrchestratorProfile, ModelOrchestratorStore, RoutingTaskType } from './types';

function emptyStore(): ModelOrchestratorStore {
  return { version: MODEL_ORCHESTRATOR_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED));
  }
}

export function readModelOrchestratorStore(): ModelOrchestratorStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(MODEL_ORCHESTRATOR_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ModelOrchestratorStore;
    return { ...emptyStore(), ...parsed, version: MODEL_ORCHESTRATOR_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeModelOrchestratorStore(store: ModelOrchestratorStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MODEL_ORCHESTRATOR_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationModelOrchestratorProfile(
  organizationId: string
): OrganizationModelOrchestratorProfile | null {
  return readModelOrchestratorStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationModelOrchestratorProfile): OrganizationModelOrchestratorProfile {
  const store = readModelOrchestratorStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeModelOrchestratorStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncModelOrchestratorFromSources(
  organizationId: string
): OrganizationModelOrchestratorProfile {
  return upsertProfile(buildOrganizationModelOrchestratorProfile(organizationId));
}

export function ensureOrganizationModelOrchestratorProfile(
  organizationId: string
): OrganizationModelOrchestratorProfile {
  return syncModelOrchestratorFromSources(organizationId);
}

/** All AI requests flow through Model Orchestrator™ after Studio Intelligence™ */
export function routeThroughModelOrchestrator(
  organizationId: string,
  taskType: RoutingTaskType,
  query: string
): OrganizationModelOrchestratorProfile {
  const profile = syncModelOrchestratorFromSources(organizationId);
  const request = orchestrateModelRequest(organizationId, taskType, query, profile.activeProvider);
  return upsertProfile({
    ...profile,
    recentRequests: [request, ...profile.recentRequests].slice(0, 10),
    updatedAt: new Date().toISOString(),
  });
}

/** AI Swap Engine™ — switch active provider without breaking protected features */
export function swapModelProvider(
  organizationId: string,
  newProvider: OrganizationModelOrchestratorProfile['activeProvider']
): OrganizationModelOrchestratorProfile {
  const profile = syncModelOrchestratorFromSources(organizationId);
  const swapped = {
    ...profile,
    activeProvider: newProvider,
    taskRoutes: buildMultiModelRoutes(organizationId, newProvider),
    aiSwapEngineLine: buildAiSwapEngineLine(ORCHESTRATOR_PROVIDER_LABELS[newProvider]),
    updatedAt: new Date().toISOString(),
  };
  swapped.dockOrchestratorLine = buildDockOrchestratorLine(swapped);
  return upsertProfile(swapped);
}
