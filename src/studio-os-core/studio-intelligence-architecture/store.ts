import { readFirstEnsure } from '../sync/profile-cache';
import {
  STUDIO_INTELLIGENCE_ARCHITECTURE_STORAGE_KEY,
  STUDIO_INTELLIGENCE_ARCHITECTURE_VERSION,
  STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED,
} from './constants';
import { buildOrganizationStudioIntelligenceArchitectureProfile } from './architecture-builder';
import { processStudioIntelligenceRequest } from './model-gateway';
import type {
  OrganizationStudioIntelligenceArchitectureProfile,
  StudioIntelligenceArchitectureStore,
} from './types';

function emptyStore(): StudioIntelligenceArchitectureStore {
  return { version: STUDIO_INTELLIGENCE_ARCHITECTURE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED));
  }
}

export function readStudioIntelligenceArchitectureStore(): StudioIntelligenceArchitectureStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STUDIO_INTELLIGENCE_ARCHITECTURE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StudioIntelligenceArchitectureStore;
    return { ...emptyStore(), ...parsed, version: STUDIO_INTELLIGENCE_ARCHITECTURE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeStudioIntelligenceArchitectureStore(store: StudioIntelligenceArchitectureStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_INTELLIGENCE_ARCHITECTURE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationStudioIntelligenceArchitectureProfile(
  organizationId: string
): OrganizationStudioIntelligenceArchitectureProfile | null {
  return (
    readStudioIntelligenceArchitectureStore().profiles.find((p) => p.organizationId === organizationId) ?? null
  );
}

function upsertProfile(
  profile: OrganizationStudioIntelligenceArchitectureProfile
): OrganizationStudioIntelligenceArchitectureProfile {
  const store = readStudioIntelligenceArchitectureStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeStudioIntelligenceArchitectureStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncStudioIntelligenceArchitectureFromSources(
  organizationId: string
): OrganizationStudioIntelligenceArchitectureProfile {
  const profile = upsertProfile(buildOrganizationStudioIntelligenceArchitectureProfile(organizationId));
  return profile;
}

export function ensureOrganizationStudioIntelligenceArchitectureProfile(organizationId: string): OrganizationStudioIntelligenceArchitectureProfile {
  return readFirstEnsure(organizationId, getOrganizationStudioIntelligenceArchitectureProfile, syncStudioIntelligenceArchitectureFromSources);
}

export function refreshOrganizationStudioIntelligenceArchitectureProfile(
  organizationId: string
): OrganizationStudioIntelligenceArchitectureProfile {
  return syncStudioIntelligenceArchitectureFromSources(organizationId);
}

/** All AI requests must pass through Studio Intelligence™ — demo gateway entry point */
export function routeStudioIntelligenceRequest(
  organizationId: string,
  query: string
): OrganizationStudioIntelligenceArchitectureProfile {
  const profile = syncStudioIntelligenceArchitectureFromSources(organizationId);
  const request = processStudioIntelligenceRequest(
    organizationId,
    query,
    profile.knowledgeVsReasoningLine,
    profile.contextSourcesReady,
    profile.pipelineSteps.filter((s) => s.status === 'complete').length
  );
  return upsertProfile({
    ...profile,
    recentRequests: [request, ...profile.recentRequests].slice(0, 10),
    updatedAt: new Date().toISOString(),
  });
}
