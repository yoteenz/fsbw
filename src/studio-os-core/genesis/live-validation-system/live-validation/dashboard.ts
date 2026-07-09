import {
  LVS_DASHBOARD_VIEWS,
  LVS_DASHBOARD_VIEW_LABELS,
  type LvsDashboardView,
} from '../constants';
import type { LvsPlatformStats, LvsReadyView, LvsWeeklyReview } from '../types';
import { listPendingDiaryPrompts, listDiaryPrompts, listDiaryAnswers, computeDiaryAnswerRate } from '../founder-diary/diary-engine';
import {
  listEscapeEvents,
  listEscapePatterns,
  computePlatformEscapeVelocityScore,
} from '../escape-velocity/escape-velocity-engine';
import {
  listSystemHealthScores,
  buildTrackingMetricSnapshots,
  computeOverallSystemHealthAverage,
} from '../system-health/health-engine';
import { buildAdoptionSummary } from '../adoption/adoption-engine';
import {
  listImprovementProposals,
  listArchitecturalHistory,
  countProposalsByStatus,
} from '../genesis-learning/proposal-engine';
import { readLiveValidationSystemStore } from '../persistence';

export function getLiveValidationPlatformStats(): LvsPlatformStats {
  const store = readLiveValidationSystemStore();
  const proposalCounts = countProposalsByStatus();

  return {
    signalCount: store.signals.length,
    escapeEventCount: store.escapeEvents.length,
    escapeVelocityScore: computePlatformEscapeVelocityScore(),
    diaryPromptCount: store.diaryPrompts.length,
    diaryAnswerRate: computeDiaryAnswerRate(),
    systemHealthAverage: computeOverallSystemHealthAverage(),
    queuedProposals: proposalCounts.queued + proposalCounts['under-review'],
    acceptedProposals: proposalCounts.accepted,
    rejectedProposals: proposalCounts.rejected,
    trackedSystems: store.systemHealth.length,
  };
}

function buildWeeklyReview(): LvsWeeklyReview | null {
  const store = readLiveValidationSystemStore();
  if (store.weeklyReviews.length === 0) return null;
  return store.weeklyReviews[store.weeklyReviews.length - 1];
}

export function buildLiveValidationReadyView(
  activeView: LvsDashboardView = 'overview'
): LvsReadyView {
  const stats = getLiveValidationPlatformStats();

  return {
    activeView,
    stats,
    trackingMetrics: buildTrackingMetricSnapshots(),
    systemHealth: listSystemHealthScores(),
    escapeEvents: listEscapeEvents(20),
    escapePatterns: listEscapePatterns(),
    diaryPrompts: listDiaryPrompts(20),
    diaryAnswers: listDiaryAnswers(20),
    pendingPrompts: listPendingDiaryPrompts(),
    genesisProposals: listImprovementProposals(),
    architecturalHistory: listArchitecturalHistory(30),
    weeklyReview: buildWeeklyReview(),
    adoptionSummary: buildAdoptionSummary(),
  };
}

export function isValidLvsDashboardView(view: string): view is LvsDashboardView {
  return (LVS_DASHBOARD_VIEWS as readonly string[]).includes(view);
}

export { LVS_DASHBOARD_VIEW_LABELS };
