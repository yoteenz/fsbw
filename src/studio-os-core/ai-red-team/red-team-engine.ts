import { RED_TEAM_EXPOSURE_TARGETS } from './constants';
import type { AiRedTeamFinding, RedTeamExposureTarget } from './types';

const EXPOSURE_LABELS: Record<RedTeamExposureTarget, string> = {
  'profession-brain-contradictions': 'Profession Brain Contradictions',
  'broken-workflows': 'Broken Workflows',
  'prompt-conflicts': 'Prompt Conflicts',
  'hallucination-risks': 'Hallucination Risks',
  'permission-loopholes': 'Permission Loopholes',
  'security-vulnerabilities': 'Security Vulnerabilities',
  'automation-failures': 'Automation Failures',
  'knowledge-inconsistencies': 'Knowledge Inconsistencies',
  'duplicate-documentation': 'Duplicate Documentation',
  'broken-onboarding': 'Broken Onboarding',
  'infinite-loops': 'Infinite Loops',
  'logic-errors': 'Logic Errors',
  'weak-recommendations': 'Weak Recommendations',
  'poor-ux': 'Poor UX',
  'incomplete-edge-cases': 'Incomplete Edge Cases',
};

const FINDING_SEEDS: Omit<AiRedTeamFinding, 'id' | 'detectedAt' | 'exposureLabel'>[] = [
  {
    issue: 'Legal Brain and Tax Brain give conflicting guidance on deductible expenses',
    exposureTarget: 'profession-brain-contradictions',
    severity: 'critical',
    confidencePct: 93,
    rootCause: 'Overlapping domain boundaries without escalation rule when both brains activate.',
    affectedSystems: ['Profession Brain™', 'Professional Trust Framework', 'Prompt Registry'],
    suggestedResolution: 'Add mutual-exclusion rule · escalate to expert when domains overlap.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Customer booking workflow missing fallback when payment succeeds but confirmation fails',
    exposureTarget: 'broken-workflows',
    severity: 'high',
    confidencePct: 91,
    rootCause: 'Workflow assumes linear success path — no compensating transaction on partial failure.',
    affectedSystems: ['Workflow Engine', 'Automations', 'Customer Experience'],
    suggestedResolution: 'Add rollback node · idempotent confirmation retry · alert on orphan payments.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Welcome prompt and onboarding prompt inject conflicting tone instructions',
    exposureTarget: 'prompt-conflicts',
    severity: 'high',
    confidencePct: 89,
    rootCause: 'Two active prompts modify system message without Prompt Registry priority ordering.',
    affectedSystems: ['Prompt Registry', 'Command Dock', 'Studio Intelligence'],
    suggestedResolution: 'Establish prompt precedence hierarchy · merge into single onboarding bundle.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Studio Intelligence recommendation cites metric not present in connected sources',
    exposureTarget: 'hallucination-risks',
    severity: 'high',
    confidencePct: 86,
    rootCause: 'Recommendation engine not grounded in Knowledge Confidence citations.',
    affectedSystems: ['Studio Intelligence', 'Knowledge Confidence', 'Memory Engine'],
    suggestedResolution: 'Require citation for every metric · block recommendations below confidence threshold.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Editor role can export customer PII via reporting module bypass',
    exposureTarget: 'permission-loopholes',
    severity: 'critical',
    confidencePct: 95,
    rootCause: 'Reporting module uses legacy permission check not synced with Permission Engine.',
    affectedSystems: ['Permission Engine', 'Policy Engine', 'Security'],
    suggestedResolution: 'Migrate reporting to capability-based checks · run QA Inspector permission scan.',
    status: 'acknowledged',
    adversarialOnly: true,
  },
  {
    issue: 'Webhook secret exposed in client-side automation debug panel',
    exposureTarget: 'security-vulnerabilities',
    severity: 'critical',
    confidencePct: 97,
    rootCause: 'Debug mode renders full integration config including secrets to browser localStorage.',
    affectedSystems: ['Integrations', 'Automation Registry', 'Security'],
    suggestedResolution: 'Redact secrets in debug view · server-side secret storage only.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Duplicate welcome emails when signup and CRM sync fire within 2 seconds',
    exposureTarget: 'automation-failures',
    severity: 'high',
    confidencePct: 92,
    rootCause: 'Race condition — two automations lack deduplication window on same customer event.',
    affectedSystems: ['Automations', 'Event Bus', 'Customer Experience'],
    suggestedResolution: 'Add idempotency key · merge triggers · test in Digital Twin simultaneous scenario.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Knowledge Graph node references deleted Profession Brain instruction set',
    exposureTarget: 'knowledge-inconsistencies',
    severity: 'medium',
    confidencePct: 88,
    rootCause: 'Brain update did not propagate orphan cleanup to Knowledge Graph edges.',
    affectedSystems: ['Knowledge Graph', 'Profession Brain™', 'Documentation Registry'],
    suggestedResolution: 'Run knowledge integrity sync · prune orphaned edges on brain revision.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Two onboarding guides with conflicting step order for new employees',
    exposureTarget: 'duplicate-documentation',
    severity: 'medium',
    confidencePct: 84,
    rootCause: 'Documentation revision created parallel guide without deprecating original.',
    affectedSystems: ['Documentation', 'Knowledge Library', 'Organization Operating Manual'],
    suggestedResolution: 'Merge guides · mark deprecated version · single source of truth.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Employee onboarding allows role assignment before permission acknowledgment',
    exposureTarget: 'broken-onboarding',
    severity: 'high',
    confidencePct: 90,
    rootCause: 'Onboarding workflow skips permission review step under fast-track path.',
    affectedSystems: ['Workflows', 'Permissions', 'User Experience'],
    suggestedResolution: 'Enforce permission acknowledgment gate · remove fast-track bypass.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Workflow A triggers B triggers A — infinite loop under retry condition',
    exposureTarget: 'infinite-loops',
    severity: 'critical',
    confidencePct: 96,
    rootCause: 'Circular automation dependency with no max-iteration guard.',
    affectedSystems: ['Workflow Engine', 'Automations', 'Event Bus'],
    suggestedResolution: 'Break cycle with guard condition · Policy Engine max-iteration rule.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Pricing rule applies discount after tax calculation instead of before',
    exposureTarget: 'logic-errors',
    severity: 'high',
    confidencePct: 87,
    rootCause: 'Business rule ordering incorrect in monetization workflow node sequence.',
    affectedSystems: ['Workflow Engine', 'Monetization', 'Business Rules'],
    suggestedResolution: 'Reorder rule pipeline · add unit tests in Digital Twin pricing scenario.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Studio Intelligence suggests expansion when Company Health Index flags burnout risk',
    exposureTarget: 'weak-recommendations',
    severity: 'medium',
    confidencePct: 83,
    rootCause: 'Recommendation engine not weighting Founder Cognitive Load signal.',
    affectedSystems: ['Studio Intelligence', 'Founder Cognitive Load', 'Company Health Index'],
    suggestedResolution: 'Add health gate · suppress growth recommendations when burnout risk elevated.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Mobile booking flow hides cancellation policy below fold — 38% drop-off at confirm',
    exposureTarget: 'poor-ux',
    severity: 'medium',
    confidencePct: 85,
    rootCause: 'UI redesign removed policy summary from confirmation screen.',
    affectedSystems: ['User Experience', 'Workflows', 'QA Simulation Engine'],
    suggestedResolution: 'Restore policy above fold · run Customer Simulation before publish.',
    status: 'open',
    adversarialOnly: true,
  },
  {
    issue: 'Partial file upload accepted without validation — downstream processing fails silently',
    exposureTarget: 'incomplete-edge-cases',
    severity: 'high',
    confidencePct: 91,
    rootCause: 'Upload validator checks file type but not completeness or checksum.',
    affectedSystems: ['Workflows', 'Integrations', 'Customer Experience'],
    suggestedResolution: 'Add checksum validation · reject incomplete uploads · user-visible error state.',
    status: 'open',
    adversarialOnly: true,
  },
];

export function buildRedTeamFindings(now: string): AiRedTeamFinding[] {
  return FINDING_SEEDS.map((seed, idx) => ({
    ...seed,
    id: `rt-finding-${idx + 1}`,
    exposureLabel: EXPOSURE_LABELS[seed.exposureTarget],
    detectedAt: new Date(Date.parse(now) - idx * 5400000).toISOString(),
  }));
}

export function buildExposureMetrics(findings: AiRedTeamFinding[], now: string) {
  return RED_TEAM_EXPOSURE_TARGETS.map((target, idx) => {
    const related = findings.filter((f) => f.exposureTarget === target);
    const open = related.filter((f) => f.status === 'open' || f.status === 'acknowledged');
    return {
      target,
      label: EXPOSURE_LABELS[target],
      stressTestsRun: 3 + (idx % 4),
      weaknessesFound: open.length,
      lastProbedAt: now,
    };
  });
}

export function computeRedTeamScore(findings: AiRedTeamFinding[]): number {
  const penalty = findings.reduce((sum, f) => {
    if (f.status !== 'open' && f.status !== 'acknowledged') return sum;
    const w = f.severity === 'critical' ? 10 : f.severity === 'high' ? 5 : f.severity === 'medium' ? 2 : 1;
    return sum + w;
  }, 0);
  return Math.max(35, Math.min(99, 97 - penalty));
}

export function countOpenFindings(findings: AiRedTeamFinding[]): number {
  return findings.filter((f) => f.status === 'open' || f.status === 'acknowledged').length;
}

export function countCriticalFindings(findings: AiRedTeamFinding[]): number {
  return findings.filter(
    (f) => f.severity === 'critical' && (f.status === 'open' || f.status === 'acknowledged')
  ).length;
}

export { EXPOSURE_LABELS, RED_TEAM_EXPOSURE_TARGETS };
