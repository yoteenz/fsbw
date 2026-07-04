import { listRegistryWorkspaces } from '../workspace-creation/registry';
import { GROWTH_NETWORK_STORAGE_KEY, GROWTH_NETWORK_VERSION } from './constants';
import { buildAiMediaGrowthProfile, buildDefaultGrowthProfile } from './profileFactory';
import {
  buildGrowthRecommendations,
  calculateGrowthScore,
  matchOpportunitiesForProfile,
} from './growthEngine';
import type { GrowthNetworkStore, GrowthOpportunity, GrowthProfile } from './types';

function emptyStore(): GrowthNetworkStore {
  return {
    profiles: {},
    registry: [],
    opportunities: [],
    partnerships: [],
    contracts: [],
    revenueStreams: [],
    recommendations: [],
    serviceProviders: [],
    version: GROWTH_NETWORK_VERSION,
  };
}

export function readGrowthNetworkStore(): GrowthNetworkStore {
  if (typeof localStorage === 'undefined') return seedGrowthNetworkStore();
  try {
    const raw = localStorage.getItem(GROWTH_NETWORK_STORAGE_KEY);
    if (!raw) return seedGrowthNetworkStore();
    const parsed = JSON.parse(raw) as GrowthNetworkStore;
    return { ...emptyStore(), ...parsed, version: GROWTH_NETWORK_VERSION };
  } catch {
    return seedGrowthNetworkStore();
  }
}

export function writeGrowthNetworkStore(store: GrowthNetworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(GROWTH_NETWORK_STORAGE_KEY, JSON.stringify(store));
}

export function getGrowthProfile(workspaceId: string): GrowthProfile | undefined {
  return readGrowthNetworkStore().profiles[workspaceId];
}

export function upsertGrowthProfile(profile: GrowthProfile): GrowthProfile {
  const store = readGrowthNetworkStore();
  const scored = { ...profile, growthScore: calculateGrowthScore(profile), updatedAt: new Date().toISOString() };
  const next = { ...store, profiles: { ...store.profiles, [profile.workspaceId]: scored } };
  writeGrowthNetworkStore(next);
  return scored;
}

/** Seed demo catalog — imported from demo utils at runtime via bootstrap. */
let opportunityCatalog: Omit<GrowthOpportunity, 'workspaceId' | 'matchScore' | 'matchReason'>[] = [];

export function registerOpportunityCatalog(
  catalog: Omit<GrowthOpportunity, 'workspaceId' | 'matchScore' | 'matchReason'>[]
): void {
  opportunityCatalog = catalog;
}

export function refreshOpportunitiesForWorkspace(workspaceId: string): GrowthOpportunity[] {
  const profile = getGrowthProfile(workspaceId);
  if (!profile || opportunityCatalog.length === 0) return [];
  return matchOpportunitiesForProfile(profile, opportunityCatalog);
}

export function bootstrapGrowthProfiles(): void {
  const store = readGrowthNetworkStore();
  const profiles = { ...store.profiles };

  if (!profiles['ai-media']) {
    profiles['ai-media'] = buildAiMediaGrowthProfile();
  }

  for (const ws of listRegistryWorkspaces()) {
    if (!profiles[ws.id]) {
      profiles[ws.id] = buildDefaultGrowthProfile({
        workspaceId: ws.id,
        companyName: ws.name,
        companyType: ws.blueprintId.includes('media') ? 'media-company' : 'startup',
        niche: ws.description.slice(0, 80),
        description: ws.description,
      });
    }
  }

  const nextProfiles: Record<string, GrowthProfile> = {};
  for (const [id, p] of Object.entries(profiles)) {
    nextProfiles[id] = { ...p, growthScore: calculateGrowthScore(p) };
  }

  writeGrowthNetworkStore({ ...store, profiles: nextProfiles });
}

export function seedGrowthNetworkStore(): GrowthNetworkStore {
  bootstrapGrowthProfiles();
  return readGrowthNetworkStore();
}

export function syncRecommendationsForWorkspace(workspaceId: string): void {
  const profile = getGrowthProfile(workspaceId);
  if (!profile) return;
  const store = readGrowthNetworkStore();
  const recs = buildGrowthRecommendations(profile);
  const filtered = store.recommendations.filter((r) => r.workspaceId !== workspaceId);
  writeGrowthNetworkStore({ ...store, recommendations: [...filtered, ...recs] });
}
