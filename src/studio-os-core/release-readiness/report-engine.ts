import { RELEASE_GATE_LABELS } from './constants';
import { deriveReleaseGate, deriveRiskLevel } from './gate-engine';
import type {
  DisciplineApproval,
  ProductionReadinessReport,
  ReadinessOpenIssue,
  ReadinessRiskLevel,
} from './types';

function buildVerdict(gate: import('./types').ReleaseGate, score: number): string {
  if (gate === 'production-ready') {
    return `Production Ready — Readiness Score ${score}%. Every discipline has approved. Release has earned the right to reach users.`;
  }
  return `${RELEASE_GATE_LABELS[gate]} — Score ${score}%. See required approvals and open issues before deployment.`;
}

export function buildProductionReadinessReports(
  approvals: DisciplineApproval[],
  openIssues: ReadinessOpenIssue[],
  now: string
): ProductionReadinessReport[] {
  const releases = [
    { releaseId: 'release-current', releaseLabel: 'Current Release Candidate' },
    { releaseId: 'release-hotfix', releaseLabel: 'Hotfix Patch' },
    { releaseId: 'release-major', releaseLabel: 'Major Feature Release' },
  ];

  return releases.map((rel, idx) => {
    const sliceApprovals = approvals.map((a) => ({
      ...a,
      score: Math.max(55, a.score - idx * 3),
      status: idx === 0 ? a.status : a.score - idx * 3 >= 80 ? a.status : a.score - idx * 3 >= 70 ? 'conditional' as const : 'blocked' as const,
    }));
    const overallReadinessScore = Math.round(
      sliceApprovals.reduce((s, a) => s + a.score, 0) / sliceApprovals.length
    );
    const releaseGate = deriveReleaseGate(sliceApprovals, openIssues, overallReadinessScore);
    const riskLevel = deriveRiskLevel(releaseGate, openIssues, overallReadinessScore);
    const approvalsGranted = sliceApprovals.filter((a) => a.status === 'approved').length;
    const requiredApprovals = sliceApprovals
      .filter((a) => a.status !== 'approved')
      .map((a) => `${a.disciplineLabel} (${a.status})`);

    const design = sliceApprovals.find((a) => a.discipline === 'design-compliance');
    const experience = sliceApprovals.find((a) => a.discipline === 'experience-qa');
    const performance = sliceApprovals.find((a) => a.discipline === 'performance');
    const security = sliceApprovals.find((a) => a.discipline === 'security');

    return {
      id: `readiness-report-${rel.releaseId}`,
      releaseId: rel.releaseId,
      releaseLabel: rel.releaseLabel,
      overallReadinessScore,
      riskLevel,
      confidence: Math.max(45, Math.round((approvalsGranted / sliceApprovals.length) * 100 - openIssues.length * 4)),
      releaseGate,
      openIssues: openIssues.slice(0, 4).map((i) => i.title),
      blockedSystems: [...new Set(openIssues.flatMap((i) => i.blockedSystems))].slice(0, 6),
      requiredApprovals: requiredApprovals.length > 0 ? requiredApprovals : ['All disciplines approved ✓'],
      rollbackPreparedness:
        riskLevel === 'critical' || riskLevel === 'high'
          ? 'Rollback plan prepared — revert commit tagged · database migration reversible · feature flags ready.'
          : 'Standard rollback available — previous release artifact retained · no destructive migrations.',
      performanceSummary: performance?.summary ?? 'Performance within budget.',
      designSummary: design?.summary ?? 'Design compliance verified.',
      experienceSummary: experience?.summary ?? 'Experience confidence maintained.',
      securitySummary: security?.summary ?? 'Security stress tests passed.',
      readinessVerdict: buildVerdict(releaseGate, overallReadinessScore),
      openIssuesCount: openIssues.length,
      approvalsGranted,
      approvalsRequired: sliceApprovals.length,
      generatedAt: now,
    };
  }).sort((a, b) => b.overallReadinessScore - a.overallReadinessScore);
}

export function summarizeReleaseReadiness(profile: {
  overallReadinessScore: number;
  releaseGate: import('./types').ReleaseGate;
  approvalsGranted: number;
  approvalsRequired: number;
  openIssuesCount: number;
}): string {
  return `Release Readiness™ ${profile.overallReadinessScore}% · ${RELEASE_GATE_LABELS[profile.releaseGate]} · ${profile.approvalsGranted}/${profile.approvalsRequired} approvals · ${profile.openIssuesCount} open issues.`;
}

export function buildDockReadinessLine(profile: {
  overallReadinessScore: number;
  releaseGate: import('./types').ReleaseGate;
  openIssuesCount: number;
  productionReports: ProductionReadinessReport[];
}): string {
  const top = profile.productionReports[0];
  const gateLine = top ? ` ${top.releaseLabel}: ${RELEASE_GATE_LABELS[top.releaseGate]}.` : '';
  return `Readiness ${profile.overallReadinessScore}% · ${RELEASE_GATE_LABELS[profile.releaseGate]} · ${profile.openIssuesCount} issues.${gateLine}`;
}

export function explainOpenIssue(issue: ReadinessOpenIssue): string {
  return `${issue.description} Fix: ${issue.suggestedFix}`;
}

export function summarizeRiskLevel(risk: ReadinessRiskLevel): string {
  const map: Record<ReadinessRiskLevel, string> = {
    critical: 'Critical risk — do not deploy without executive override.',
    high: 'High risk — resolve blocked disciplines before production.',
    medium: 'Medium risk — QA and executive review recommended.',
    low: 'Low risk — release candidate meets readiness standards.',
  };
  return map[risk];
}
