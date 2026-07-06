import { RELEASE_GATE_LABELS } from './constants';
import type { ExecutiveApprovalBrief, ProductionReadinessReport } from './types';

export function buildExecutiveApprovalBriefs(
  reports: ProductionReadinessReport[],
  now: string
): ExecutiveApprovalBrief[] {
  return reports.map((report) => ({
    id: `executive-brief-${report.releaseId}`,
    releaseId: report.releaseId,
    whatChanged: `${report.releaseLabel} — updates across ${report.blockedSystems.length > 0 ? report.blockedSystems.slice(0, 3).join(', ') : 'Mission Control, QA chain, and Intelligence wing'}. ${report.approvalsGranted}/${report.approvalsRequired} discipline approvals granted.`,
    whyItChanged: 'Continuous improvement across Studio OS QA intelligence chain — Design Compliance through Regression Engine integration, plus performance and accessibility refinements.',
    expectedImpact: report.releaseGate === 'production-ready'
      ? 'Positive — premium experience preserved. Users receive verified, discipline-approved improvements.'
      : 'Conditional — benefits available after remaining approvals. Minimal user disruption if deployed with feature flags.',
    potentialRisks: report.openIssues.length > 0
      ? report.openIssues.slice(0, 3).join(' · ')
      : 'No significant risks identified — all major disciplines approved.',
    rollbackPlan: report.rollbackPreparedness,
    recommendedDeploymentStrategy:
      report.releaseGate === 'production-ready'
        ? 'Canary deploy to 10% organizations · monitor Performance Monitor and Regression Engine for 24h · full rollout.'
        : report.releaseGate === 'ready-for-executive-review'
          ? 'Executive sign-off required · staged QA environment verification · phased rollout with feature flags.'
          : 'Do not deploy to production · resolve blocked disciplines · re-run Release Readiness™ verification.',
    studioIntelligenceSummary: `Studio Intelligence™ briefing: ${report.releaseLabel} readiness ${report.overallReadinessScore}% · confidence ${report.confidence}% · risk ${report.riskLevel}. ${RELEASE_GATE_LABELS[report.releaseGate]}. Performance: ${report.performanceSummary} Design: ${report.designSummary} Security: ${report.securitySummary}`,
    executiveVerdict:
      report.releaseGate === 'production-ready'
        ? 'Recommended for production — release has earned the right to reach users.'
        : report.releaseGate === 'ready-for-executive-review'
          ? 'Executive review required — most disciplines approved, remaining risks manageable with rollback plan.'
          : 'Hold deployment — production is a privilege. Resolve open issues before advancing.',
    briefedAt: now,
  }));
}

export function getExecutiveBriefForRelease(
  briefs: ExecutiveApprovalBrief[],
  releaseId: string
): ExecutiveApprovalBrief | null {
  return briefs.find((b) => b.releaseId === releaseId) ?? briefs[0] ?? null;
}
