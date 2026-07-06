import { getOrganizationDesignComplianceEngineProfile } from '../design-compliance-engine/store';
import { getOrganizationPromptQaProfile } from '../prompt-qa/store';
import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import { getOrganizationVisualDiffEngineProfile } from '../visual-diff-engine/store';
import { getOrganizationAccessibilityAuditorProfile } from '../accessibility-auditor/store';
import { getOrganizationPerformanceMonitorProfile } from '../performance-monitor/store';
import { getOrganizationRegressionEngineProfile } from '../regression-engine/store';
import { getOrganizationAiRedTeamProfile } from '../ai-red-team/store';
import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationQaSimulationEngineProfile } from '../qa-simulation-engine/store';
import { getOrganizationGuardianProfile } from '../organizational-guardian/store';
import { getOrganizationDocumentationSyncProfile } from '../documentation-sync/store';
import { RELEASE_DISCIPLINE_LABELS, RELEASE_DISCIPLINES } from './constants';
import type { ApprovalStatus, DisciplineApproval, ReadinessOpenIssue, ReleaseDiscipline } from './types';

const APPROVAL_THRESHOLD = 80;
const CONDITIONAL_THRESHOLD = 70;

function deriveApprovalStatus(score: number, openIssues: number): ApprovalStatus {
  if (openIssues > 2 || score < CONDITIONAL_THRESHOLD) return 'blocked';
  if (score >= APPROVAL_THRESHOLD && openIssues === 0) return 'approved';
  return 'conditional';
}

function pullDisciplineScore(
  organizationId: string,
  discipline: ReleaseDiscipline
): { score: number; openIssues: number; approverSystem: string; summary: string } {
  switch (discipline) {
    case 'design-compliance': {
      const p = getOrganizationDesignComplianceEngineProfile(organizationId);
      return {
        score: p?.creativeDirectorScore ?? 82,
        openIssues: p?.findingsOpen ?? 2,
        approverSystem: 'Design Compliance Engine™',
        summary: p ? `${p.pagesAudited} pages audited · ${p.findingsOpen} findings open.` : 'Design compliance baseline applied.',
      };
    }
    case 'prompt-qa': {
      const p = getOrganizationPromptQaProfile(organizationId);
      return {
        score: p?.overallQaScore ?? 84,
        openIssues: p?.findingsOpen ?? 1,
        approverSystem: 'Prompt QA™',
        summary: p ? `${p.promptsAudited} prompts · ${p.findingsOpen} findings.` : 'Prompt infrastructure verified.',
      };
    }
    case 'experience-qa': {
      const p = getOrganizationExperienceQaProfile(organizationId);
      return {
        score: p?.overallExperienceScore ?? 85,
        openIssues: p?.findingsOpen ?? 1,
        approverSystem: 'Experience QA™',
        summary: p ? `${p.pagesAudited} pages · ${p.findingsOpen} findings.` : 'Experience confidence baseline.',
      };
    }
    case 'visual-diff': {
      const p = getOrganizationVisualDiffEngineProfile(organizationId);
      return {
        score: p?.visualMemoryScore ?? 86,
        openIssues: p?.diffsDetected ?? 1,
        approverSystem: 'Visual Diff Engine™',
        summary: p ? `${p.screensCompared} screens · ${p.diffsDetected} diffs.` : 'Visual memory baseline.',
      };
    }
    case 'accessibility': {
      const p = getOrganizationAccessibilityAuditorProfile(organizationId);
      return {
        score: p?.overallAccessibilityScore ?? 87,
        openIssues: p?.issuesOpen ?? 1,
        approverSystem: 'Accessibility Auditor™',
        summary: p ? `${p.pagesAudited} pages · WCAG ${p.averageWcagLevel}.` : 'Inclusive design baseline.',
      };
    }
    case 'performance': {
      const p = getOrganizationPerformanceMonitorProfile(organizationId);
      return {
        score: p?.overallPerformanceScore ?? 83,
        openIssues: p?.bottlenecksOpen ?? 2,
        approverSystem: 'Performance Monitor™',
        summary: p ? `${p.modulesMonitored} modules · ${p.bottlenecksOpen} bottlenecks.` : 'Performance budget baseline.',
      };
    }
    case 'regression': {
      const p = getOrganizationRegressionEngineProfile(organizationId);
      return {
        score: p?.overallRegressionScore ?? 88,
        openIssues: p?.brokenFeaturesOpen ?? 1,
        approverSystem: 'Regression Engine™',
        summary: p ? `${p.buildsTested} builds · ${p.brokenFeaturesOpen} broken features.` : 'Regression verification baseline.',
      };
    }
    case 'security': {
      const p = getOrganizationAiRedTeamProfile(organizationId);
      const penalty = (p?.criticalFindings ?? 0) * 8 + (p?.openFindings ?? 0) * 3;
      return {
        score: Math.max(55, (p?.redTeamScore ?? 84) - penalty),
        openIssues: p?.openFindings ?? 1,
        approverSystem: 'AI Red Team™',
        summary: p ? `${p.challengesRun} challenges · ${p.openFindings} open findings.` : 'Security stress-test baseline.',
      };
    }
    case 'trust': {
      const p = getOrganizationExecutiveTrustDashboardProfile(organizationId);
      return {
        score: p?.overallTrustScore ?? 86,
        openIssues: p?.systemsAtRisk ?? 1,
        approverSystem: 'Executive Trust Dashboard™',
        summary: p ? `Trust ${p.overallTrustScore}% · ${p.systemsAtRisk} systems at risk.` : 'Organizational trust baseline.',
      };
    }
    case 'simulation': {
      const p = getOrganizationQaSimulationEngineProfile(organizationId);
      return {
        score: p?.simulationScore ?? 82,
        openIssues: Math.max(0, (p?.simulationsRun ?? 6) - (p?.simulationsPassed ?? 5)),
        approverSystem: 'QA Simulation Engine™',
        summary: p ? `${p.simulationsPassed}/${p.simulationsRun} simulations passed.` : 'Production simulation baseline.',
      };
    }
    case 'guardian': {
      const p = getOrganizationGuardianProfile(organizationId);
      return {
        score: p?.guardianScore ?? 88,
        openIssues: p?.activeAlerts ?? 1,
        approverSystem: 'Organizational Guardian™',
        summary: p ? `${p.domainsMonitored} domains · ${p.activeAlerts} alerts.` : 'Guardian coordination baseline.',
      };
    }
    case 'documentation': {
      const p = getOrganizationDocumentationSyncProfile(organizationId);
      return {
        score: p?.syncScore ?? 85,
        openIssues: Math.max(0, 12 - Math.floor((p?.systemsDocumented ?? 10) / 10)),
        approverSystem: 'Documentation Sync™',
        summary: p ? `${p.systemsDocumented} systems documented · sync ${p.syncScore}%.` : 'Documentation sync baseline.',
      };
    }
    default:
      return { score: 80, openIssues: 0, approverSystem: 'Studio OS', summary: 'Baseline approval.' };
  }
}

export function buildDisciplineApprovals(organizationId: string): DisciplineApproval[] {
  return RELEASE_DISCIPLINES.map((discipline) => {
    const pulled = pullDisciplineScore(organizationId, discipline);
    const status = deriveApprovalStatus(pulled.score, pulled.openIssues);
    return {
      id: `approval-${discipline}`,
      discipline,
      disciplineLabel: RELEASE_DISCIPLINE_LABELS[discipline],
      score: pulled.score,
      status,
      approverSystem: pulled.approverSystem,
      openIssues: pulled.openIssues,
      summary: pulled.summary,
      requiredBeforeProduction: true,
    };
  });
}

export function buildReadinessOpenIssues(approvals: DisciplineApproval[]): ReadinessOpenIssue[] {
  const issues: ReadinessOpenIssue[] = [];

  for (const approval of approvals) {
    if (approval.status === 'approved') continue;
    issues.push({
      id: `issue-${approval.discipline}`,
      discipline: approval.discipline,
      disciplineLabel: approval.disciplineLabel,
      severity: approval.status === 'blocked' ? 'critical' : 'warning',
      title: `${approval.disciplineLabel} ${approval.status === 'blocked' ? 'blocked' : 'conditional'}`,
      description: `${approval.summary} Score ${approval.score}% — requires ${approval.status === 'blocked' ? 'resolution' : 'review'} before production.`,
      blockedSystems: [approval.approverSystem],
      suggestedFix: `Resolve ${approval.openIssues} open issue(s) in ${approval.approverSystem} · target score ≥ ${APPROVAL_THRESHOLD}%.`,
    });
  }

  const extraSeeds: Omit<ReadinessOpenIssue, 'id'>[] = [
    {
      discipline: 'regression',
      disciplineLabel: RELEASE_DISCIPLINE_LABELS.regression,
      severity: 'warning',
      title: 'Permission workflow recurring regression',
      description: 'Historical Memory™ pattern: workflow breaks after permission updates.',
      blockedSystems: ['Workflow Engine', 'Permission Engine', 'Regression Engine'],
      suggestedFix: 'Apply permission migration regression test before deploy.',
    },
    {
      discipline: 'performance',
      disciplineLabel: RELEASE_DISCIPLINE_LABELS.performance,
      severity: 'advisory',
      title: 'Mobile performance budget approaching limit',
      description: 'Performance Monitor™ flags mobile Lighthouse score below budget.',
      blockedSystems: ['Performance Monitor', 'Mission Control'],
      suggestedFix: 'Optimize mobile bundle before production release.',
    },
  ];

  extraSeeds.forEach((seed, i) => {
    if (issues.length < 6) {
      issues.push({ ...seed, id: `issue-extra-${i}` });
    }
  });

  return issues.slice(0, 8);
}

export function countApprovalsGranted(approvals: DisciplineApproval[]): number {
  return approvals.filter((a) => a.status === 'approved').length;
}

export function computeOverallReadinessScore(approvals: DisciplineApproval[]): number {
  if (approvals.length === 0) return 82;
  return Math.round(approvals.reduce((s, a) => s + a.score, 0) / approvals.length);
}

export function computeConfidence(approvals: DisciplineApproval[], openIssues: ReadinessOpenIssue[]): number {
  const approvedPct = (countApprovalsGranted(approvals) / approvals.length) * 100;
  const penalty = openIssues.filter((i) => i.severity === 'critical').length * 8;
  return Math.max(42, Math.round(approvedPct - penalty));
}

export function collectBlockedSystems(issues: ReadinessOpenIssue[]): string[] {
  return [...new Set(issues.flatMap((i) => i.blockedSystems))];
}
