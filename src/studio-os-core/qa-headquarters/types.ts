import type {
  QA_HEADQUARTERS_PHILOSOPHY,
  QA_RESPONSIBILITIES,
  TRUST_SCORE_SYSTEMS,
  VALIDATION_STATUSES,
  VALIDATION_TRIGGERS,
} from './constants';

export type TrustScoreSystemId = (typeof TRUST_SCORE_SYSTEMS)[number];
export type QaResponsibilityId = (typeof QA_RESPONSIBILITIES)[number];
export type ValidationTriggerId = (typeof VALIDATION_TRIGGERS)[number];
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];
export type QaPhilosophyLine = (typeof QA_HEADQUARTERS_PHILOSOPHY)[number];

export type TrustScoreEntry = {
  systemId: TrustScoreSystemId;
  label: string;
  scorePct: number;
  trend: 'rising' | 'stable' | 'declining';
  lastValidatedAt: string;
  status: 'trusted' | 'monitoring' | 'at-risk';
  summary: string;
};

export type QaResponsibilityEntry = {
  responsibilityId: QaResponsibilityId;
  label: string;
  active: boolean;
  coveragePct: number;
  lastCheckedAt: string;
  issueCount: number;
};

export type ContinuousValidationEvent = {
  id: string;
  trigger: ValidationTriggerId;
  triggerLabel: string;
  status: ValidationStatus;
  startedAt: string;
  completedAt?: string;
  systemsChecked: string[];
  findingsCount: number;
  summary: string;
};

export type OrganizationQaHeadquartersProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallTrustScore: number;
  trustTrend: 'rising' | 'stable' | 'declining';
  validationsToday: number;
  activeIssues: number;
  trustScores: TrustScoreEntry[];
  responsibilities: QaResponsibilityEntry[];
  recentValidations: ContinuousValidationEvent[];
  dockQaLine: string;
  qualityAssuranceActive: true;
  lastSyncedAt: string;
};

export type QaHeadquartersStore = {
  version: string;
  profiles: OrganizationQaHeadquartersProfile[];
};

export type QaHeadquartersDockAdvice = {
  response: string;
  concierge: string;
  overallTrustScore?: number;
};

export type QaHeadquartersSearchHit = {
  type: 'trust' | 'responsibility' | 'validation';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
