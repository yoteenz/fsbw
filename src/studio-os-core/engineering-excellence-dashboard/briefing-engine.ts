import { RELEASE_GATE_LABELS } from '../release-readiness/constants';
import { getOrganizationReleaseReadinessProfile } from '../release-readiness/store';
import type { ExecutiveEngineeringBrief, HealthPillarScore } from './types';

export function buildExecutiveEngineeringBrief(
  organizationId: string,
  pillars: HealthPillarScore[],
  overallScore: number,
  now: string
): ExecutiveEngineeringBrief {
  const readiness = getOrganizationReleaseReadinessProfile(organizationId);
  const improving = pillars.filter((p) => p.trend === 'improving').map((p) => p.label);
  const atRisk = pillars.filter((p) => p.status === 'at-risk' || p.status === 'watch').map((p) => p.label);
  const excellent = pillars.filter((p) => p.status === 'excellent').map((p) => p.label);

  const achievements = [
    excellent.length > 0 ? `${excellent.length} pillars at excellent status` : 'Engineering baseline established',
    improving.length > 0 ? `${improving.slice(0, 3).join(', ')} improving` : 'Stability maintained across QA chain',
    overallScore >= 85 ? 'Overall engineering score above world-class threshold' : 'Continuous improvement trajectory active',
  ];

  const priorities = atRisk.length > 0
    ? atRisk.slice(0, 4).map((p) => `Elevate ${p} to healthy status`)
    : ['Maintain zero-regression release cadence', 'Advance Release Readiness to Production Ready'];

  const growingRisks = atRisk.length > 0
    ? atRisk.map((p) => `${p} requires investment before next release`)
    : ['No critical engineering risks — monitor performance and regression trends'];

  const investments = [
    atRisk.includes('Performance') ? 'Performance budget optimization sprint' : 'Continue performance monitoring discipline',
    atRisk.includes('Regression Status') ? 'Regression Historical Memory™ pattern remediation' : 'Maintain regression replay coverage',
    'Documentation Sync™ freshness for new intelligence wing modules',
    'Engineering Culture™ celebration program for team of one',
  ];

  const upcomingReadiness = readiness
    ? `${readiness.approvalsGranted}/${readiness.approvalsRequired} approvals · ${RELEASE_GATE_LABELS[readiness.releaseGate]} · confidence ${readiness.confidence}%`
    : 'Release Readiness™ sync pending — run discipline verification.';

  return {
    id: 'executive-engineering-brief',
    engineeringAchievements: achievements,
    currentPriorities: priorities,
    growingRisks,
    improvingSystems: improving.length > 0 ? improving : pillars.filter((p) => p.status === 'healthy').slice(0, 4).map((p) => p.label),
    suggestedInvestments: investments.slice(0, 4),
    upcomingReleaseReadiness: upcomingReadiness,
    studioIntelligenceSummary: `Studio Intelligence™ Engineering Brief: Score ${overallScore}% · ${excellent.length} excellent · ${atRisk.length} watch/at-risk · ${improving.length} improving. ${upcomingReadiness}`,
    briefedAt: now,
  };
}
