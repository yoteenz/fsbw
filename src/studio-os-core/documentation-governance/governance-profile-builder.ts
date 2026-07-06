import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { COVERAGE_STANDARD_PCT } from './constants';
import { runDocumentationAudits, summarizeDocumentationAudits } from './audit-engine';
import { validateAllFeatureCoverage, countFeaturesBelowStandard } from './coverage-validator';
import { scanTerminologyInconsistencies } from './consistency-engine';
import { findDependencyImpacts } from './dependency-validator';
import { computeGovernanceHealthDimensions, computeGovernanceHealthScore } from './health-score';
import { validatePreDeploymentRelease } from './pre-deploy-validator';
import { generateSelfImprovementRecommendations } from './self-improvement';
import type { OrganizationDocumentationGovernanceProfile } from './types';

export function buildDockGovernanceLine(profile: OrganizationDocumentationGovernanceProfile): string {
  return `Documentation Governance™ ${profile.governanceScore}% — ${profile.auditFindings.length} audits · ${profile.featuresBelowStandard} below standard · ${profile.preDeployValidation.ready ? 'release ready' : 'review flagged'}. Living organizational knowledge.`;
}

export function buildOrganizationDocumentationGovernanceProfile(
  organizationId: string
): OrganizationDocumentationGovernanceProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const auditFindings = runDocumentationAudits();
  const featureCoverage = validateAllFeatureCoverage();
  const terminologyIssues = scanTerminologyInconsistencies();
  const dependencyImpacts = findDependencyImpacts();
  const healthDimensions = computeGovernanceHealthDimensions();
  const preDeployValidation = validatePreDeploymentRelease();
  const selfImprovement = generateSelfImprovementRecommendations();

  const profile: OrganizationDocumentationGovernanceProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    governanceScore: 0,
    coverageStandardPct: COVERAGE_STANDARD_PCT,
    auditFindings,
    criticalFindingCount: auditFindings.filter((a) => a.severity === 'critical').length,
    featureCoverage,
    featuresBelowStandard: countFeaturesBelowStandard(featureCoverage),
    terminologyIssues,
    dependencyImpacts: dependencyImpacts.slice(0, 8),
    healthDimensions,
    preDeployValidation,
    selfImprovement,
    dockGovernanceLine: '',
    lastAuditAt: now,
  };

  profile.governanceScore = computeGovernanceHealthScore(healthDimensions);
  profile.dockGovernanceLine = buildDockGovernanceLine(profile);

  return profile;
}

export function summarizeDocumentationGovernance(profile: OrganizationDocumentationGovernanceProfile): string {
  return `${profile.dockGovernanceLine} ${summarizeDocumentationAudits(profile.auditFindings)}`;
}
