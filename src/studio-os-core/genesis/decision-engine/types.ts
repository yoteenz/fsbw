import type {
  CanonicalDecisionTypeId,
  ConfidenceLevel,
  ContextScope,
  ContextTimeframe,
  DecisionAuditLevel,
  DecisionStatus,
  DecisionVisibility,
  PriorityLevel,
  ReviewStatus,
  ReviewThreshold,
} from './constants';
import type { GenesisVersion } from '../types';

export type DecisionIntent = {
  intentId: string;
  summary: string;
  sourceObjectId?: string;
  interpretedAt: string;
};

export type DecisionContextPackage = {
  contextId: string;
  scope: ContextScope;
  timeframe: ContextTimeframe;
  constraintObjectIds: string[];
  relevantObjectIds: string[];
  summary?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DecisionEvidenceRecord = {
  evidenceId: string;
  sourceObjectId: string;
  confidence: ConfidenceLevel;
  summary: string;
  relevance?: string;
  createdAt: string;
};

export type DecisionConfidenceRecord = {
  score: number;
  level: ConfidenceLevel;
  rationale: string;
  calibratedAt: string;
};

export type DecisionAlternative = {
  alternativeId: string;
  summary: string;
  rejectedBecause?: string;
  relatedDecisionId?: string;
};

export type DecisionTradeoff = {
  option: string;
  benefit: string;
  cost: string;
  risk: string;
};

export type DecisionAuditRecord = {
  auditId: string;
  level: DecisionAuditLevel;
  action: string;
  actorObjectId?: string;
  notes?: string;
  createdAt: string;
};

export type DecisionLearningRecord = {
  learningId: string;
  observation: string;
  outcome?: string;
  adjustment?: string;
  memoryObjectId?: string;
  createdAt: string;
};

export type HumanOverrideRecord = {
  overrideId: string;
  actorObjectId: string;
  reason: string;
  previousStatus: DecisionStatus;
  newStatus: DecisionStatus;
  createdAt: string;
};

/** Universal Decision envelope */
export type StudioDecision = {
  decisionId: string;
  decisionType: CanonicalDecisionTypeId | string;
  version: GenesisVersion;
  officialName: string;
  purpose?: string;
  status: DecisionStatus;
  initiatorObjectId: string;
  decisionMakerObjectId: string;
  affectedObjectIds: string[];
  intent: DecisionIntent;
  context: DecisionContextPackage;
  evidence: DecisionEvidenceRecord[];
  confidence: DecisionConfidenceRecord;
  recommendation?: string;
  reasoning: { summary: string; steps: string[] };
  tradeoffs: DecisionTradeoff[];
  alternatives: DecisionAlternative[];
  dependencies: string[];
  reviewStatus: ReviewStatus;
  reviewThreshold?: ReviewThreshold;
  reviewerObjectIds: string[];
  humanOverrides: HumanOverrideRecord[];
  auditHistory: DecisionAuditRecord[];
  learningHistory: DecisionLearningRecord[];
  visibility: DecisionVisibility;
  metadata: Record<string, unknown>;
  correlationId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StudioRecommendation = {
  recommendationId: string;
  decisionId: string;
  officialName: string;
  recommendedAction: string;
  explanation: string;
  confidence: DecisionConfidenceRecord;
  alternatives: DecisionAlternative[];
  status: 'pending' | 'accepted' | 'rejected' | 'modified' | 'expired';
  recipientObjectId: string;
  sourceObjectId: string;
  createdAt: string;
  updatedAt: string;
};

export type StudioPriorityRanking = {
  priorityId: string;
  decisionId?: string;
  ownerObjectId: string;
  level: PriorityLevel;
  rankedItems: { objectId: string; rank: number; rationale?: string }[];
  rationale: string;
  createdAt: string;
  updatedAt: string;
};

export type StudioStrategy = {
  strategyId: string;
  decisionId?: string;
  officialName: string;
  description: string;
  goalObjectIds: string[];
  ownerObjectId: string;
  guardrails: string[];
  successMeasures: string[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type StudioDecisionHistoryEntry = {
  historyId: string;
  decisionId: string;
  status: DecisionStatus;
  summary: string;
  actorObjectId?: string;
  recordedAt: string;
};

export type DecisionEngineStore = {
  version: string;
  decisions: StudioDecision[];
  recommendations: StudioRecommendation[];
  priorities: StudioPriorityRanking[];
  strategies: StudioStrategy[];
  contextPackages: DecisionContextPackage[];
  evidenceRecords: DecisionEvidenceRecord[];
  auditLog: DecisionAuditRecord[];
  learningRecords: DecisionLearningRecord[];
  history: StudioDecisionHistoryEntry[];
  bootstrappedAt?: string;
};

export type DecisionEngineRegistryStats = {
  decisionCount: number;
  pendingDecisionCount: number;
  recommendationCount: number;
  priorityCount: number;
  strategyCount: number;
  evidenceCount: number;
  auditEntryCount: number;
  learningRecordCount: number;
  historyEntryCount: number;
  pendingReviewCount: number;
};

export type DecisionValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; decisionId?: string }[];
};
