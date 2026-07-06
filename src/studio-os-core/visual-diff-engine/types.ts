import type {
  COMPARE_BASES,
  DIFF_ISSUE_TYPES,
  DIFF_SEVERITIES,
  VISUAL_DIFF_PHILOSOPHY,
} from './constants';

export type CompareBase = (typeof COMPARE_BASES)[number];
export type DiffIssueType = (typeof DIFF_ISSUE_TYPES)[number];
export type DiffSeverity = (typeof DIFF_SEVERITIES)[number];
export type VisualDiffPhilosophyLine = (typeof VISUAL_DIFF_PHILOSOPHY)[number];

export type VisualDiffFinding = {
  id: string;
  issueType: DiffIssueType;
  issueLabel: string;
  severity: DiffSeverity;
  screenId: string;
  screenLabel: string;
  compareBase: CompareBase;
  compareBaseLabel: string;
  description: string;
  visualDelta: string;
  suggestedCorrection: string;
};

export type ScreenshotComparison = {
  id: string;
  screenId: string;
  screenLabel: string;
  baselineLabel: string;
  currentLabel: string;
  pixelDiffPct: number;
  regionsChanged: string[];
  summary: string;
};

export type VisualQaReport = {
  id: string;
  screenId: string;
  screenLabel: string;
  route: string;
  visualConsistencyScore: number;
  brandComplianceScore: number;
  responsiveScore: number;
  componentIntegrity: number;
  animationIntegrity: number;
  luxuryScore: number;
  screenshotComparisons: ScreenshotComparison[];
  suggestedCorrections: string[];
  matchesGoldenReference: boolean;
  visualIdentityVerdict: string;
  findingsCount: number;
  auditedAt: string;
};

export type GoldenReference = {
  id: string;
  screenId: string;
  screenLabel: string;
  route: string;
  approvedAt: string;
  approvedBy: string;
  referenceVersion: string;
  pixelDiffPct: number;
  status: 'active' | 'superseded' | 'pending-review';
  description: string;
};

export type OrganizationVisualDiffEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  visualMemoryScore: number;
  screensCompared: number;
  diffsDetected: number;
  screensWithRegressions: number;
  goldenReferencesActive: number;
  findings: VisualDiffFinding[];
  visualReports: VisualQaReport[];
  goldenReferences: GoldenReference[];
  selectedScreenId: string | null;
  dockVisualDiffLine: string;
  guardianOfVisualIdentity: true;
  lastSyncedAt: string;
};

export type VisualDiffEngineStore = {
  version: string;
  profiles: OrganizationVisualDiffEngineProfile[];
};

export type VisualDiffEngineDockAdvice = {
  response: string;
  concierge: string;
  visualMemoryScore?: number;
  diffsDetected?: number;
};

export type VisualDiffSearchHit = {
  type: 'finding' | 'report' | 'golden' | 'comparison';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
