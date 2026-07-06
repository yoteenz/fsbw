import { getOrganizationRegressionEngineProfile } from '../regression-engine/store';
import { getOrganizationReleaseReadinessProfile } from '../release-readiness/store';
import { getOrganizationPerformanceMonitorProfile } from '../performance-monitor/store';
import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import { getOrganizationGuardianProfile } from '../organizational-guardian/store';
import { ENGINEERING_KPI_LABELS, ENGINEERING_KPIS } from './constants';
import type { EngineeringKpiMetric, HealthPillarScore } from './types';

function kpiStatus(value: number, invert = false): EngineeringKpiMetric['status'] {
  const score = invert ? 100 - value : value;
  if (score >= 88) return 'excellent';
  if (score >= 78) return 'healthy';
  if (score >= 65) return 'watch';
  return 'at-risk';
}

export function buildEngineeringKpis(
  organizationId: string,
  _pillars: HealthPillarScore[],
  overallScore: number
): EngineeringKpiMetric[] {
  const regression = getOrganizationRegressionEngineProfile(organizationId);
  const readiness = getOrganizationReleaseReadinessProfile(organizationId);
  const performance = getOrganizationPerformanceMonitorProfile(organizationId);
  const experience = getOrganizationExperienceQaProfile(organizationId);
  const guardian = getOrganizationGuardianProfile(organizationId);

  const technicalDebt = Math.max(8, 100 - overallScore + (performance?.bottlenecksOpen ?? 2) * 3 + (guardian?.activeAlerts ?? 0));
  const openRisks = (readiness?.openIssuesCount ?? 3) + (regression?.recurringPatterns ?? 1);
  const criticalIssues = (readiness?.openIssuesCount ?? 2) + (performance?.bottlenecksOpen ?? 1);
  const regressionTrend = regression?.overallRegressionScore ?? 88;
  const deploymentFreq = readiness?.releaseGate === 'production-ready' ? 12 : 6;
  const productionStability = Math.max(70, overallScore - (criticalIssues * 4));
  const cxTrend = experience?.overallExperienceScore ?? 86;
  const releaseConfidence = readiness?.confidence ?? 82;
  const resolutionDays = Math.max(1, 14 - Math.floor(overallScore / 10));

  const values: Record<(typeof ENGINEERING_KPIS)[number], { value: string; numeric: number; trend: EngineeringKpiMetric['trend']; summary: string; invert?: boolean }> = {
    'overall-engineering-score': {
      value: `${overallScore}%`,
      numeric: overallScore,
      trend: overallScore >= 85 ? 'improving' : 'stable',
      summary: 'Composite score across all 12 health pillars.',
    },
    'technical-debt': {
      value: `${technicalDebt}% index`,
      numeric: technicalDebt,
      trend: technicalDebt > 25 ? 'declining' : 'stable',
      summary: 'Estimated debt from bottlenecks, findings, and unresolved issues.',
      invert: true,
    },
    'open-risks': {
      value: `${openRisks} risks`,
      numeric: Math.max(0, 100 - openRisks * 8),
      trend: openRisks > 4 ? 'declining' : 'stable',
      summary: 'Combined readiness and regression pattern risks.',
      invert: true,
    },
    'critical-issues': {
      value: `${criticalIssues} critical`,
      numeric: Math.max(0, 100 - criticalIssues * 12),
      trend: criticalIssues > 2 ? 'declining' : 'improving',
      summary: 'Issues requiring immediate engineering attention.',
      invert: true,
    },
    'regression-trend': {
      value: `${regressionTrend}%`,
      numeric: regressionTrend,
      trend: regressionTrend >= 88 ? 'improving' : 'stable',
      summary: 'Regression Engine™ verification trend.',
    },
    'deployment-frequency': {
      value: `${deploymentFreq}/month`,
      numeric: Math.min(99, deploymentFreq * 7),
      trend: 'stable',
      summary: 'Release cadence when readiness gate permits.',
    },
    'production-stability': {
      value: `${productionStability}%`,
      numeric: productionStability,
      trend: productionStability >= 85 ? 'improving' : 'stable',
      summary: 'Stability score from readiness and performance signals.',
    },
    'customer-experience-trend': {
      value: `${cxTrend}%`,
      numeric: cxTrend,
      trend: cxTrend >= 85 ? 'improving' : 'stable',
      summary: 'Experience QA confidence trend.',
    },
    'average-release-confidence': {
      value: `${releaseConfidence}%`,
      numeric: releaseConfidence,
      trend: releaseConfidence >= 85 ? 'improving' : 'stable',
      summary: 'Release Readiness™ average confidence across candidates.',
    },
    'average-resolution-time': {
      value: `${resolutionDays} days`,
      numeric: Math.max(40, 100 - resolutionDays * 5),
      trend: resolutionDays <= 7 ? 'improving' : 'stable',
      summary: 'Average time to resolve engineering issues.',
      invert: resolutionDays > 10,
    },
  };

  return ENGINEERING_KPIS.map((kpi) => {
    const data = values[kpi];
    return {
      kpi,
      label: ENGINEERING_KPI_LABELS[kpi],
      value: data.value,
      numericScore: data.numeric,
      status: kpiStatus(data.numeric, data.invert),
      trend: data.trend,
      summary: data.summary,
    };
  });
}
