import type { CareerWorldId } from '../career-worlds/types';
import { listExchangeCareerWorldListings, getExchangeCareerWorldListing } from './career-worlds/registry';
import { professionIdForCareerWorld } from './career-worlds/mapping';
import { buildStudioExchangeCatalog } from './exchange/catalog';
import {
  buildProfessionalLicense,
  markCertificationEarned,
  refreshLicenseEligibility,
  updateCertificationProgress,
} from './licenses/engine';
import type { AcquireLicenseInput, ProfessionalLicense } from './licenses/schema';
import { patchStudioExchangeStore, readStudioExchangeStore } from './persistence/store';
import {
  advanceCeremonyStage,
  isCeremonyComplete,
  startCertificationCeremony,
} from './ceremonies/framework';
import type { CeremonyRunState } from './ceremonies/schema';
import { getExchangeCertification } from './certifications/registry';
import {
  createMentorAssignment,
  evaluateMentorEligibility,
  recordMentorPoints,
  buildMentorReputationSnapshot,
} from './mentor-economy/engine';
import { createLegacyBusiness } from './businesses/engine';
import type { LegacyBusiness } from './businesses/schema';
import { buildCertificationRewardBundle } from './rewards/engine';
import { getCareerExpansion } from './expansions/registry';

export type StudioExchangeDashboard = {
  catalogListingCount: number;
  licenseCount: number;
  activeLicenses: ProfessionalLicense[];
  ceremoniesInProgress: CeremonyRunState[];
  businesses: LegacyBusiness[];
};

export function listStudioExchangeCareerWorlds() {
  return listExchangeCareerWorldListings();
}

export function getStudioExchangeCatalog() {
  return buildStudioExchangeCatalog();
}

export function acquireProfessionalLicense(input: AcquireLicenseInput): ProfessionalLicense {
  const license = buildProfessionalLicense(input);
  patchStudioExchangeStore((store) => {
    const filtered = store.licenses.filter((l) => l.licenseId !== license.licenseId);
    return { ...store, licenses: [...filtered, license] };
  });
  return license;
}

export function getProfessionalLicense(licenseId: string): ProfessionalLicense | null {
  return readStudioExchangeStore().licenses.find((l) => l.licenseId === licenseId) ?? null;
}

export function listProfessionalLicenses(citizenId?: string): ProfessionalLicense[] {
  const licenses = readStudioExchangeStore().licenses;
  return citizenId ? licenses.filter((l) => l.owner.citizenId === citizenId) : licenses;
}

export function addExpansionToLicense(licenseId: string, expansionId: string): ProfessionalLicense | null {
  const expansion = getCareerExpansion(expansionId);
  if (!expansion) return null;

  let updated: ProfessionalLicense | null = null;
  patchStudioExchangeStore((store) => {
    const licenses = store.licenses.map((license) => {
      if (license.licenseId !== licenseId) return license;
      if (license.careerWorldId !== expansion.careerWorldId) return license;
      const included = license.includedExpansionIds.includes(expansionId)
        ? license.includedExpansionIds
        : [...license.includedExpansionIds, expansionId];
      updated = refreshLicenseEligibility({ ...license, includedExpansionIds: included });
      return updated;
    });
    return { ...store, licenses };
  });
  return updated;
}

export function scheduleCertificationCeremony(
  licenseId: string,
  certificationId: string,
): CeremonyRunState | null {
  const license = getProfessionalLicense(licenseId);
  const cert = getExchangeCertification(certificationId);
  if (!license || !cert) return null;

  const progress = license.certificationProgress.find((c) => c.certificationId === certificationId);
  if (!progress || (progress.status !== 'ready-for-ceremony' && progress.status !== 'in-progress')) {
    return null;
  }

  const ceremony = startCertificationCeremony({
    licenseId,
    certificationId,
    templateId: cert.ceremonyTemplateId,
  });

  patchStudioExchangeStore((store) => ({
    ...store,
    ceremonies: [...store.ceremonies.filter((c) => c.ceremonyId !== ceremony.ceremonyId), ceremony],
  }));

  return ceremony;
}

export function advanceCertificationCeremony(ceremonyId: string): CeremonyRunState | null {
  let result: CeremonyRunState | null = null;

  patchStudioExchangeStore((store) => {
    const ceremonies = store.ceremonies.map((run) => {
      if (run.ceremonyId !== ceremonyId) return run;
      result = advanceCeremonyStage(run);
      return result;
    });

    if (!result || !isCeremonyComplete(result)) {
      return { ...store, ceremonies };
    }

    const licenses = store.licenses.map((license) =>
      license.licenseId === result!.licenseId
        ? markCertificationEarned(license, result!.certificationId, result!.ceremonyId)
        : license,
    );

    return { ...store, ceremonies, licenses };
  });

  return result;
}

export function assignMentorApprentice(mentorLicenseId: string, apprenticeLicenseId: string) {
  const mentor = getProfessionalLicense(mentorLicenseId);
  const apprentice = getProfessionalLicense(apprenticeLicenseId);
  if (!mentor || !apprentice) return null;
  if (!evaluateMentorEligibility(mentor).eligible) return null;

  const assignment = createMentorAssignment({
    mentorLicenseId,
    apprenticeLicenseId,
    careerWorldId: mentor.careerWorldId,
  });

  patchStudioExchangeStore((store) => ({
    ...store,
    mentorAssignments: [...store.mentorAssignments, assignment],
    mentorPointsLedger: [
      ...store.mentorPointsLedger,
      recordMentorPoints({
        mentorLicenseId,
        points: 10,
        reason: 'Apprentice assigned',
      }),
    ],
  }));

  return assignment;
}

export function grantMentorPoints(mentorLicenseId: string, points: number, reason: string) {
  const entry = recordMentorPoints({ mentorLicenseId, points, reason });
  patchStudioExchangeStore((store) => ({
    ...store,
    mentorPointsLedger: [...store.mentorPointsLedger, entry],
  }));
  return entry;
}

export function getMentorReputation(mentorLicenseId: string) {
  const store = readStudioExchangeStore();
  return buildMentorReputationSnapshot({
    mentorLicenseId,
    ledger: store.mentorPointsLedger,
    assignments: store.mentorAssignments,
  });
}

export function foundLegacyBusiness(licenseId: string, displayName: string): LegacyBusiness | null {
  const license = getProfessionalLicense(licenseId);
  if (!license || !license.businessEligibility.eligible) return null;

  const business = createLegacyBusiness({ license, displayName });
  patchStudioExchangeStore((store) => ({
    ...store,
    businesses: [...store.businesses, business],
  }));
  return business;
}

export function recordLicenseProgress(
  licenseId: string,
  certificationId: string,
  progressPercent: number,
): ProfessionalLicense | null {
  let updated: ProfessionalLicense | null = null;
  patchStudioExchangeStore((store) => {
    const licenses = store.licenses.map((license) => {
      if (license.licenseId !== licenseId) return license;
      updated = updateCertificationProgress(license, certificationId, progressPercent);
      return updated;
    });
    return { ...store, licenses };
  });
  return updated;
}

export function getCertificationRewards(certificationId: string) {
  return buildCertificationRewardBundle(certificationId);
}

export function buildStudioExchangeDashboard(citizenId?: string): StudioExchangeDashboard {
  const store = readStudioExchangeStore();
  const catalog = buildStudioExchangeCatalog();
  const licenses = citizenId
    ? store.licenses.filter((l) => l.owner.citizenId === citizenId)
    : store.licenses;

  return {
    catalogListingCount: catalog.listings.length,
    licenseCount: licenses.length,
    activeLicenses: licenses.filter((l) => l.status === 'active'),
    ceremoniesInProgress: store.ceremonies.filter((c) => !c.completedAt),
    businesses: citizenId
      ? store.businesses.filter((b) => {
          const license = store.licenses.find((l) => l.licenseId === b.licenseId);
          return license?.owner.citizenId === citizenId;
        })
      : store.businesses,
  };
}

export function previewLicenseForCareerWorld(
  organizationId: string,
  citizenId: string,
  careerWorldId: CareerWorldId,
): ProfessionalLicense | null {
  const listing = getExchangeCareerWorldListing(careerWorldId);
  if (!listing) return null;
  return buildProfessionalLicense({
    organizationId,
    citizenId,
    careerWorldId,
    profession: professionIdForCareerWorld(careerWorldId),
  });
}
