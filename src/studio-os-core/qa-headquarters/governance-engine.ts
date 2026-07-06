import type { OrganizationQaHeadquartersProfile } from './types';

export function runQaGovernanceAudit(profile: OrganizationQaHeadquartersProfile): {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
}[] {
  const findings: ReturnType<typeof runQaGovernanceAudit> = [];

  const atRisk = profile.trustScores.filter((t) => t.status === 'at-risk');
  if (atRisk.length > 0) {
    findings.push({
      id: 'gov-at-risk',
      severity: 'critical',
      message: `${atRisk.length} systems below trust threshold: ${atRisk.map((t) => t.label).join(', ')}.`,
      recommendation: 'Run QA Inspector audit and address root causes before next production change.',
    });
  }

  const declining = profile.trustScores.filter((t) => t.trend === 'declining');
  if (declining.length >= 2) {
    findings.push({
      id: 'gov-declining',
      severity: 'warning',
      message: `Trust declining in ${declining.map((t) => t.label).join(', ')}.`,
      recommendation: 'Schedule QA Simulation Engine rehearsal for affected workflows.',
    });
  }

  if (profile.activeIssues > 5) {
    findings.push({
      id: 'gov-issues',
      severity: 'warning',
      message: `${profile.activeIssues} active QA issues across responsibilities.`,
      recommendation: 'Prioritize automation conflicts and integration health in QA Inspector.',
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: 'gov-healthy',
      severity: 'info',
      message: `Overall trust ${profile.overallTrustScore}% · continuous validation active.`,
      recommendation: 'Maintain current QA cadence · no critical governance gaps.',
    });
  }

  return findings;
}
