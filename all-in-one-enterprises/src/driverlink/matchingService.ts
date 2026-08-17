/**
 * DriverLink matching — professional criteria only. No protected characteristics.
 */

import type { DriverJobMatch, DriverProfile, JobOpportunity } from './driverlinkTypes';

export interface MatchResult {
  driverProfileId: string;
  opportunityId: string;
  matchScore: number;
  matchFactors: Record<string, string | boolean>;
  eligible: boolean;
}

function cdlCompatible(driver: DriverProfile, job: JobOpportunity): boolean {
  if (job.cdlClassRequired === 'any') return driver.cdlClass !== 'unknown';
  const order = { A: 3, B: 2, C: 1, unknown: 0 };
  return order[driver.cdlClass] >= order[job.cdlClassRequired as keyof typeof order];
}

function endorsementMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  if (!job.endorsementsRequired.length) return true;
  return job.endorsementsRequired.every((e) => driver.endorsements.includes(e));
}

function equipmentMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  if (!job.equipmentType.length) return true;
  return job.equipmentType.some((e) => driver.equipmentExperience.includes(e));
}

function regionMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  if (!job.serviceRegions.length) return true;
  const driverRegions = [...driver.preferredRegions, driver.homeState].filter(Boolean);
  return job.serviceRegions.some((r) => driverRegions.includes(r));
}

function routeMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  if (driver.routePreference === 'any') return true;
  return driver.routePreference === job.routeType;
}

function experienceMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  const req = job.experienceRequiredYears ?? 0;
  return driver.yearsExperience >= req;
}

function employmentMatch(driver: DriverProfile, job: JobOpportunity): boolean {
  if (job.driverType === 'either' || driver.employmentPreference === 'either') return true;
  return job.driverType === driver.employmentPreference;
}

function availabilityMatch(driver: DriverProfile): boolean {
  return driver.marketplaceStatus === 'active';
}

export function computeMatch(driver: DriverProfile, job: JobOpportunity): MatchResult {
  const factors: Record<string, string | boolean> = {
    cdl_match: cdlCompatible(driver, job) ? 'yes' : 'no',
    endorsement_match: endorsementMatch(driver, job) ? 'yes' : 'partial',
    equipment_match: equipmentMatch(driver, job) ? 'yes' : 'no',
    region_match: regionMatch(driver, job) ? 'yes' : 'partial',
    route_match: routeMatch(driver, job) ? 'yes' : 'partial',
    experience_match: experienceMatch(driver, job) ? 'yes' : 'no',
    employment_match: employmentMatch(driver, job) ? 'yes' : 'no',
    availability: availabilityMatch(driver) ? 'yes' : 'no',
  };

  const weights: Record<string, number> = {
    cdl_match: 20,
    endorsement_match: 15,
    equipment_match: 15,
    region_match: 15,
    route_match: 10,
    experience_match: 10,
    employment_match: 10,
    availability: 5,
  };

  let score = 0;
  for (const [key, val] of Object.entries(factors)) {
    if (val === 'yes') score += weights[key] ?? 0;
    else if (val === 'partial') score += (weights[key] ?? 0) * 0.5;
  }

  const eligible =
    factors.cdl_match === 'yes'
    && factors.availability === 'yes'
    && job.status === 'published'
    && driver.profileVisibility !== 'hidden'
    && driver.profileVisibility !== 'paused';

  return {
    driverProfileId: driver.id,
    opportunityId: job.id,
    matchScore: Math.round(score),
    matchFactors: factors,
    eligible,
  };
}

export function matchDriversToOpportunity(
  drivers: DriverProfile[],
  job: JobOpportunity,
): MatchResult[] {
  return drivers
    .map((d) => computeMatch(d, job))
    .filter((m) => m.eligible)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function matchOpportunitiesToDriver(
  driver: DriverProfile,
  jobs: JobOpportunity[],
): MatchResult[] {
  return jobs
    .map((j) => computeMatch(driver, j))
    .filter((m) => m.eligible)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function toDriverJobMatch(result: MatchResult): DriverJobMatch {
  return {
    id: `dl-match-${result.driverProfileId}-${result.opportunityId}`,
    driverProfileId: result.driverProfileId,
    opportunityId: result.opportunityId,
    matchScore: result.matchScore,
    matchFactors: result.matchFactors,
    eligible: result.eligible,
    createdAt: new Date().toISOString(),
  };
}

export function buildPublicProfileView(
  driver: DriverProfile,
  credentials: { credentialType: string; verificationStatus: string }[],
): import('./driverlinkTypes').DriverPublicProfileView {
  return {
    displayName: `${driver.firstName} ${driver.lastName.charAt(0)}.`,
    generalLocation: driver.homeCity && driver.homeState ? `${driver.homeCity}, ${driver.homeState}` : driver.homeState,
    cdlClass: driver.cdlClass,
    endorsements: driver.endorsements,
    yearsExperience: driver.yearsExperience,
    equipmentExperience: driver.equipmentExperience,
    availabilityDate: driver.availabilityDate,
    routePreference: driver.routePreference,
    summary: driver.workHistorySummary,
    credentialSummary: credentials.map((c) => ({
      type: c.credentialType,
      status: c.verificationStatus as import('./driverlinkTypes').DriverCredentialVerificationStatus,
    })),
  };
}
