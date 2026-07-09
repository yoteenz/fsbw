import type {
  LvsDashboardView,
  LvsDiarySentiment,
  LvsEscapeClassification,
  LvsEscapeOutcome,
  LvsHealthDimension,
  LvsProposalStatus,
  LvsTrackingMetricId,
} from './constants';

export type LvsValidationSignal = {
  signalId: string;
  systemId: string;
  companyId: string;
  missionId?: string;
  kind: 'usage' | 'escape' | 'reflection' | 'completion' | 'friction' | 'delight' | 'withdrawal' | 'self-evaluation';
  metricId?: LvsTrackingMetricId;
  strength: number;
  confidence: number;
  evidence: string[];
  createdAt: string;
};

export type LvsDiaryPrompt = {
  promptId: string;
  question: string;
  triggerKind: string;
  systemIds: string[];
  missionId?: string;
  quickAnswers: string[];
  askedAt: string;
  answeredAt?: string;
  skipped: boolean;
};

export type LvsDiaryAnswer = {
  answerId: string;
  promptId: string;
  response: string;
  quickAnswer?: string;
  sentiments: LvsDiarySentiment[];
  sentimentConfidence: number;
  systemIds: string[];
  missionId?: string;
  shouldAffectValidation: boolean;
  shouldBecomeGenesisLearning: boolean;
  recordedAt: string;
};

export type LvsEscapeEvent = {
  eventId: string;
  systemId: string;
  missionId?: string;
  destinationCategory: string;
  destinationLabel: string;
  reason?: string;
  classification: LvsEscapeClassification;
  outcome: LvsEscapeOutcome;
  confidence: number;
  frequency: number;
  context: string;
  urgency: 'low' | 'medium' | 'high';
  replacementOpportunity: boolean;
  integrationOpportunity: boolean;
  frictionScore: number;
  createdAt: string;
};

export type LvsEscapePattern = {
  patternId: string;
  destinationCategory: string;
  systemId: string;
  occurrenceCount: number;
  dominantClassification: LvsEscapeClassification;
  recommendedOutcome: LvsEscapeOutcome;
  escapeVelocityScore: number;
  lastSeenAt: string;
};

export type LvsSystemHealthScore = {
  systemId: string;
  officialName: string;
  overallHealth: number;
  dimensions: Record<LvsHealthDimension, number>;
  trend: 'up' | 'down' | 'flat';
  lastEvaluatedAt: string;
  summary: string;
};

export type LvsSystemConfidenceReading = {
  readingId: string;
  systemId: string;
  confidenceScore: number;
  trustBurden: number;
  verificationRate: number;
  recommendationAcceptRate: number;
  recordedAt: string;
};

export type LvsAdoptionReading = {
  readingId: string;
  systemId: string;
  dailyActiveRate: number;
  weeklyReturnRate: number;
  habitScore: number;
  voluntaryUsageRate: number;
  recordedAt: string;
};

export type LvsValueReading = {
  readingId: string;
  systemId: string;
  timeSavedMinutes: number;
  taskCompletionLift: number;
  missionAdvancementRate: number;
  valueScore: number;
  recordedAt: string;
};

export type LvsTrackingMetricSnapshot = {
  metricId: LvsTrackingMetricId;
  label: string;
  value: number;
  unit: 'count' | 'score' | 'minutes' | 'percent';
  trend: 'up' | 'down' | 'flat';
  period: 'daily' | 'weekly';
  lastUpdatedAt: string;
};

export type LvsGenesisImprovementProposal = {
  proposalId: string;
  title: string;
  status: LvsProposalStatus;
  systemIds: string[];
  missionIds: string[];
  signalSummary: string;
  evidenceQuality: 'low' | 'medium' | 'high';
  diaryExcerpts: string[];
  escapeClassifications: LvsEscapeClassification[];
  metricTrend: string;
  proposedGenesisChange: string;
  recommendedOutcome: LvsEscapeOutcome | 'none';
  graduationImpact: string;
  risksOfInaction: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
};

export type LvsArchitecturalHistoryEntry = {
  entryId: string;
  proposalId?: string;
  action: 'proposal-created' | 'proposal-accepted' | 'proposal-rejected' | 'proposal-deferred' | 'learning-recorded';
  detail: string;
  actor: string;
  timestamp: string;
};

export type LvsWeeklyReview = {
  reviewId: string;
  weekOf: string;
  systemsImproved: string[];
  systemsWithFriction: string[];
  notableEscapes: string[];
  missionsCompletedFaster: number;
  proposalsCreated: number;
  proposalsAccepted: number;
  proposalsRejected: number;
  founderConfidenceTrend: 'up' | 'down' | 'flat';
  summary: string;
  generatedAt: string;
};

export type LvsStore = {
  version: string;
  signals: LvsValidationSignal[];
  diaryPrompts: LvsDiaryPrompt[];
  diaryAnswers: LvsDiaryAnswer[];
  escapeEvents: LvsEscapeEvent[];
  escapePatterns: LvsEscapePattern[];
  systemHealth: LvsSystemHealthScore[];
  confidenceReadings: LvsSystemConfidenceReading[];
  adoptionReadings: LvsAdoptionReading[];
  valueReadings: LvsValueReading[];
  genesisProposals: LvsGenesisImprovementProposal[];
  architecturalHistory: LvsArchitecturalHistoryEntry[];
  weeklyReviews: LvsWeeklyReview[];
  diaryPaused: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type LvsPlatformStats = {
  signalCount: number;
  escapeEventCount: number;
  escapeVelocityScore: number;
  diaryPromptCount: number;
  diaryAnswerRate: number;
  systemHealthAverage: number;
  queuedProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  trackedSystems: number;
};

export type LvsReadyView = {
  activeView: LvsDashboardView;
  stats: LvsPlatformStats;
  trackingMetrics: LvsTrackingMetricSnapshot[];
  systemHealth: LvsSystemHealthScore[];
  escapeEvents: LvsEscapeEvent[];
  escapePatterns: LvsEscapePattern[];
  diaryPrompts: LvsDiaryPrompt[];
  diaryAnswers: LvsDiaryAnswer[];
  pendingPrompts: LvsDiaryPrompt[];
  genesisProposals: LvsGenesisImprovementProposal[];
  architecturalHistory: LvsArchitecturalHistoryEntry[];
  weeklyReview: LvsWeeklyReview | null;
  adoptionSummary: { systemId: string; officialName: string; habitScore: number; valueScore: number }[];
};

export type LvsRuntimeInput = {
  pathname?: string;
  companyId?: string;
  founderDisplayName?: string;
};
