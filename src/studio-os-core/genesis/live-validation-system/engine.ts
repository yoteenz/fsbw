import { ensureFounderAcceptanceTestingSubsystem } from '../founder-acceptance-testing/engine';
import {
  ensureLiveValidationSystemStore,
  recordLiveValidationOpened,
  seedLiveValidationSystemStore,
  setDiaryPaused,
} from './bootstrap/seed';
import {
  buildLiveValidationReadyView,
  getLiveValidationPlatformStats,
  isValidLvsDashboardView,
  LVS_DASHBOARD_VIEW_LABELS,
} from './live-validation/dashboard';
import {
  listDiaryPrompts,
  listPendingDiaryPrompts,
  listDiaryAnswers,
  buildAdaptiveDiaryPrompt,
  recordDiaryAnswer,
  computeDiaryAnswerRate,
} from './founder-diary/diary-engine';
import {
  listEscapeEvents,
  listEscapePatterns,
  computePlatformEscapeVelocityScore,
  logEscapeEvent,
  classifyEscapeOutcome,
} from './escape-velocity/escape-velocity-engine';
import {
  listSystemHealthScores,
  getSystemHealthScore,
  buildTrackingMetricSnapshots,
  recomputeAllSystemHealth,
  listValidationSignals,
} from './system-health/health-engine';
import {
  listConfidenceReadings,
  getLatestConfidenceReading,
  computeConfidenceScore,
} from './system-confidence/confidence-engine';
import {
  listAdoptionReadings,
  buildAdoptionSummary,
  computeAdoptionReading,
} from './adoption/adoption-engine';
import {
  listValueReadings,
  computeValueReading,
} from './value-tracking/value-engine';
import {
  listAllLearningCandidates,
} from './genesis-learning/learning-engine';
import {
  listImprovementProposals,
  createGenesisImprovementProposal,
  reviewGenesisProposal,
  syncLearningCandidatesToProposals,
  listArchitecturalHistory,
  countProposalsByStatus,
} from './genesis-learning/proposal-engine';
import {
  mutateLiveValidationSystemStore,
  readLiveValidationSystemStore,
} from './persistence';
import {
  LVS_SUBSYSTEM_NAME,
  LVS_SUBSYSTEM_VERSION,
  type LvsDashboardView,
} from './constants';

export function ensureLiveValidationSystemSubsystem() {
  ensureFounderAcceptanceTestingSubsystem();
  const store = ensureLiveValidationSystemStore();
  syncLearningCandidatesToProposals();
  return store;
}

export function getLiveValidationSystemReadyView(activeView: LvsDashboardView = 'overview') {
  ensureLiveValidationSystemSubsystem();
  recordLiveValidationOpened();
  return buildLiveValidationReadyView(activeView);
}

export {
  LVS_SUBSYSTEM_NAME,
  LVS_SUBSYSTEM_VERSION,
  LVS_DASHBOARD_VIEW_LABELS,
  isValidLvsDashboardView,
  readLiveValidationSystemStore,
  mutateLiveValidationSystemStore,
  seedLiveValidationSystemStore,
  ensureLiveValidationSystemStore,
  recordLiveValidationOpened,
  setDiaryPaused,
  buildLiveValidationReadyView,
  getLiveValidationPlatformStats,
  listDiaryPrompts,
  listPendingDiaryPrompts,
  listDiaryAnswers,
  buildAdaptiveDiaryPrompt,
  recordDiaryAnswer,
  computeDiaryAnswerRate,
  listEscapeEvents,
  listEscapePatterns,
  computePlatformEscapeVelocityScore,
  logEscapeEvent,
  classifyEscapeOutcome,
  listSystemHealthScores,
  getSystemHealthScore,
  buildTrackingMetricSnapshots,
  recomputeAllSystemHealth,
  listValidationSignals,
  listConfidenceReadings,
  getLatestConfidenceReading,
  computeConfidenceScore,
  listAdoptionReadings,
  buildAdoptionSummary,
  computeAdoptionReading,
  listValueReadings,
  computeValueReading,
  listAllLearningCandidates,
  listImprovementProposals,
  createGenesisImprovementProposal,
  reviewGenesisProposal,
  syncLearningCandidatesToProposals,
  listArchitecturalHistory,
  countProposalsByStatus,
};

export type {
  LvsStore,
  LvsReadyView,
  LvsPlatformStats,
  LvsSystemHealthScore,
  LvsEscapeEvent,
  LvsEscapePattern,
  LvsDiaryPrompt,
  LvsDiaryAnswer,
  LvsGenesisImprovementProposal,
  LvsArchitecturalHistoryEntry,
  LvsTrackingMetricSnapshot,
  LvsWeeklyReview,
  LvsRuntimeInput,
} from './types';

export type { LvsDashboardView, LvsTrackingMetricId, LvsEscapeClassification, LvsProposalStatus } from './constants';
