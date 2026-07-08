import type { ProfessionalLicense } from '../licenses/schema';
import type { LegacyBusiness } from './schema';
import type { BusinessEligibilityRecord } from './schema';

export function evaluateBusinessEligibility(license: ProfessionalLicense): BusinessEligibilityRecord {
  const earnedCerts = license.certificationProgress.filter((c) => c.status === 'earned').length;
  const hasBusinessExpansion = license.includedExpansionIds.some((id) => id.endsWith(':business-ownership'));
  const eligible = earnedCerts >= 1 && hasBusinessExpansion;

  return {
    eligible,
    requiredPhase: 'founder',
    currentPhase: earnedCerts >= 2 ? 'founder' : earnedCerts >= 1 ? 'specialist' : 'apprentice',
    unlockReasons: eligible
      ? ['Certification earned', 'Business Ownership expansion included']
      : ['Earn a certification', 'Acquire Business Ownership expansion'],
  };
}

export function createLegacyBusiness(input: {
  license: ProfessionalLicense;
  displayName: string;
}): LegacyBusiness {
  const businessId = `business-${input.license.careerWorldId}-${Date.now()}`;
  const foundedAt = new Date().toISOString();

  return {
    businessId,
    licenseId: input.license.licenseId,
    careerWorldId: input.license.careerWorldId,
    displayName: input.displayName,
    reputation: 10,
    growthScore: 5,
    employees: [],
    locations: [
      {
        locationId: `${businessId}-hq`,
        label: 'Founding Location',
        districtId: `${input.license.careerWorldId}-commerce-quarter`,
        openedAt: foundedAt,
      },
    ],
    timeline: [
      {
        eventId: `${businessId}-founded`,
        label: 'Business Founded',
        recordedAt: foundedAt,
        summary: `${input.displayName} opened inside ${input.license.careerWorldId}.`,
      },
    ],
    foundedAt,
  };
}
