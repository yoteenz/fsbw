import { getOrganizationPredictiveQaProfile } from '../predictive-qa/store';
import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import {
  HEALING_CATEGORY_LABELS,
  RESTRICTED_DOMAINS,
} from './constants';
import type { HealingIssue, HealingRiskLevel, RestrictedDomain } from './types';

type IssueSeed = Omit<HealingIssue, 'id' | 'categoryLabel' | 'detectedAt' | 'status' | 'autoRepairEligible'>;

const ISSUE_SEEDS: IssueSeed[] = [
  {
    category: 'broken-links',
    title: 'Broken Documentation Links',
    description: '14 documentation pages reference URLs returning 404.',
    rootCause: 'Workflow template v2 deprecated · doc links not updated during migration.',
    riskLevel: 'low',
    confidencePct: 96,
    systemsAffected: ['Documentation', 'Knowledge Library', 'Link Validator'],
    restrictedDomain: null,
  },
  {
    category: 'missing-documentation',
    title: 'Missing Onboarding Step Documentation',
    description: 'Permit approval workflow step lacks published documentation.',
    rootCause: 'New workflow node added without doc sync trigger.',
    riskLevel: 'low',
    confidencePct: 91,
    systemsAffected: ['Documentation', 'Workflows', 'Knowledge Graph'],
    restrictedDomain: null,
  },
  {
    category: 'inactive-automations',
    title: 'Inactive Email Notification Automation',
    description: 'Automation #47 has not triggered in 21 days despite active events.',
    rootCause: 'Trigger condition references deprecated event type post-migration.',
    riskLevel: 'low',
    confidencePct: 94,
    systemsAffected: ['Automations', 'Event Bus', 'Notifications'],
    restrictedDomain: null,
  },
  {
    category: 'outdated-references',
    title: 'Outdated API Reference in Integration Guide',
    description: 'Stripe webhook guide references v1 endpoint removed 60 days ago.',
    rootCause: 'Integration update shipped without documentation sync.',
    riskLevel: 'medium',
    confidencePct: 89,
    systemsAffected: ['Documentation', 'Integrations', 'Monetization'],
    restrictedDomain: null,
  },
  {
    category: 'knowledge-graph-inconsistencies',
    title: 'Conflicting Tax Guidance Nodes',
    description: 'Legal Brain and Tax Brain nodes contradict on general tax guidance boundaries.',
    rootCause: 'Parallel brain edits without harmonization review.',
    riskLevel: 'medium',
    confidencePct: 87,
    systemsAffected: ['Knowledge Graph', 'Profession Brain', 'Professional Trust Framework'],
    restrictedDomain: 'compliance',
  },
  {
    category: 'duplicate-records',
    title: 'Duplicate Customer Contact Records',
    description: '23 customer records share identical email with different IDs.',
    rootCause: 'Import pipeline lacks deduplication on email field.',
    riskLevel: 'low',
    confidencePct: 92,
    systemsAffected: ['Asset Registry', 'Customer Data', 'Workflows'],
    restrictedDomain: null,
  },
  {
    category: 'unused-assets',
    title: 'Orphaned Blueprint Assets',
    description: '8 blueprint assets unreferenced for 90+ days consuming registry space.',
    rootCause: 'Asset Factory batch run without cleanup policy.',
    riskLevel: 'low',
    confidencePct: 88,
    systemsAffected: ['Asset Registry', 'Blueprint Manager', 'Asset Factory'],
    restrictedDomain: null,
  },
  {
    category: 'minor-ui-issues',
    title: 'Mobile Checkout Label Truncation',
    description: 'Confirmation button label truncates on screens under 375px width.',
    rootCause: 'CSS flex container missing min-width on mobile breakpoint.',
    riskLevel: 'low',
    confidencePct: 93,
    systemsAffected: ['Experience Engine', 'User Experience', 'QA Simulation'],
    restrictedDomain: null,
  },
  {
    category: 'configuration-drift',
    title: 'Permission Template Drift',
    description: 'Editor role permissions diverged from Policy Engine template by 3 capabilities.',
    rootCause: 'Manual role edit bypassed Policy Engine sync.',
    riskLevel: 'medium',
    confidencePct: 90,
    systemsAffected: ['Permission Engine', 'Policy Engine', 'Security'],
    restrictedDomain: 'compliance',
  },
  {
    category: 'dependency-issues',
    title: 'Stale Integration Dependency',
    description: 'Calendar sync integration depends on OAuth token expiring in 48 hours.',
    rootCause: 'Token refresh automation disabled during maintenance window.',
    riskLevel: 'high',
    confidencePct: 95,
    systemsAffected: ['Integrations', 'Automations', 'Appointment Workflows'],
    restrictedDomain: null,
  },
  {
    category: 'outdated-references',
    title: 'Financial Reporting Workflow Reference',
    description: 'Quarterly filing workflow references deprecated tax calculation module.',
    rootCause: 'Tax module upgraded · workflow template not migrated.',
    riskLevel: 'high',
    confidencePct: 91,
    systemsAffected: ['Workflows', 'Monetization', 'Compliance'],
    restrictedDomain: 'financial',
  },
  {
    category: 'dependency-issues',
    title: 'Medical Consultation Routing Dependency',
    description: 'Expert marketplace routing for medical consultations uses deprecated compliance gate.',
    rootCause: 'Professional Trust Framework update not propagated to routing rules.',
    riskLevel: 'high',
    confidencePct: 88,
    systemsAffected: ['Expert Marketplace', 'Professional Trust Framework', 'Workflows'],
    restrictedDomain: 'medical',
  },
];

function isAutoRepairEligible(
  issue: Pick<HealingIssue, 'restrictedDomain' | 'riskLevel' | 'confidencePct'>
): boolean {
  if (issue.restrictedDomain !== null) return false;
  if (issue.riskLevel === 'restricted') return false;
  if (issue.riskLevel !== 'low') return false;
  return issue.confidencePct >= 85;
}

function inferStatus(
  issue: Pick<HealingIssue, 'restrictedDomain' | 'riskLevel' | 'confidencePct'>,
  mode: import('./types').HealingMode
): HealingIssue['status'] {
  if (issue.restrictedDomain !== null || issue.riskLevel === 'high' || issue.riskLevel === 'restricted') {
    return 'recovery-planned';
  }
  if (issue.riskLevel === 'medium') return 'pending-approval';
  if (mode === 'automatic-repair' && isAutoRepairEligible(issue)) {
    return 'repaired';
  }
  if (mode === 'observe') return 'detected';
  if (mode === 'recommend') return 'detected';
  return 'pending-approval';
}

export function buildHealingIssues(
  organizationId: string,
  now: string,
  mode: import('./types').HealingMode
): HealingIssue[] {
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const predictive = getOrganizationPredictiveQaProfile(organizationId);

  const issues = ISSUE_SEEDS.map((seed, i) => {
    let riskLevel = seed.riskLevel;
    let confidencePct = seed.confidencePct;

    if (inspector && inspector.criticalFindings > 0 && seed.category === 'configuration-drift') {
      riskLevel = 'high';
      confidencePct = Math.min(99, confidencePct + 3);
    }

    if (predictive && predictive.highRiskPredictions > 2 && seed.category === 'dependency-issues') {
      confidencePct = Math.min(99, confidencePct + 2);
    }

    const base = {
      ...seed,
      id: `issue-${seed.category}-${i}`,
      categoryLabel: HEALING_CATEGORY_LABELS[seed.category],
      riskLevel,
      confidencePct,
      detectedAt: now,
    };

    return {
      ...base,
      autoRepairEligible: isAutoRepairEligible(base),
      status: inferStatus(base, mode),
    };
  });

  return issues.sort((a, b) => {
    const riskOrder: Record<HealingRiskLevel, number> = { restricted: 0, high: 1, medium: 2, low: 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}

export function computeResilienceScore(
  issues: HealingIssue[],
  repairs: import('./types').HealingRepair[],
  recoveryPlans: import('./types').RecoveryPlan[]
): number {
  const open = issues.filter((i) => i.status !== 'repaired' && i.status !== 'dismissed').length;
  const repaired = repairs.length;
  const plansReady = recoveryPlans.filter((p) => p.status === 'ready').length;
  const base = 78 + repaired * 2 + plansReady * 1.5 - open * 1.2;
  return Math.max(0, Math.min(99, Math.round(base)));
}

export function isRestrictedDomain(domain: RestrictedDomain | null): boolean {
  return domain !== null && RESTRICTED_DOMAINS.includes(domain);
}
