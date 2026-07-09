import { ensureDecisionEngineStore, readDecisionEngineStore } from './persistence';
import {
  listDecisionRegistry,
  getDecisionRegistryStats,
  searchDecisionRegistry,
  listDecisionsByType,
  listDecisionsByStatus,
  listDecisionsForObject,
  getDecisionTypeCoverage,
  listDecisionsByCorrelation,
} from './decisions/registry';
import {
  submitStudioDecision,
  getStudioDecision,
  advanceStudioDecision,
  applyHumanOverride,
  addDecisionEvidence,
  validateDecisionEnvelope,
  validateDecisionEngineStore,
  createDecisionId,
  createDecisionEvidence,
} from './decisions/engine';
import {
  listCanonicalDecisionTypes,
  getCanonicalDecisionTypeMeta,
  isCanonicalDecisionType,
} from './decision-types/registry';
import {
  issueStudioRecommendation,
  acceptStudioRecommendation,
  rejectStudioRecommendation,
  listStudioRecommendations,
  getStudioRecommendation,
  listPendingRecommendations,
} from './recommendations/engine';
import {
  createStudioPriorityRanking,
  updateStudioPriorityRanking,
  listStudioPriorityRankings,
  getStudioPriorityRanking,
  getTopPriorityObject,
} from './priorities/engine';
import {
  registerStudioStrategy,
  activateStudioStrategy,
  listStudioStrategies,
  getStudioStrategy,
} from './strategies/strategies';
import {
  buildDecisionContext,
  getDecisionContext,
  listDecisionContexts,
  enrichDecisionContext,
  resolveContextForObjects,
} from './context/engine';
import {
  createDecisionEvidence as createEvidenceRecord,
  scoreEvidenceQuality,
  mergeEvidenceRecords,
} from './evidence/model';
import {
  buildDecisionConfidence,
  requiresHumanReview,
  requiresFounderReview,
  calibrateConfidenceFromOutcome,
} from './confidence/model';
import {
  requestDecisionReview,
  beginDecisionReview,
  completeDecisionReview,
  returnDecisionForRevision,
  listDecisionsPendingReview,
  listDecisionsByReviewStatus,
} from './review/review';
import {
  recordDecisionAudit,
  listDecisionAuditLog,
  getDecisionAuditTrail,
  getDecisionAuditStats,
} from './audit/audit';
import {
  recordDecisionHistory,
  listDecisionHistory,
  getDecisionTimeline,
  listSupersededDecisions,
  archiveDecisionOutcome,
} from './history/history';
import {
  recordLearningFeedback,
  listLearningRecords,
  getLearningFeedbackStats,
} from './learning/feedback';
import {
  ingestDecisionPayload,
  ingestDecisionBatch,
  ingestRecommendationPayload,
  ingestStrategyPayload,
} from './content/loader';
import {
  DECISION_ENGINE_SUBSYSTEM_NAME,
  DECISION_ENGINE_SUBSYSTEM_VERSION,
  CANONICAL_DECISION_TYPES,
  DECISION_STATUSES,
  REVIEW_STATUSES,
  CONFIDENCE_LEVELS,
  CONTEXT_SCOPES,
  PRIORITY_LEVELS,
} from './constants';
import type { DecisionEngineRegistryStats } from './types';

export function ensureDecisionEngineSubsystem() {
  return ensureDecisionEngineStore();
}

export function getDecisionEnginePlatformStats(): DecisionEngineRegistryStats {
  const store = readDecisionEngineStore();
  const decisionStats = getDecisionRegistryStats();

  return {
    decisionCount: decisionStats.decisionCount,
    pendingDecisionCount: decisionStats.pendingDecisionCount,
    recommendationCount: store.recommendations.length,
    priorityCount: store.priorities.length,
    strategyCount: store.strategies.length,
    evidenceCount: store.evidenceRecords.length,
    auditEntryCount: store.auditLog.length,
    learningRecordCount: store.learningRecords.length,
    historyEntryCount: store.history.length,
    pendingReviewCount: decisionStats.pendingReviewCount,
  };
}

export {
  DECISION_ENGINE_SUBSYSTEM_NAME,
  DECISION_ENGINE_SUBSYSTEM_VERSION,
  CANONICAL_DECISION_TYPES,
  DECISION_STATUSES,
  REVIEW_STATUSES,
  CONFIDENCE_LEVELS,
  CONTEXT_SCOPES,
  PRIORITY_LEVELS,
  readDecisionEngineStore,
  ensureDecisionEngineStore,
  listDecisionRegistry,
  getDecisionRegistryStats,
  searchDecisionRegistry,
  listDecisionsByType,
  listDecisionsByStatus,
  listDecisionsForObject,
  getDecisionTypeCoverage,
  listDecisionsByCorrelation,
  submitStudioDecision,
  getStudioDecision,
  advanceStudioDecision,
  applyHumanOverride,
  addDecisionEvidence,
  validateDecisionEnvelope,
  validateDecisionEngineStore,
  createDecisionId,
  createDecisionEvidence,
  listCanonicalDecisionTypes,
  getCanonicalDecisionTypeMeta,
  isCanonicalDecisionType,
  issueStudioRecommendation,
  acceptStudioRecommendation,
  rejectStudioRecommendation,
  listStudioRecommendations,
  getStudioRecommendation,
  listPendingRecommendations,
  createStudioPriorityRanking,
  updateStudioPriorityRanking,
  listStudioPriorityRankings,
  getStudioPriorityRanking,
  getTopPriorityObject,
  registerStudioStrategy,
  activateStudioStrategy,
  listStudioStrategies,
  getStudioStrategy,
  buildDecisionContext,
  getDecisionContext,
  listDecisionContexts,
  enrichDecisionContext,
  resolveContextForObjects,
  createEvidenceRecord,
  scoreEvidenceQuality,
  mergeEvidenceRecords,
  buildDecisionConfidence,
  requiresHumanReview,
  requiresFounderReview,
  calibrateConfidenceFromOutcome,
  requestDecisionReview,
  beginDecisionReview,
  completeDecisionReview,
  returnDecisionForRevision,
  listDecisionsPendingReview,
  listDecisionsByReviewStatus,
  recordDecisionAudit,
  listDecisionAuditLog,
  getDecisionAuditTrail,
  getDecisionAuditStats,
  recordDecisionHistory,
  listDecisionHistory,
  getDecisionTimeline,
  listSupersededDecisions,
  archiveDecisionOutcome,
  recordLearningFeedback,
  listLearningRecords,
  getLearningFeedbackStats,
  ingestDecisionPayload,
  ingestDecisionBatch,
  ingestRecommendationPayload,
  ingestStrategyPayload,
};

export type {
  DecisionEngineRegistryStats,
  StudioDecision,
  StudioRecommendation,
  StudioPriorityRanking,
  StudioStrategy,
  DecisionValidationReport,
  DecisionContextPackage,
  DecisionEvidenceRecord,
  DecisionConfidenceRecord,
  DecisionLearningRecord,
  HumanOverrideRecord,
} from './types';

export type { SubmitDecisionInput } from './decisions/engine';
export type { DecisionPayload, RecommendationPayload, StrategyPayload } from './content/loader';
