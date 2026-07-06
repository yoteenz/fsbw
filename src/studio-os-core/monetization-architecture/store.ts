import { getPackDefinition } from '../industry-architecture/pack-registry';
import { MONETIZATION_ARCHITECTURE_STORAGE_KEY, MONETIZATION_ARCHITECTURE_VERSION } from './constants';
import { resolveStaffIdFromConcierge } from './digital-staff-catalog';
import { buildDefaultHeadquartersLicense } from './headquarters-license';
import type {
  DigitalStaffActivation,
  DigitalStaffStatus,
  MonetizationArchitectureStore,
  OrganizationMonetizationProfile,
} from './types';

function emptyStore(): MonetizationArchitectureStore {
  return { profiles: [], version: MONETIZATION_ARCHITECTURE_VERSION };
}

function defaultStaffActivations(organizationId: string): DigitalStaffActivation[] {
  const base: DigitalStaffActivation[] = [
    { staffId: 'chief-concierge', status: 'active', activatedAt: new Date().toISOString() },
  ];
  if (organizationId === 'ai-media') {
    base.push(
      { staffId: 'studio-intelligence', status: 'active', activatedAt: new Date().toISOString() },
      { staffId: 'production-concierge', status: 'active', activatedAt: new Date().toISOString() },
      { staffId: 'publishing-concierge', status: 'active', activatedAt: new Date().toISOString() },
      { staffId: 'research-concierge', status: 'active', activatedAt: new Date().toISOString() }
    );
  }
  if (organizationId === 'frontal-slayer') {
    base.push(
      { staffId: 'marketing-concierge', status: 'active', activatedAt: new Date().toISOString() },
      { staffId: 'revenue-concierge', status: 'active', activatedAt: new Date().toISOString() }
    );
  }
  return base;
}

export function readMonetizationArchitectureStore(): MonetizationArchitectureStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(MONETIZATION_ARCHITECTURE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as MonetizationArchitectureStore;
    return { ...emptyStore(), ...parsed, version: MONETIZATION_ARCHITECTURE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeMonetizationArchitectureStore(store: MonetizationArchitectureStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MONETIZATION_ARCHITECTURE_STORAGE_KEY, JSON.stringify(store));
}

export function getOrganizationMonetizationProfile(
  organizationId: string
): OrganizationMonetizationProfile | null {
  return readMonetizationArchitectureStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function upsertOrganizationMonetizationProfile(profile: OrganizationMonetizationProfile): void {
  const store = readMonetizationArchitectureStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeMonetizationArchitectureStore({
    ...store,
    profiles: [...next, { ...profile, updatedAt: new Date().toISOString() }],
  });
}

export function ensureOrganizationMonetizationProfile(organizationId: string): OrganizationMonetizationProfile {
  const existing = getOrganizationMonetizationProfile(organizationId);
  if (existing) return existing;

  const profile: OrganizationMonetizationProfile = {
    organizationId,
    headquartersLicense: buildDefaultHeadquartersLicense(),
    ownedPackIds: ['marketing-department'],
    staffActivations: defaultStaffActivations(organizationId),
    updatedAt: new Date().toISOString(),
  };
  upsertOrganizationMonetizationProfile(profile);
  return profile;
}

function unlockStaffFromPack(profile: OrganizationMonetizationProfile, packId: string): DigitalStaffActivation[] {
  const pack = getPackDefinition(packId);
  if (!pack) return profile.staffActivations;

  const activations = new Map(profile.staffActivations.map((a) => [a.staffId, a]));
  for (const concierge of pack.outcome.conciergesAdded) {
    const staffId = resolveStaffIdFromConcierge(concierge.id);
    if (!staffId || activations.has(staffId)) continue;
    activations.set(staffId, { staffId, status: 'available' });
  }
  return [...activations.values()];
}

export function recordDepartmentPackPurchase(
  organizationId: string,
  packId: string
): OrganizationMonetizationProfile {
  const profile = ensureOrganizationMonetizationProfile(organizationId);
  if (profile.ownedPackIds.includes(packId)) return profile;

  const next: OrganizationMonetizationProfile = {
    ...profile,
    ownedPackIds: [...profile.ownedPackIds, packId],
    staffActivations: unlockStaffFromPack(profile, packId),
    updatedAt: new Date().toISOString(),
  };
  upsertOrganizationMonetizationProfile(next);
  return next;
}

export function setDigitalStaffStatus(
  organizationId: string,
  staffId: string,
  status: DigitalStaffStatus
): OrganizationMonetizationProfile {
  const profile = ensureOrganizationMonetizationProfile(organizationId);
  const activations = new Map(profile.staffActivations.map((a) => [a.staffId, a]));
  const now = new Date().toISOString();
  activations.set(staffId, {
    staffId,
    status,
    activatedAt: status === 'active' ? now : activations.get(staffId)?.activatedAt,
    pausedAt: status === 'paused' ? now : undefined,
  });
  const next = { ...profile, staffActivations: [...activations.values()], updatedAt: now };
  upsertOrganizationMonetizationProfile(next);
  return next;
}

export function syncMonetizationFromArchitecture(
  organizationId: string,
  installedPackIds: string[]
): OrganizationMonetizationProfile {
  let profile = ensureOrganizationMonetizationProfile(organizationId);
  for (const packId of installedPackIds) {
    if (!profile.ownedPackIds.includes(packId)) {
      profile = recordDepartmentPackPurchase(organizationId, packId);
    }
  }
  return profile;
}
