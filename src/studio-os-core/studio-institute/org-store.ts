import {
  STUDIO_INSTITUTE_ORG_STORAGE_KEY,
  STUDIO_INSTITUTE_ORG_VERSION,
  STUDIO_OS_STUDIO_INSTITUTE_UPDATED,
} from './constants';
import { generateInstituteArtifactsFromProfile } from './course-generator';
import { generateCertificationsFromProfile } from './certification-engine';
import {
  buildInstituteDashboard,
  detectKnowledgeUpdates,
  generateCustomerCourses,
} from './dashboard-engine';
import { buildKnowledgeEvolutionTimeline, summarizeEvolution } from './knowledge-evolution';
import { generateRolePathsFromProfile } from './role-paths';
import { generateScenariosFromProfile } from './scenario-engine';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type {
  OrganizationStudioInstituteProfile,
  StudioInstituteOrgStore,
} from './types';

function emptyOrgStore(): StudioInstituteOrgStore {
  return { version: STUDIO_INSTITUTE_ORG_VERSION, profiles: [] };
}

export function readStudioInstituteOrgStore(): StudioInstituteOrgStore {
  if (typeof localStorage === 'undefined') return emptyOrgStore();
  try {
    const raw = localStorage.getItem(STUDIO_INSTITUTE_ORG_STORAGE_KEY);
    if (!raw) return emptyOrgStore();
    const parsed = JSON.parse(raw) as StudioInstituteOrgStore;
    return { ...emptyOrgStore(), ...parsed, version: STUDIO_INSTITUTE_ORG_VERSION };
  } catch {
    return emptyOrgStore();
  }
}

export function writeStudioInstituteOrgStore(store: StudioInstituteOrgStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_INSTITUTE_ORG_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_STUDIO_INSTITUTE_UPDATED));
  }
}

export function getOrganizationStudioInstituteProfile(
  organizationId: string
): OrganizationStudioInstituteProfile | null {
  return readStudioInstituteOrgStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function buildInstituteProfileFromBrain(
  organizationId: string
): OrganizationStudioInstituteProfile | null {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  if (!brainProfile) return null;

  const artifacts = generateInstituteArtifactsFromProfile(brainProfile);
  const scenarios = generateScenariosFromProfile(brainProfile);
  const rolePaths = generateRolePathsFromProfile(brainProfile);
  const certifications = generateCertificationsFromProfile(brainProfile);
  const customerCourses = generateCustomerCourses(brainProfile, artifacts);
  const knowledgeUpdates = detectKnowledgeUpdates(brainProfile);
  const evolutionEvents = buildKnowledgeEvolutionTimeline(brainProfile);
  const certificationsEarned = certifications.filter((c) => c.status === 'earned').length;

  return {
    organizationId,
    companyName: brainProfile.companyName,
    industryId: brainProfile.industryId,
    updatedAt: new Date().toISOString(),
    brainSyncedAt: brainProfile.updatedAt,
    artifacts,
    scenarios,
    rolePaths,
    certifications,
    customerCourses,
    dashboard: buildInstituteDashboard(brainProfile, artifacts, certificationsEarned, scenarios.length),
    knowledgeUpdates,
    evolutionSummary: summarizeEvolution(evolutionEvents),
  };
}

export function syncStudioInstituteFromProfessionBrain(
  organizationId: string
): OrganizationStudioInstituteProfile | null {
  const profile = buildInstituteProfileFromBrain(organizationId);
  if (!profile) return null;

  const store = readStudioInstituteOrgStore();
  const nextProfiles = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeStudioInstituteOrgStore({
    ...store,
    profiles: [...nextProfiles, profile],
  });

  return profile;
}

export function ensureOrganizationStudioInstituteProfile(
  organizationId: string
): OrganizationStudioInstituteProfile | null {
  const existing = getOrganizationStudioInstituteProfile(organizationId);
  if (existing) return existing;
  return syncStudioInstituteFromProfessionBrain(organizationId);
}

export function bootstrapStudioInstituteForOrg(organizationId: string): void {
  syncStudioInstituteFromProfessionBrain(organizationId);
}
