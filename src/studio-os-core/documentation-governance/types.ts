import type { AUDIT_ISSUE_TYPES, COVERAGE_SURFACES, DOCUMENTATION_GOVERNANCE_PHILOSOPHY } from './constants';

export type CoverageSurface = (typeof COVERAGE_SURFACES)[number];
export type AuditIssueType = (typeof AUDIT_ISSUE_TYPES)[number];
export type GovernancePhilosophyLine = (typeof DOCUMENTATION_GOVERNANCE_PHILOSOPHY)[number];

export type DocumentationAuditFinding = {
  id: string;
  issueType: AuditIssueType;
  severity: 'critical' | 'warning' | 'info';
  featureId: string;
  featureName: string;
  surface?: CoverageSurface | string;
  message: string;
  recommendation: string;
  detectedAt: string;
};

export type FeatureCoverageResult = {
  featureId: string;
  featureName: string;
  coveragePct: number;
  complete: boolean;
  surfaces: Array<{
    surface: CoverageSurface;
    covered: boolean;
    detail: string;
  }>;
  gaps: string[];
};

export type TerminologyInconsistency = {
  id: string;
  officialTerm: string;
  foundVariant: string;
  location: string;
  featureId?: string;
  recommendation: string;
};

export type DependencyImpact = {
  featureId: string;
  featureName: string;
  affectedSurfaces: Array<{
    surface: string;
    referenceCount: number;
    updateRequired: boolean;
  }>;
  prompt: string;
};

export type GovernanceHealthDimension = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type PreDeployCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  blocking: boolean;
};

export type PreDeployValidationResult = {
  ready: boolean;
  scorePct: number;
  checks: PreDeployCheck[];
  flaggedForReview: boolean;
  summary: string;
};

export type SelfImprovementRecommendation = {
  id: string;
  category: 'search-gap' | 'onboarding' | 'terminology' | 'coverage' | 'academy' | 'walkthrough';
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  action: string;
};

export type OrganizationDocumentationGovernanceProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  governanceScore: number;
  coverageStandardPct: number;
  auditFindings: DocumentationAuditFinding[];
  criticalFindingCount: number;
  featureCoverage: FeatureCoverageResult[];
  featuresBelowStandard: number;
  terminologyIssues: TerminologyInconsistency[];
  dependencyImpacts: DependencyImpact[];
  healthDimensions: GovernanceHealthDimension[];
  preDeployValidation: PreDeployValidationResult;
  selfImprovement: SelfImprovementRecommendation[];
  dockGovernanceLine: string;
  lastAuditAt: string;
};

export type DocumentationGovernanceStore = {
  version: string;
  profiles: OrganizationDocumentationGovernanceProfile[];
};

export type DocumentationGovernanceDockAdvice = {
  response: string;
  concierge: string;
  governanceScore?: number;
};
