import type { CareerWorldId } from '../../career-worlds/types';
import type { ProfessionId } from '../../profession-simulation-engine/types';
import type { ProfessionalLicenseStatus } from '../types';
import type { CertificationProgressRecord } from '../certifications/schema';
import type { MentorEligibilityRecord } from '../mentor-economy/schema';
import type { BusinessEligibilityRecord } from '../businesses/schema';

export type LicenseRenewalRequirement = {
  id: string;
  label: string;
  description: string;
  dueAt?: string;
  optional: boolean;
};

export type ProfessionalLicense = {
  licenseId: string;
  profession: ProfessionId;
  careerWorldId: CareerWorldId;
  version: string;
  status: ProfessionalLicenseStatus;
  owner: {
    organizationId: string;
    citizenId: string;
  };
  issueDate: string;
  renewalRequirements: LicenseRenewalRequirement[];
  includedExpansionIds: string[];
  certificationProgress: CertificationProgressRecord[];
  mentorEligibility: MentorEligibilityRecord;
  businessEligibility: BusinessEligibilityRecord;
  metadata?: Record<string, string>;
};

export type AcquireLicenseInput = {
  organizationId: string;
  citizenId: string;
  careerWorldId: CareerWorldId;
  profession: ProfessionId;
  includedExpansionIds?: string[];
};
