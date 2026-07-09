import type {
  FatDashboardView,
  FatGateStatus,
  FatMetricId,
  FatPipelineStage,
  FatValidationLevel,
} from './constants';

export type FatMetricSnapshot = {
  metricId: FatMetricId;
  label: string;
  score: number;
  trend: 'up' | 'down' | 'flat';
  evidenceCount: number;
  lastUpdatedAt: string;
  note?: string;
};

export type FatGateRecord = {
  level: FatValidationLevel;
  status: FatGateStatus;
  score?: number;
  passedAt?: string;
  blocker?: string;
  evidenceIds: string[];
};

export type FatEvidenceItem = {
  evidenceId: string;
  systemId: string;
  kind:
    | 'architecture-article'
    | 'build-log'
    | 'screenshot'
    | 'usage-log'
    | 'founder-narrative'
    | 'test-result'
    | 'metric-reading'
    | 'genesis-feedback';
  title: string;
  detail: string;
  source: string;
  level: FatValidationLevel;
  createdAt: string;
};

export type FatWithdrawalTestResult = {
  testId: string;
  systemId: string;
  passed: boolean;
  criteriaMet: number;
  criteriaTotal: number;
  founderWouldMiss: boolean;
  frictionWithoutSystem: string;
  completedAt?: string;
  notes: string[];
};

export type FatReplacementTestResult = {
  testId: string;
  systemId: string;
  passed: boolean;
  replacedTools: string[];
  retainedTools: string[];
  workflowComparison: string;
  completedAt?: string;
};

export type FatDelightSignal = {
  signalId: string;
  systemId: string;
  present: boolean;
  signals: ('confidence' | 'calm' | 'surprise' | 'joy' | 'momentum')[];
  founderQuote?: string;
  recordedAt?: string;
};

export type FatGenesisFeedbackPacket = {
  packetId: string;
  systemId: string;
  assumptionsChanged: string[];
  genesisUpdates: string[];
  promote: boolean;
  revise: boolean;
  block: boolean;
  learningSummary: string;
  submittedAt?: string;
};

export type FatValidationHistoryEntry = {
  entryId: string;
  systemId: string;
  action: 'gate-pass' | 'gate-fail' | 'score-update' | 'evidence-added' | 'graduation' | 'retry';
  level?: FatValidationLevel;
  detail: string;
  actor: string;
  timestamp: string;
};

export type FatOutstandingIssue = {
  issueId: string;
  systemId: string;
  severity: 'critical' | 'major' | 'minor';
  title: string;
  detail: string;
  blocksGraduation: boolean;
  createdAt: string;
};

export type FatValidationRecord = {
  recordId: string;
  systemId: string;
  officialName: string;
  purpose: string;
  pipelineStage: FatPipelineStage;
  gates: FatGateRecord[];
  overallScore: number;
  founderAcceptanceScore: number;
  metrics: FatMetricSnapshot[];
  withdrawalTest: FatWithdrawalTestResult;
  replacementTest: FatReplacementTestResult;
  delight: FatDelightSignal;
  genesisFeedback: FatGenesisFeedbackPacket;
  evidence: FatEvidenceItem[];
  outstandingIssues: FatOutstandingIssue[];
  graduated: boolean;
  graduatedAt?: string;
  launchStackMilestone: boolean;
  articlePath?: string;
  runtimePath?: string;
  updatedAt: string;
};

export type FatStore = {
  version: string;
  records: FatValidationRecord[];
  history: FatValidationHistoryEntry[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type FatLaunchStackMilestone = {
  systemId: string;
  officialName: string;
  pipelineStage: FatPipelineStage;
  architecturePass: boolean;
  implementationPass: boolean;
  founderAcceptanceStatus: FatGateStatus;
  genesisFeedbackComplete: boolean;
  launchStackComplete: boolean;
  overallScore: number;
};

export type FatMetricTrendPoint = {
  metricId: FatMetricId;
  label: string;
  points: { date: string; score: number }[];
  currentScore: number;
  delta30d: number;
};

export type FatGenesisLearning = {
  learningId: string;
  systemId: string;
  systemName: string;
  summary: string;
  assumptionsChanged: string[];
  genesisUpdates: string[];
  recordedAt: string;
};

export type FatGraduatedSystem = {
  systemId: string;
  officialName: string;
  graduatedAt: string;
  founderAcceptanceScore: number;
  levelsGraduated: FatValidationLevel[];
  evidenceCount: number;
};

export type FatPlatformStats = {
  systemCount: number;
  graduatedCount: number;
  pendingFounderAcceptance: number;
  outstandingIssueCount: number;
  criticalIssueCount: number;
  averageFounderScore: number;
  launchStackCompleteCount: number;
  launchStackTotal: number;
};

export type FatReadyView = {
  activeView: FatDashboardView;
  records: FatValidationRecord[];
  launchStack: FatLaunchStackMilestone[];
  metricTrends: FatMetricTrendPoint[];
  genesisLearnings: FatGenesisLearning[];
  outstandingIssues: FatOutstandingIssue[];
  graduatedSystems: FatGraduatedSystem[];
  pipelineSummary: { stage: FatPipelineStage; label: string; count: number }[];
};
