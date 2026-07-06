import type {
  PROMPT_ISSUE_TYPES,
  PROMPT_QA_PHILOSOPHY,
  PROMPT_QA_SEVERITIES,
  PROMPT_SOURCES,
} from './constants';

export type PromptSource = (typeof PROMPT_SOURCES)[number];
export type PromptIssueType = (typeof PROMPT_ISSUE_TYPES)[number];
export type PromptQaSeverity = (typeof PROMPT_QA_SEVERITIES)[number];
export type PromptQaPhilosophyLine = (typeof PROMPT_QA_PHILOSOPHY)[number];

export type PromptQaFinding = {
  id: string;
  issueType: PromptIssueType;
  issueLabel: string;
  severity: PromptQaSeverity;
  promptId: string;
  promptName: string;
  source: PromptSource;
  sourceLabel: string;
  description: string;
  conflictReport: string;
  suggestedImprovement: string;
};

export type PromptAuditReport = {
  id: string;
  promptId: string;
  promptName: string;
  source: PromptSource;
  sourceLabel: string;
  promptQualityScore: number;
  maintainabilityScore: number;
  scalabilityScore: number;
  clarityScore: number;
  estimatedAiConfidence: number;
  conflictReport: string;
  improvementSuggestions: string[];
  productionReady: boolean;
  qaVerdict: string;
  findingsCount: number;
  auditedAt: string;
};

export type PromptVersionEntry = {
  versionId: string;
  promptId: string;
  promptName: string;
  version: string;
  createdAt: string;
  changedBy: string;
  whatChanged: string;
  whyChanged: string;
  approvedBy: string | null;
  expectedImpact: string;
  rollbackOption: string;
  status: 'approved' | 'draft' | 'pending-approval' | 'archived';
};

export type PromptSourceCoverage = {
  source: PromptSource;
  label: string;
  promptCount: number;
  avgQuality: number;
};

export type OrganizationPromptQaProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallQaScore: number;
  promptsAudited: number;
  findingsOpen: number;
  promptsNotProductionReady: number;
  averageAiConfidence: number;
  sourceCoverage: PromptSourceCoverage[];
  findings: PromptQaFinding[];
  auditReports: PromptAuditReport[];
  versionHistory: PromptVersionEntry[];
  selectedPromptId: string | null;
  dockQaLine: string;
  missionCriticalInfrastructure: true;
  lastSyncedAt: string;
};

export type PromptQaStore = {
  version: string;
  profiles: OrganizationPromptQaProfile[];
};

export type PromptQaDockAdvice = {
  response: string;
  concierge: string;
  overallQaScore?: number;
  findingsOpen?: number;
};

export type PromptQaSearchHit = {
  type: 'finding' | 'audit' | 'version' | 'source';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
