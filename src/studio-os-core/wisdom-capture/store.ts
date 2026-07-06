import {
  WISDOM_CAPTURE_STORAGE_KEY,
  WISDOM_CAPTURE_VERSION,
  STUDIO_OS_WISDOM_CAPTURE_UPDATED,
} from './constants';
import { buildOrganizationWisdomProfile } from './wisdom-builder';
import {
  computeWisdomDepthScore,
  defaultSyncedTargets,
  syncWisdomToMemoryEngine,
} from './learning-sync';
import { buildSearchableTags, detectWisdomInText } from './wisdom-detector';
import type {
  OrganizationWisdomProfile,
  PendingWisdomDetection,
  WisdomCaptureStore,
  WisdomEntry,
  WisdomLibraryCategory,
} from './types';

function emptyStore(): WisdomCaptureStore {
  return { version: WISDOM_CAPTURE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_WISDOM_CAPTURE_UPDATED));
  }
}

export function readWisdomCaptureStore(): WisdomCaptureStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(WISDOM_CAPTURE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as WisdomCaptureStore;
    return { ...emptyStore(), ...parsed, version: WISDOM_CAPTURE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeWisdomCaptureStore(store: WisdomCaptureStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(WISDOM_CAPTURE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationWisdomProfile(organizationId: string): OrganizationWisdomProfile | null {
  return readWisdomCaptureStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationWisdomProfile): OrganizationWisdomProfile {
  const store = readWisdomCaptureStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeWisdomCaptureStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncWisdomCaptureFromSources(organizationId: string): OrganizationWisdomProfile {
  const existing = getOrganizationWisdomProfile(organizationId);
  const profile = buildOrganizationWisdomProfile(
    organizationId,
    existing?.wisdomLibrary ?? [],
    existing?.pendingDetections ?? []
  );
  return upsertProfile(profile);
}

export function ensureOrganizationWisdomProfile(organizationId: string): OrganizationWisdomProfile {
  const existing = getOrganizationWisdomProfile(organizationId);
  if (existing) return existing;
  return syncWisdomCaptureFromSources(organizationId);
}

export function queueWisdomDetection(organizationId: string, sourceText: string): PendingWisdomDetection | null {
  const detection = detectWisdomInText(sourceText);
  if (!detection) return null;

  const profile = ensureOrganizationWisdomProfile(organizationId);
  const pending: PendingWisdomDetection = {
    id: `pending-${Date.now()}`,
    detectedAt: new Date().toISOString(),
    sourceText,
    extractedWisdom: detection.extractedWisdom,
    triggerPattern: detection.triggerPattern,
    suggestedCategory: detection.suggestedCategory,
    prompt: detection.prompt,
    status: 'pending',
  };

  const pendingDetections = [pending, ...profile.pendingDetections.filter((p) => p.status === 'pending')].slice(0, 10);

  return upsertProfile({
    ...profile,
    pendingDetections,
    wisdomDepthScore: computeWisdomDepthScore(profile.wisdomLibrary.length, pendingDetections.length),
    updatedAt: new Date().toISOString(),
  }).pendingDetections[0];
}

export function preserveWisdomEntry(
  organizationId: string,
  input: {
    wisdom: string;
    whyItMatters?: string;
    category?: WisdomLibraryCategory;
    sourceText?: string;
    capturedBy?: WisdomEntry['capturedBy'];
    pendingId?: string;
  }
): WisdomEntry {
  const profile = ensureOrganizationWisdomProfile(organizationId);
  const category = input.category ?? 'lessons-learned';
  const entry: WisdomEntry = {
    id: `wisdom-${Date.now()}`,
    wisdom: input.wisdom.trim(),
    whyItMatters: input.whyItMatters ?? 'Organizational wisdom — processes explain what; wisdom explains why.',
    category,
    capturedAt: new Date().toISOString(),
    capturedBy: input.capturedBy ?? 'founder',
    sourceText: input.sourceText ?? input.wisdom,
    triggerPattern: input.sourceText ? detectWisdomInText(input.sourceText)?.triggerPattern ?? 'manual' : 'manual',
    searchableTags: buildSearchableTags(input.wisdom, category),
    syncedTo: defaultSyncedTargets(category),
  };

  syncWisdomToMemoryEngine(organizationId, entry);

  const pendingDetections = profile.pendingDetections.map((p) =>
    p.id === input.pendingId ? { ...p, status: 'preserved' as const } : p
  );

  const wisdomLibrary = [entry, ...profile.wisdomLibrary].slice(0, 200);

  upsertProfile(
    buildOrganizationWisdomProfile(organizationId, wisdomLibrary, pendingDetections)
  );

  return entry;
}

export function dismissWisdomDetection(organizationId: string, pendingId: string): void {
  const profile = getOrganizationWisdomProfile(organizationId);
  if (!profile) return;

  const pendingDetections = profile.pendingDetections.map((p) =>
    p.id === pendingId ? { ...p, status: 'dismissed' as const } : p
  );

  upsertProfile({
    ...profile,
    pendingDetections,
    wisdomDepthScore: computeWisdomDepthScore(
      profile.wisdomLibrary.length,
      pendingDetections.filter((p) => p.status === 'pending').length
    ),
    updatedAt: new Date().toISOString(),
  });
}

export function searchOrganizationWisdom(organizationId: string, query: string): WisdomEntry[] {
  const profile = getOrganizationWisdomProfile(organizationId) ?? ensureOrganizationWisdomProfile(organizationId);
  const q = query.trim().toLowerCase();
  if (!q) return profile.wisdomLibrary;
  return profile.wisdomLibrary.filter(
    (e) =>
      e.wisdom.toLowerCase().includes(q) ||
      e.whyItMatters.toLowerCase().includes(q) ||
      e.searchableTags.some((t) => t.includes(q))
  );
}
