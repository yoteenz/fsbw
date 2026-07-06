import { INSPECTOR_AUDIT_DOMAINS, INSPECTOR_ISSUE_TYPES } from './constants';
import type { InspectorAuditDomain, InspectorIssueType, QaInspectorFinding } from './types';

const DOMAIN_LABELS: Record<InspectorAuditDomain, string> = {
  'profession-brains': 'Profession Brains™',
  workflows: 'Workflows',
  automations: 'Automations',
  'organization-settings': 'Organization Settings',
  permissions: 'Permissions',
  documentation: 'Documentation',
  'marketplace-listings': 'Marketplace Listings',
  'expert-responses': 'Expert Responses',
  'knowledge-graph': 'Knowledge Graph',
  'studio-intelligence': 'Studio Intelligence',
};

const ISSUE_LABELS: Record<InspectorIssueType, string> = {
  'broken-workflow': 'Broken Workflow',
  'duplicate-logic': 'Duplicate Logic',
  'conflicting-automation': 'Conflicting Automation',
  'outdated-documentation': 'Outdated Documentation',
  'missing-documentation': 'Missing Documentation',
  'unused-asset': 'Unused Asset',
  'dead-integration': 'Dead Integration',
  'circular-dependency': 'Circular Dependency',
  'permission-conflict': 'Permission Conflict',
  'contradicting-brain-instruction': 'Contradicting Brain Instruction',
  'ai-hallucination-risk': 'AI Hallucination Risk',
  'broken-user-journey': 'Broken User Journey',
  'missing-onboarding-step': 'Missing Onboarding Step',
};

const FINDING_SEEDS: Omit<QaInspectorFinding, 'id' | 'detectedAt' | 'domainLabel' | 'issueLabel'>[] = [
  {
    issueType: 'conflicting-automation',
    domain: 'automations',
    severity: 'high',
    confidencePct: 94,
    rootCause: 'Two automations trigger on the same event with opposing state transitions.',
    recommendedSolution: 'Merge into single automation with conditional branch · or disable automation-47.',
    estimatedImpact: 'Customers may receive duplicate emails · workflow state inconsistency.',
    affectedSystems: ['Automations', 'Workflow Engine', 'Event Bus'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'outdated-documentation',
    domain: 'documentation',
    severity: 'medium',
    confidencePct: 88,
    rootCause: 'Onboarding guide references deprecated workflow template v2.',
    recommendedSolution: 'Update documentation to reference current template · run link validation.',
    estimatedImpact: 'New employees follow incorrect process · extended onboarding time.',
    affectedSystems: ['Documentation', 'Knowledge Library', 'Workflows'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'dead-integration',
    domain: 'organization-settings',
    severity: 'high',
    confidencePct: 97,
    rootCause: 'Stripe webhook endpoint returning 404 for 72 hours.',
    recommendedSolution: 'Re-register webhook URL · verify OAuth token refresh.',
    estimatedImpact: 'Payment events not syncing · revenue reporting stale.',
    affectedSystems: ['Integrations', 'Monetization', 'Organization Health'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'permission-conflict',
    domain: 'permissions',
    severity: 'critical',
    confidencePct: 91,
    rootCause: 'Editor role grants delete capability conflicting with Policy Engine restriction.',
    recommendedSolution: 'Revoke delete from Editor role · align with Permission Engine template.',
    estimatedImpact: 'Unauthorized deletion risk · compliance violation potential.',
    affectedSystems: ['Permission Engine', 'Policy Engine', 'Security'],
    status: 'acknowledged',
    recommendsOnly: true,
  },
  {
    issueType: 'contradicting-brain-instruction',
    domain: 'profession-brains',
    severity: 'high',
    confidencePct: 86,
    rootCause: 'Legal Brain instructs "never provide tax advice" while Tax Brain allows general guidance.',
    recommendedSolution: 'Harmonize brain boundaries · add escalation rule for overlapping domains.',
    estimatedImpact: 'AI may give inconsistent advice · Professional Trust Framework violation.',
    affectedSystems: ['Profession Brain™', 'Prompt Registry', 'Professional Trust Framework'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'ai-hallucination-risk',
    domain: 'studio-intelligence',
    severity: 'medium',
    confidencePct: 82,
    rootCause: 'Recommendation references metric not present in connected data sources.',
    recommendedSolution: 'Ground recommendation in Knowledge Confidence sources · add citation requirement.',
    estimatedImpact: 'Founder may act on unverified intelligence.',
    affectedSystems: ['Studio Intelligence', 'Knowledge Confidence', 'Memory Engine'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'broken-user-journey',
    domain: 'workflows',
    severity: 'high',
    confidencePct: 90,
    rootCause: 'Customer booking flow missing confirmation step after payment.',
    recommendedSolution: 'Add confirmation node · run Customer Simulation before publish.',
    estimatedImpact: 'Customers uncertain if booking succeeded · support ticket increase.',
    affectedSystems: ['Workflows', 'QA Simulation Engine', 'User Experience'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'missing-onboarding-step',
    domain: 'organization-settings',
    severity: 'medium',
    confidencePct: 85,
    rootCause: 'Employee onboarding skips permission acknowledgment step.',
    recommendedSolution: 'Add permission review step to onboarding workflow.',
    estimatedImpact: 'Employees may not understand data access boundaries.',
    affectedSystems: ['Organization Settings', 'Permissions', 'User Experience'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'unused-asset',
    domain: 'documentation',
    severity: 'low',
    confidencePct: 79,
    rootCause: '23 registered assets with zero references in 90 days.',
    recommendedSolution: 'Archive or connect assets to active workflows · reduce registry noise.',
    estimatedImpact: 'Asset discovery degraded · storage overhead.',
    affectedSystems: ['Asset Registry', 'Documentation'],
    status: 'open',
    recommendsOnly: true,
  },
  {
    issueType: 'circular-dependency',
    domain: 'workflows',
    severity: 'critical',
    confidencePct: 96,
    rootCause: 'Workflow A triggers Workflow B which triggers Workflow A — infinite loop risk.',
    recommendedSolution: 'Break cycle with guard condition · add max-iteration policy.',
    estimatedImpact: 'System resource exhaustion · automation failure cascade.',
    affectedSystems: ['Workflow Engine', 'Automations', 'Event Bus'],
    status: 'open',
    recommendsOnly: true,
  },
];

export function buildInspectorFindings(now: string): QaInspectorFinding[] {
  return FINDING_SEEDS.map((seed, idx) => ({
    ...seed,
    id: `finding-${idx + 1}`,
    issueLabel: ISSUE_LABELS[seed.issueType],
    domainLabel: DOMAIN_LABELS[seed.domain],
    detectedAt: new Date(Date.parse(now) - idx * 7200000).toISOString(),
  }));
}

export function computeInspectorScore(findings: QaInspectorFinding[]): number {
  const penalty = findings.reduce((sum, f) => {
    const weight =
      f.severity === 'critical' ? 12 : f.severity === 'high' ? 6 : f.severity === 'medium' ? 3 : 1;
    return f.status === 'open' || f.status === 'acknowledged' ? sum + weight : sum;
  }, 0);
  return Math.max(40, Math.min(99, 98 - penalty));
}

export function countOpenFindings(findings: QaInspectorFinding[]): number {
  return findings.filter((f) => f.status === 'open' || f.status === 'acknowledged').length;
}

export function countCriticalFindings(findings: QaInspectorFinding[]): number {
  return findings.filter(
    (f) => f.severity === 'critical' && (f.status === 'open' || f.status === 'acknowledged')
  ).length;
}

export { DOMAIN_LABELS, ISSUE_LABELS, INSPECTOR_AUDIT_DOMAINS, INSPECTOR_ISSUE_TYPES };
