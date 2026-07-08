import { STUDIO_EXCHANGE_ENGINE_VERSION } from '../constants';
import { listCertificationsForWorld } from '../certifications/registry';
import type { CertificationProgressRecord } from '../certifications/schema';
import type { AcquireLicenseInput, ProfessionalLicense } from './schema';
import { evaluateBusinessEligibility } from '../businesses/engine';
import { evaluateMentorEligibility } from '../mentor-economy/engine';

function licenseId(input: AcquireLicenseInput): string {
  return `license:${input.careerWorldId}:${input.citizenId}`;
}

function initialCertificationProgress(careerWorldId: AcquireLicenseInput['careerWorldId']): CertificationProgressRecord[] {
  return listCertificationsForWorld(careerWorldId).map((cert) => ({
    certificationId: cert.id,
    progressPercent: 0,
    status: 'locked' as const,
  }));
}

export function buildProfessionalLicense(input: AcquireLicenseInput): ProfessionalLicense {
  const issueDate = new Date().toISOString();
  const base: ProfessionalLicense = {
    licenseId: licenseId(input),
    profession: input.profession,
    careerWorldId: input.careerWorldId,
    version: STUDIO_EXCHANGE_ENGINE_VERSION,
    status: 'active',
    owner: {
      organizationId: input.organizationId,
      citizenId: input.citizenId,
    },
    issueDate,
    renewalRequirements: [],
    includedExpansionIds: input.includedExpansionIds ?? [],
    certificationProgress: initialCertificationProgress(input.careerWorldId),
    mentorEligibility: {
      eligible: false,
      mentorLevel: 'none',
      requiredCertificationIds: [],
      satisfiedCertificationIds: [],
      teachingRights: [],
    },
    businessEligibility: {
      eligible: false,
      requiredPhase: 'founder',
      currentPhase: 'entry',
      unlockReasons: [],
    },
  };

  return {
    ...base,
    mentorEligibility: evaluateMentorEligibility(base),
    businessEligibility: evaluateBusinessEligibility(base),
  };
}

export function refreshLicenseEligibility(license: ProfessionalLicense): ProfessionalLicense {
  return {
    ...license,
    mentorEligibility: evaluateMentorEligibility(license),
    businessEligibility: evaluateBusinessEligibility(license),
  };
}

export function updateCertificationProgress(
  license: ProfessionalLicense,
  certificationId: string,
  progressPercent: number,
): ProfessionalLicense {
  const certificationProgress = license.certificationProgress.map((record) => {
    if (record.certificationId !== certificationId) return record;
    let status = record.status;
    if (progressPercent >= 100) status = 'ready-for-ceremony';
    else if (progressPercent > 0) status = 'in-progress';
    return { ...record, progressPercent, status };
  });
  return refreshLicenseEligibility({ ...license, certificationProgress });
}

export function markCertificationEarned(
  license: ProfessionalLicense,
  certificationId: string,
  ceremonyId: string,
): ProfessionalLicense {
  const certificationProgress = license.certificationProgress.map((record) =>
    record.certificationId === certificationId
      ? {
          ...record,
          progressPercent: 100,
          status: 'earned' as const,
          earnedAt: new Date().toISOString(),
          ceremonyId,
        }
      : record,
  );
  return refreshLicenseEligibility({ ...license, certificationProgress });
}
