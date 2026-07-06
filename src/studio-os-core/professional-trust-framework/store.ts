import {
  PROFESSIONAL_TRUST_STORAGE_KEY,
  PROFESSIONAL_TRUST_VERSION,
  STUDIO_OS_PROFESSIONAL_TRUST_UPDATED,
} from './constants';
import { buildBrainConfidenceProfile } from './confidence-system';
import { buildEscalationPlaybook, recommendEscalationForAction } from './escalation-engine';
import { buildNaturalGuidanceSamples } from './natural-guidance';
import { buildRegulatedIndustryRules } from './regulated-industries';
import { buildProfessionalScope } from './scope-declaration';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type {
  BrainTrustDeclaration,
  OrganizationTrustFrameworkProfile,
  ProfessionalTrustStore,
} from './types';

function emptyStore(): ProfessionalTrustStore {
  return { version: PROFESSIONAL_TRUST_VERSION, profiles: [] };
}

export function readProfessionalTrustStore(): ProfessionalTrustStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PROFESSIONAL_TRUST_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProfessionalTrustStore;
    return { ...emptyStore(), ...parsed, version: PROFESSIONAL_TRUST_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeProfessionalTrustStore(store: ProfessionalTrustStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROFESSIONAL_TRUST_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PROFESSIONAL_TRUST_UPDATED));
  }
}

export function getOrganizationTrustFrameworkProfile(
  organizationId: string
): OrganizationTrustFrameworkProfile | null {
  return readProfessionalTrustStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function buildBrainDeclarations(
  brainProfile: NonNullable<ReturnType<typeof getOrganizationProfessionBrainProfile>>
): BrainTrustDeclaration[] {
  return brainProfile.brains.map((brain) => {
    const scope = buildProfessionalScope(brain, brainProfile.industryId);
    const confidence = buildBrainConfidenceProfile(brain, brainProfile.industryId);
    return {
      brainId: brain.id,
      brainLabel: brain.label,
      scope,
      confidence,
      guidanceSamples: buildNaturalGuidanceSamples(brain, scope, confidence),
    };
  });
}

export function buildTrustFrameworkProfile(
  organizationId: string
): OrganizationTrustFrameworkProfile | null {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  if (!brainProfile) return null;

  const brainDeclarations = buildBrainDeclarations(brainProfile);
  const avgCoverage =
    brainDeclarations.length === 0
      ? 0
      : Math.round(
          brainDeclarations.reduce((s, d) => s + d.confidence.knowledgeCoveragePct, 0) /
            brainDeclarations.length
        );

  return {
    organizationId,
    companyName: brainProfile.companyName,
    industryId: brainProfile.industryId,
    updatedAt: new Date().toISOString(),
    brainSyncedAt: brainProfile.updatedAt,
    brainDeclarations,
    regulatedRules: buildRegulatedIndustryRules(brainProfile.industryId),
    escalationPlaybook: buildEscalationPlaybook(brainDeclarations),
    overallTrustScore: avgCoverage,
  };
}

export function syncProfessionalTrustFromProfessionBrain(
  organizationId: string
): OrganizationTrustFrameworkProfile | null {
  const profile = buildTrustFrameworkProfile(organizationId);
  if (!profile) return null;

  const store = readProfessionalTrustStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeProfessionalTrustStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationTrustFrameworkProfile(
  organizationId: string
): OrganizationTrustFrameworkProfile | null {
  const existing = getOrganizationTrustFrameworkProfile(organizationId);
  if (existing) return existing;
  return syncProfessionalTrustFromProfessionBrain(organizationId);
}

export { recommendEscalationForAction };
