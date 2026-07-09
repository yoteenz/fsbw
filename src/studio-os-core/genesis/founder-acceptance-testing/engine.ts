import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import { ensureOrbSubsystem } from '../orb/engine';
import {
  ensureFounderAcceptanceTestingStore,
  recordFatOpened,
  seedFounderAcceptanceTestingStore,
} from './bootstrap/seed';
import {
  buildFounderTestingDashboard,
  getFounderAcceptancePlatformStats,
  isValidDashboardView,
  FAT_VALIDATION_PIPELINE,
} from './founder-testing/dashboard';
import { listValidationRegistry, getValidationRecord } from './validation/registry';
import { aggregatePlatformMetricTrends, computeMetricSnapshotsForRecord } from './metrics/metric-engine';
import { listAllEvidence, buildEvidenceSummary } from './evidence/evidence-engine';
import { evaluateWithdrawalTest } from './withdrawal-test/withdrawal-engine';
import { evaluateReplacementTest } from './replacement-test/replacement-engine';
import { buildGenesisFeedbackPacket, listGenesisLearnings } from './genesis-feedback/feedback-engine';
import { listValidationHistory, recentValidationActivity } from './validation-history/history-engine';
import { listGraduatedSystems, canGraduateToNextLevel } from './graduation/graduation-engine';
import {
  buildLaunchStackProgress,
  summarizeLaunchStackProgress,
  listOutstandingIssues,
  buildPipelineSummary,
} from './launch-stack/progress';
import {
  mutateFounderAcceptanceTestingStore,
  readFounderAcceptanceTestingStore,
} from './persistence';
import {
  FAT_SUBSYSTEM_NAME,
  FAT_SUBSYSTEM_VERSION,
  FAT_PASS_THRESHOLD,
  FAT_DASHBOARD_VIEW_LABELS,
  type FatDashboardView,
} from './constants';

export function ensureFounderAcceptanceTestingSubsystem() {
  ensureOrbSubsystem();
  const store = ensureFounderAcceptanceTestingStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('founder-acceptance-testing', 'implemented');
  }
  return store;
}

export function getFounderAcceptanceTestingReadyView(
  activeView: FatDashboardView = 'validation-dashboard'
) {
  ensureFounderAcceptanceTestingSubsystem();
  recordFatOpened();
  return buildFounderTestingDashboard(activeView);
}

export {
  FAT_SUBSYSTEM_NAME,
  FAT_SUBSYSTEM_VERSION,
  FAT_PASS_THRESHOLD,
  FAT_VALIDATION_PIPELINE,
  FAT_DASHBOARD_VIEW_LABELS,
  isValidDashboardView,
  readFounderAcceptanceTestingStore,
  mutateFounderAcceptanceTestingStore,
  seedFounderAcceptanceTestingStore,
  ensureFounderAcceptanceTestingStore,
  recordFatOpened,
  buildFounderTestingDashboard,
  getFounderAcceptancePlatformStats,
  listValidationRegistry,
  getValidationRecord,
  aggregatePlatformMetricTrends,
  computeMetricSnapshotsForRecord,
  listAllEvidence,
  buildEvidenceSummary,
  evaluateWithdrawalTest,
  evaluateReplacementTest,
  buildGenesisFeedbackPacket,
  listGenesisLearnings,
  listValidationHistory,
  recentValidationActivity,
  listGraduatedSystems,
  canGraduateToNextLevel,
  buildLaunchStackProgress,
  summarizeLaunchStackProgress,
  listOutstandingIssues,
  buildPipelineSummary,
};

export type {
  FatStore,
  FatReadyView,
  FatPlatformStats,
  FatValidationRecord,
  FatMetricSnapshot,
  FatMetricTrendPoint,
  FatLaunchStackMilestone,
  FatGenesisLearning,
  FatGraduatedSystem,
  FatOutstandingIssue,
  FatEvidenceItem,
  FatWithdrawalTestResult,
  FatReplacementTestResult,
  FatGenesisFeedbackPacket,
  FatValidationHistoryEntry,
} from './types';

export type { FatDashboardView, FatValidationLevel, FatGateStatus, FatMetricId } from './constants';
