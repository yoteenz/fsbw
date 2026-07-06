import type {
  AUDIT_CATEGORIES,
  COMPLIANCE_SEVERITIES,
  DESIGN_COMPLIANCE_PHILOSOPHY,
  STUDIO_OS_DESIGN_RULES,
  VALIDATION_ISSUE_TYPES,
} from './constants';

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];
export type ValidationIssueType = (typeof VALIDATION_ISSUE_TYPES)[number];
export type ComplianceSeverity = (typeof COMPLIANCE_SEVERITIES)[number];
export type StudioOsDesignRule = (typeof STUDIO_OS_DESIGN_RULES)[number];
export type DesignCompliancePhilosophyLine = (typeof DESIGN_COMPLIANCE_PHILOSOPHY)[number];

export type ComplianceFinding = {
  id: string;
  issueType: ValidationIssueType;
  issueLabel: string;
  category: AuditCategory;
  categoryLabel: string;
  severity: ComplianceSeverity;
  pageId: string;
  pageLabel: string;
  description: string;
  whyNotStudioOs: string;
  suggestedImprovement: string;
  designRuleViolated: StudioOsDesignRule | null;
};

export type PageComplianceReport = {
  id: string;
  pageId: string;
  pageLabel: string;
  route: string;
  designScore: number;
  consistencyScore: number;
  luxuryScore: number;
  accessibilityScore: number;
  visualComplexity: number;
  hierarchyQuality: number;
  suggestedImprovements: string[];
  recognizedAsStudioOs: boolean;
  creativeDirectorVerdict: string;
  findingsCount: number;
  auditedAt: string;
};

export type CategoryAuditScore = {
  category: AuditCategory;
  label: string;
  score: number;
  status: 'compliant' | 'watch' | 'non-compliant';
  summary: string;
};

export type OrganizationDesignComplianceEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  creativeDirectorScore: number;
  pagesAudited: number;
  findingsOpen: number;
  pagesNonCompliant: number;
  averageLuxuryScore: number;
  categoryScores: CategoryAuditScore[];
  findings: ComplianceFinding[];
  pageReports: PageComplianceReport[];
  selectedPageId: string | null;
  dockComplianceLine: string;
  studioOsCreativeDirector: true;
  lastSyncedAt: string;
};

export type DesignComplianceEngineStore = {
  version: string;
  profiles: OrganizationDesignComplianceEngineProfile[];
};

export type DesignComplianceEngineDockAdvice = {
  response: string;
  concierge: string;
  creativeDirectorScore?: number;
  findingsOpen?: number;
};

export type DesignComplianceEngineSearchHit = {
  type: 'finding' | 'page' | 'category';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
