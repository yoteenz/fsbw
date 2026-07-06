import { RELEASE_GATE_LABELS, RELEASE_GATES } from './constants';
import type { DisciplineApproval, ReadinessOpenIssue, ReadinessRiskLevel, ReleaseGate } from './types';

export function deriveReleaseGate(
  approvals: DisciplineApproval[],
  openIssues: ReadinessOpenIssue[],
  overallScore: number
): ReleaseGate {
  const approved = approvals.filter((a) => a.status === 'approved').length;
  const blocked = approvals.filter((a) => a.status === 'blocked').length;
  const criticalIssues = openIssues.filter((i) => i.severity === 'critical').length;

  if (approved === approvals.length && criticalIssues === 0 && overallScore >= 88) {
    return 'production-ready';
  }
  if (approved >= 10 && blocked === 0 && overallScore >= 82) {
    return 'ready-for-executive-review';
  }
  if (approved >= 8 && blocked <= 1 && overallScore >= 75) {
    return 'ready-for-qa';
  }
  if (approved >= 5 || overallScore >= 65) {
    return 'needs-review';
  }
  return 'not-ready';
}

export function deriveRiskLevel(
  gate: ReleaseGate,
  openIssues: ReadinessOpenIssue[],
  overallScore: number
): ReadinessRiskLevel {
  const critical = openIssues.filter((i) => i.severity === 'critical').length;
  if (gate === 'production-ready' && critical === 0) return 'low';
  if (critical >= 2 || overallScore < 70) return 'critical';
  if (critical >= 1 || overallScore < 78) return 'high';
  if (gate === 'needs-review' || gate === 'ready-for-qa') return 'medium';
  return 'low';
}

export function describeReleaseGate(gate: ReleaseGate): string {
  const descriptions: Record<ReleaseGate, string> = {
    'not-ready': 'Multiple disciplines blocked — production deployment must not proceed.',
    'needs-review': 'Partial approvals — engineering and QA review required before advancing.',
    'ready-for-qa': 'Major disciplines aligned — QA verification pass recommended.',
    'ready-for-executive-review': 'Disciplines largely approved — executive briefing and sign-off required.',
    'production-ready': 'All disciplines approved — release has earned the right to reach users.',
  };
  return `${RELEASE_GATE_LABELS[gate]}: ${descriptions[gate]}`;
}

export function listAllReleaseGates(): ReleaseGate[] {
  return [...RELEASE_GATES];
}
