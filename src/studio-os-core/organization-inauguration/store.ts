import {
  ORGANIZATION_INAUGURATION_STORAGE_KEY,
  ORGANIZATION_INAUGURATION_VERSION,
  STUDIO_OS_BLUEPRINT_READY_FOR_INAUGURATION,
  STUDIO_OS_INAUGURATION_ENTERED,
} from './constants';
import {
  buildInaugurationProfileFromBlueprint,
  getNextPhase,
  advanceActivationSteps,
  INAUGURATION_PHASE_ORDER,
  getPhaseIndex,
} from './ceremony-engine';
import {
  computeAllChapterProgress,
  computeOverallProgress,
  getOrganizationDiscoveryBlueprint,
} from '../business-discovery-blueprint';
import type {
  OrganizationInaugurationProfile,
  OrganizationInaugurationStore,
  InaugurationCeremonyState,
} from './types';

function emptyStore(): OrganizationInaugurationStore {
  return { profiles: [], version: ORGANIZATION_INAUGURATION_VERSION };
}

export function readOrganizationInaugurationStore(): OrganizationInaugurationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATION_INAUGURATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationInaugurationStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATION_INAUGURATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationInaugurationStore(store: OrganizationInaugurationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATION_INAUGURATION_STORAGE_KEY, JSON.stringify(store));
}

export function getOrganizationInaugurationProfile(
  organizationId: string
): OrganizationInaugurationProfile | null {
  return readOrganizationInaugurationStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function isBlueprintReadyForInauguration(organizationId: string): boolean {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  if (!blueprint) return false;
  const chapters = computeAllChapterProgress(blueprint);
  const allComplete = chapters.every((c) => c.status === 'complete');
  return allComplete || computeOverallProgress(blueprint) >= 100;
}

export function getFoundingBlueprintSnapshot(organizationId: string) {
  return getOrganizationInaugurationProfile(organizationId)?.foundingBlueprintSnapshot ?? null;
}

function dispatchEvent(name: string, detail: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function ensureInaugurationFromBlueprint(organizationId: string): OrganizationInaugurationProfile | null {
  if (!isBlueprintReadyForInauguration(organizationId)) return null;

  const existing = getOrganizationInaugurationProfile(organizationId);
  if (existing) return existing;

  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  if (!blueprint) return null;

  const profile = buildInaugurationProfileFromBlueprint(blueprint);
  upsertOrganizationInaugurationProfile(profile);
  dispatchEvent(STUDIO_OS_BLUEPRINT_READY_FOR_INAUGURATION, { organizationId });
  return profile;
}

export function upsertOrganizationInaugurationProfile(profile: OrganizationInaugurationProfile): void {
  const store = readOrganizationInaugurationStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeOrganizationInaugurationStore({ ...store, profiles: [...next, profile] });
}

export function advanceInaugurationPhase(organizationId: string): OrganizationInaugurationProfile | null {
  const profile = getOrganizationInaugurationProfile(organizationId);
  if (!profile || profile.inaugurationComplete) return profile;

  const nextPhase = getNextPhase(profile.currentPhase);
  if (!nextPhase) return profile;

  let updated: OrganizationInaugurationProfile = { ...profile, currentPhase: nextPhase };

  if (nextPhase === 'activation') {
    updated = advanceActivationSteps(updated, updated.activationSteps.length);
  }

  upsertOrganizationInaugurationProfile(updated);
  return updated;
}

export function setInaugurationPhase(
  organizationId: string,
  phase: OrganizationInaugurationProfile['currentPhase']
): OrganizationInaugurationProfile | null {
  const profile = getOrganizationInaugurationProfile(organizationId);
  if (!profile) return null;
  const updated = { ...profile, currentPhase: phase };
  upsertOrganizationInaugurationProfile(updated);
  return updated;
}

export function tickActivationProgress(organizationId: string): OrganizationInaugurationProfile | null {
  const profile = getOrganizationInaugurationProfile(organizationId);
  if (!profile) return null;
  const completed = profile.activationSteps.filter((s) => s.completed).length;
  const nextCount = Math.min(completed + 1, profile.activationSteps.length);
  const updated = advanceActivationSteps(profile, nextCount);
  upsertOrganizationInaugurationProfile(updated);
  return updated;
}

export function advanceWalkthroughStop(organizationId: string): OrganizationInaugurationProfile | null {
  const profile = getOrganizationInaugurationProfile(organizationId);
  if (!profile) return null;
  const nextIndex = Math.min(
    profile.walkthroughIndex + 1,
    profile.walkthroughStops.length - 1
  );
  const updated = { ...profile, walkthroughIndex: nextIndex };
  upsertOrganizationInaugurationProfile(updated);
  return updated;
}

export function completeHeadquartersEntry(organizationId: string): OrganizationInaugurationProfile | null {
  const profile = getOrganizationInaugurationProfile(organizationId);
  if (!profile) return null;

  const updated: OrganizationInaugurationProfile = {
    ...profile,
    currentPhase: 'final',
    inaugurationComplete: true,
    headquartersEnteredAt: new Date().toISOString(),
  };
  upsertOrganizationInaugurationProfile(updated);
  dispatchEvent(STUDIO_OS_INAUGURATION_ENTERED, { organizationId });
  return updated;
}

export function buildInaugurationCeremonyState(
  organizationId: string
): InaugurationCeremonyState | null {
  const profile =
    getOrganizationInaugurationProfile(organizationId) ??
    ensureInaugurationFromBlueprint(organizationId);
  if (!profile) return null;

  const phaseIndex = getPhaseIndex(profile.currentPhase);
  const activationProgressPct =
    profile.activationSteps.length === 0
      ? 0
      : Math.round(
          (profile.activationSteps.filter((s) => s.completed).length / profile.activationSteps.length) *
            100
        );

  return {
    profile,
    phaseIndex,
    totalPhases: INAUGURATION_PHASE_ORDER.length,
    activationProgressPct,
    canEnterHeadquarters: profile.currentPhase === 'final' && !profile.headquartersEnteredAt,
  };
}

export function ensureOrganizationInaugurationProfile(organizationId: string): OrganizationInaugurationProfile | null {
  return ensureInaugurationFromBlueprint(organizationId);
}
