import type { OrganizationEngineeringExcellenceProfile } from './types';

export function summarizeEngineeringExcellence(profile: {
  overallEngineeringScore: number;
  openRisksCount: number;
  criticalIssuesCount: number;
  averageReleaseConfidence: number;
  productionStabilityScore: number;
}): string {
  return `Engineering Excellence™ ${profile.overallEngineeringScore}% · ${profile.openRisksCount} risks · ${profile.criticalIssuesCount} critical · confidence ${profile.averageReleaseConfidence}% · stability ${profile.productionStabilityScore}%.`;
}

export function buildDockExcellenceLine(profile: OrganizationEngineeringExcellenceProfile): string {
  const atRisk = profile.healthPillars.filter((p) => p.status === 'at-risk').length;
  const improving = profile.healthPillars.filter((p) => p.trend === 'improving').length;
  return `Engineering ${profile.overallEngineeringScore}% · ${atRisk} at-risk · ${improving} improving · ${profile.cultureCelebrations.length} celebrations.`;
}
