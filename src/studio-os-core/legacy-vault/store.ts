import {
  LEGACY_VAULT_STORAGE_KEY,
  LEGACY_VAULT_VERSION,
  STUDIO_OS_LEGACY_VAULT_UPDATED,
  TIME_CAPSULE_TRIGGER_LABELS,
} from './constants';
import { detectPreserveMoments } from './moment-detector';
import { buildOrganizationLegacyVaultProfile } from './vault-builder';
import type {
  FamilyLegacyEntry,
  FounderArchiveEntry,
  LegacyArchiveEntry,
  LegacyVaultStore,
  OrganizationLegacyVaultProfile,
  TimeCapsule,
  TimeCapsuleTrigger,
} from './types';

function emptyStore(): LegacyVaultStore {
  return { version: LEGACY_VAULT_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_LEGACY_VAULT_UPDATED));
  }
}

export function readLegacyVaultStore(): LegacyVaultStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LEGACY_VAULT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LegacyVaultStore;
    return { ...emptyStore(), ...parsed, version: LEGACY_VAULT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeLegacyVaultStore(store: LegacyVaultStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LEGACY_VAULT_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationLegacyVaultProfile(organizationId: string): OrganizationLegacyVaultProfile | null {
  return readLegacyVaultStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationLegacyVaultProfile): OrganizationLegacyVaultProfile {
  const store = readLegacyVaultStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeLegacyVaultStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncLegacyVaultFromSources(organizationId: string): OrganizationLegacyVaultProfile {
  const existing = getOrganizationLegacyVaultProfile(organizationId);
  const profile = buildOrganizationLegacyVaultProfile(organizationId, existing);
  return upsertProfile({
    ...profile,
    founderArchive: existing?.founderArchive ?? [],
    familyLegacy: existing?.familyLegacy ?? [],
    timeCapsules: existing?.timeCapsules ?? [],
    pendingPreserveSuggestions: existing?.pendingPreserveSuggestions ?? [],
  });
}

export function ensureOrganizationLegacyVaultProfile(organizationId: string): OrganizationLegacyVaultProfile {
  return syncLegacyVaultFromSources(organizationId);
}

export function preserveLegacyMoment(
  organizationId: string,
  title: string,
  summary: string,
  category: LegacyArchiveEntry['category']
): LegacyArchiveEntry {
  const profile = ensureOrganizationLegacyVaultProfile(organizationId);
  const entry: LegacyArchiveEntry = {
    id: `archive-manual-${Date.now()}`,
    category,
    title,
    summary,
    preservedAt: new Date().toISOString(),
    sourceModule: 'manual',
    version: 1,
    immutable: true,
  };

  upsertProfile({
    ...profile,
    archiveEntries: [entry, ...profile.archiveEntries].slice(0, 50),
    totalArchiveEntries: profile.totalArchiveEntries + 1,
    updatedAt: new Date().toISOString(),
    legacyDepthScore: Math.min(98, profile.legacyDepthScore + 3),
  });

  return entry;
}

export function addFounderArchiveEntry(
  organizationId: string,
  entry: Omit<FounderArchiveEntry, 'id' | 'recordedAt'>
): FounderArchiveEntry {
  const profile = ensureOrganizationLegacyVaultProfile(organizationId);
  const full: FounderArchiveEntry = {
    ...entry,
    id: `founder-${Date.now()}`,
    recordedAt: new Date().toISOString(),
  };

  upsertProfile({
    ...profile,
    founderArchive: [full, ...profile.founderArchive].slice(0, 30),
    founderArchiveCount: profile.founderArchiveCount + 1,
    updatedAt: new Date().toISOString(),
  });

  return full;
}

export function addFamilyLegacyEntry(
  organizationId: string,
  entry: Omit<FamilyLegacyEntry, 'id' | 'recordedAt'>
): FamilyLegacyEntry {
  const profile = ensureOrganizationLegacyVaultProfile(organizationId);
  const full: FamilyLegacyEntry = {
    ...entry,
    id: `family-${Date.now()}`,
    recordedAt: new Date().toISOString(),
  };

  upsertProfile({
    ...profile,
    familyLegacy: [full, ...profile.familyLegacy].slice(0, 20),
    updatedAt: new Date().toISOString(),
  });

  return full;
}

export function createTimeCapsule(
  organizationId: string,
  title: string,
  trigger: TimeCapsuleTrigger,
  contents: string[],
  founderMessage?: string
): TimeCapsule {
  const profile = ensureOrganizationLegacyVaultProfile(organizationId);
  const capsule: TimeCapsule = {
    id: `capsule-${Date.now()}`,
    title,
    trigger,
    sealedAt: new Date().toISOString(),
    status: 'sealed',
    contents,
    founderMessage,
    openAt: TIME_CAPSULE_TRIGGER_LABELS[trigger],
  };

  upsertProfile({
    ...profile,
    timeCapsules: [capsule, ...profile.timeCapsules].slice(0, 15),
    timeCapsulesSealed: profile.timeCapsulesSealed + 1,
    updatedAt: new Date().toISOString(),
  });

  return capsule;
}

export function queuePreserveMomentSuggestion(
  organizationId: string,
  input: string
): OrganizationLegacyVaultProfile | null {
  const suggestion = detectPreserveMoments(input);
  if (!suggestion) return null;

  const profile = ensureOrganizationLegacyVaultProfile(organizationId);
  return upsertProfile({
    ...profile,
    pendingPreserveSuggestions: [suggestion, ...profile.pendingPreserveSuggestions].slice(0, 10),
  });
}

export function dismissPreserveSuggestion(organizationId: string, suggestionId: string): void {
  const profile = getOrganizationLegacyVaultProfile(organizationId);
  if (!profile) return;

  upsertProfile({
    ...profile,
    pendingPreserveSuggestions: profile.pendingPreserveSuggestions.filter((s) => s.id !== suggestionId),
  });
}
