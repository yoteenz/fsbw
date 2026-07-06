import type { WorkspaceCreationEngineStore, WorkspaceRegistryRecord } from './types';
import {
  readStudioOsJson,
  writeStudioOsJson,
} from '../../utils/studioOsBrowserStorage';
import { createDefaultPromotionPipeline } from './promotionPipeline';
import {
  buildAiMediaPilotDraft,
  buildWorkspaceFromDraft,
  finalizeProvisionedWorkspace,
} from './engine';

export const WORKSPACE_REGISTRY_STORAGE_KEY = 'studioOs_workspaceRegistry_v1';

function emptyStore(): WorkspaceCreationEngineStore {
  return {
    workspaces: [],
    blueprintVersions: [],
    promotionPipeline: createDefaultPromotionPipeline(),
    seededPilotWorkspaceIds: [],
  };
}

export function readWorkspaceCreationStore(): WorkspaceCreationEngineStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const parsed = readStudioOsJson(WORKSPACE_REGISTRY_STORAGE_KEY, emptyStore);
    return {
      ...emptyStore(),
      ...parsed,
      workspaces: parsed.workspaces ?? [],
      promotionPipeline: parsed.promotionPipeline?.length
        ? parsed.promotionPipeline
        : createDefaultPromotionPipeline(),
    };
  } catch {
    return emptyStore();
  }
}

export function writeWorkspaceCreationStore(store: WorkspaceCreationEngineStore): void {
  if (typeof window === 'undefined') return;
  writeStudioOsJson(WORKSPACE_REGISTRY_STORAGE_KEY, store);
}

export function listRegistryWorkspaces(): WorkspaceRegistryRecord[] {
  return readWorkspaceCreationStore().workspaces;
}

export function getRegistryWorkspaceById(id: string): WorkspaceRegistryRecord | undefined {
  return listRegistryWorkspaces().find((w) => w.id === id || w.slug === id);
}

export function upsertRegistryWorkspace(record: WorkspaceRegistryRecord): WorkspaceRegistryRecord {
  const store = readWorkspaceCreationStore();
  const idx = store.workspaces.findIndex((w) => w.id === record.id);
  const next = [...store.workspaces];
  if (idx >= 0) next[idx] = record;
  else next.push(record);
  writeWorkspaceCreationStore({ ...store, workspaces: next });
  return record;
}

export function ensureAiMediaPilotWorkspace(): WorkspaceRegistryRecord {
  const store = readWorkspaceCreationStore();
  const existing = store.workspaces.find((w) => w.slug === 'ai-media');
  if (existing) return existing;

  const draft = buildAiMediaPilotDraft();
  const provisioned = finalizeProvisionedWorkspace(buildWorkspaceFromDraft(draft));
  const nextStore: WorkspaceCreationEngineStore = {
    ...store,
    workspaces: [...store.workspaces, provisioned],
    seededPilotWorkspaceIds: [...new Set([...store.seededPilotWorkspaceIds, provisioned.id])],
  };
  writeWorkspaceCreationStore(nextStore);
  return provisioned;
}

/** Call once at platform bootstrap — provisions AI Media through the creation engine. */
export function bootstrapWorkspaceCreationEngine(): void {
  ensureAiMediaPilotWorkspace();
}
