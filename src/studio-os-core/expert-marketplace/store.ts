import { EXPERT_MARKETPLACE_STORAGE_KEY, EXPERT_MARKETPLACE_VERSION } from './constants';
import { buildExpertProfilesFromProfessionBrain } from './profile-generator';
import { generateAcademyOfferings } from './academy-connection';
import { generateRevenueOfferings } from './monetization';
import { generateAudienceExperiences } from './multi-audience';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import type {
  ExpertMarketplaceListing,
  ExpertMarketplaceStore,
  ExpertProfile,
  OrganizationExpertMarketplaceProfile,
} from './types';

function emptyStore(): ExpertMarketplaceStore {
  return { profiles: [], publicCatalog: [], version: EXPERT_MARKETPLACE_VERSION };
}

export function readExpertMarketplaceStore(): ExpertMarketplaceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXPERT_MARKETPLACE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExpertMarketplaceStore;
    return { ...emptyStore(), ...parsed, version: EXPERT_MARKETPLACE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExpertMarketplaceStore(store: ExpertMarketplaceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXPERT_MARKETPLACE_STORAGE_KEY, JSON.stringify(store));
}

function buildListings(expertProfiles: ExpertProfile[]): ExpertMarketplaceListing[] {
  return expertProfiles.map((profile) => ({
    profile,
    academyOfferings: generateAcademyOfferings(profile),
    revenueOfferings: generateRevenueOfferings(profile),
    audiences: generateAudienceExperiences(profile),
  }));
}

function rebuildPublicCatalog(profiles: OrganizationExpertMarketplaceProfile[]): ExpertProfile[] {
  return profiles.flatMap((p) => p.listings.map((l) => l.profile)).filter((e) => e.published);
}

export function syncExpertMarketplaceFromProfessionBrain(
  organizationId: string
): OrganizationExpertMarketplaceProfile | null {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  if (!brainProfile) return null;

  const expertProfiles = buildExpertProfilesFromProfessionBrain(brainProfile);
  const listings = buildListings(expertProfiles);

  const orgProfile: OrganizationExpertMarketplaceProfile = {
    organizationId,
    companyName: brainProfile.companyName,
    industryId: brainProfile.industryId,
    updatedAt: new Date().toISOString(),
    listings,
    publishedCount: listings.filter((l) => l.profile.published).length,
    pendingApprovalCount: brainProfile.publicSurfaces.filter((s) => !s.enabled).length,
  };

  const store = readExpertMarketplaceStore();
  const nextProfiles = store.profiles.filter((p) => p.organizationId !== organizationId);
  const allProfiles = [...nextProfiles, orgProfile];
  writeExpertMarketplaceStore({
    ...store,
    profiles: allProfiles,
    publicCatalog: rebuildPublicCatalog(allProfiles),
  });

  return orgProfile;
}

export function getOrganizationExpertMarketplaceProfile(
  organizationId: string
): OrganizationExpertMarketplaceProfile | null {
  return readExpertMarketplaceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function ensureOrganizationExpertMarketplaceProfile(
  organizationId: string
): OrganizationExpertMarketplaceProfile | null {
  const existing = getOrganizationExpertMarketplaceProfile(organizationId);
  if (existing && existing.listings.length > 0) return existing;
  return syncExpertMarketplaceFromProfessionBrain(organizationId);
}

export function setExpertPublished(
  organizationId: string,
  brainId: string,
  published: boolean
): OrganizationExpertMarketplaceProfile | null {
  void import('../profession-brain/store').then((m) => {
    const profile = m.getOrganizationProfessionBrainProfile(organizationId);
    if (!profile) return;
    const publicSurfaces = profile.publicSurfaces.map((s) =>
      s.brainId === brainId ? { ...s, enabled: published } : s
    );
    m.upsertOrganizationProfessionBrainProfile({ ...profile, publicSurfaces });
    syncExpertMarketplaceFromProfessionBrain(organizationId);
  });
  return getOrganizationExpertMarketplaceProfile(organizationId);
}

export function listPublicExpertCatalog(): ExpertProfile[] {
  return readExpertMarketplaceStore().publicCatalog;
}

export function bootstrapExpertMarketplaceForOrg(organizationId: string): void {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  if (!brain) {
    void import('../profession-brain/store').then((m) => {
      m.ensureOrganizationProfessionBrainProfile(
        organizationId,
        organizationId.replace(/-/g, ' ').toUpperCase(),
        resolveIndustryForWorkspace(organizationId)
      );
      syncExpertMarketplaceFromProfessionBrain(organizationId);
    });
    return;
  }
  syncExpertMarketplaceFromProfessionBrain(organizationId);
}
