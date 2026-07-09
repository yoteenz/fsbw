import {
  FAT_DASHBOARD_VIEWS,
  FAT_PIPELINE_STAGE_LABELS,
  type FatDashboardView,
} from '../constants';
import type { FatPlatformStats, FatReadyView } from '../types';
import { aggregatePlatformMetricTrends } from '../metrics/metric-engine';
import { listGenesisLearnings } from '../genesis-feedback/feedback-engine';
import { listGraduatedSystems } from '../graduation/graduation-engine';
import {
  buildLaunchStackProgress,
  buildPipelineSummary,
  listOutstandingIssues,
} from '../launch-stack/progress';
import { listValidationRegistry } from '../validation/registry';

/** Founder Testing Dashboard™ — assembles all validation views */
export function buildFounderTestingDashboard(
  activeView: FatDashboardView = 'validation-dashboard'
): FatReadyView {
  const records = listValidationRegistry();

  return {
    activeView,
    records,
    launchStack: buildLaunchStackProgress(),
    metricTrends: aggregatePlatformMetricTrends(),
    genesisLearnings: listGenesisLearnings(),
    outstandingIssues: listOutstandingIssues(),
    graduatedSystems: listGraduatedSystems(),
    pipelineSummary: buildPipelineSummary().map((p) => ({
      stage: p.stage,
      count: p.count,
      label: FAT_PIPELINE_STAGE_LABELS[p.stage],
    })),
  };
}

export function getFounderAcceptancePlatformStats(): FatPlatformStats {
  const records = listValidationRegistry();
  const launchStack = buildLaunchStackProgress();
  const issues = listOutstandingIssues();
  const graduated = listGraduatedSystems();

  const founderScores = records
    .filter((r) => r.launchStackMilestone)
    .map((r) => r.founderAcceptanceScore);

  const averageFounderScore =
    founderScores.length > 0
      ? Math.round(founderScores.reduce((a, b) => a + b, 0) / founderScores.length)
      : 0;

  return {
    systemCount: records.length,
    graduatedCount: graduated.length,
    pendingFounderAcceptance: records.filter((r) => {
      const gate = r.gates.find((g) => g.level === 'founder-acceptance');
      return gate?.status === 'pending' || gate?.status === 'conditional';
    }).length,
    outstandingIssueCount: issues.length,
    criticalIssueCount: issues.filter((i) => i.severity === 'critical').length,
    averageFounderScore,
    launchStackCompleteCount: launchStack.filter((m) => m.launchStackComplete).length,
    launchStackTotal: launchStack.length,
  };
}

export function isValidDashboardView(view: string): view is FatDashboardView {
  return (FAT_DASHBOARD_VIEWS as readonly string[]).includes(view);
}

export const FAT_VALIDATION_PIPELINE = [
  'Architecture',
  'Implementation',
  'Founder Acceptance Testing™',
  'Genesis Feedback™',
  'Launch Stack Graduation™',
  'Platform Ready™',
] as const;
