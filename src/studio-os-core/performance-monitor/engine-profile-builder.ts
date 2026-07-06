import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildPerformanceBudgets } from './budget-engine';
import {
  buildMetricScores,
  buildPerformanceBottlenecks,
  computeOverallPerformanceScore,
  countBottlenecks,
  countBudgetsExceeded,
  deriveAverageSpeedTrend,
} from './monitor-engine';
import {
  buildDockPerformanceLine,
  buildModulePerformanceReports,
} from './report-engine';
import { buildScenarioSimulations } from './simulation-engine';
import type { OrganizationPerformanceMonitorProfile } from './types';

export function buildOrganizationPerformanceMonitorProfile(
  organizationId: string
): OrganizationPerformanceMonitorProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const metricScores = buildMetricScores(organizationId);
  const bottlenecks = buildPerformanceBottlenecks(organizationId);
  const moduleReports = buildModulePerformanceReports(bottlenecks, now);
  const performanceBudgets = buildPerformanceBudgets(bottlenecks);
  const simulations = buildScenarioSimulations(moduleReports);
  const overallPerformanceScore = computeOverallPerformanceScore(moduleReports);

  const profile: OrganizationPerformanceMonitorProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallPerformanceScore,
    modulesMonitored: moduleReports.length,
    bottlenecksOpen: countBottlenecks(bottlenecks),
    budgetsExceeded: countBudgetsExceeded(performanceBudgets),
    averageSpeedTrend: deriveAverageSpeedTrend(moduleReports),
    metricScores,
    bottlenecks,
    moduleReports,
    performanceBudgets,
    simulations,
    selectedModuleId: moduleReports.find((r) => !r.withinPerformanceBudget)?.moduleId ?? moduleReports[0]?.moduleId ?? null,
    dockPerformanceLine: '',
    performanceIsAFeature: true,
    lastSyncedAt: now,
  };

  profile.dockPerformanceLine = buildDockPerformanceLine(profile);
  return profile;
}
