import { QA_RESPONSIBILITIES } from './constants';
import type { ContinuousValidationEvent, QaResponsibilityEntry, ValidationTriggerId } from './types';

const RESPONSIBILITY_LABELS: Record<(typeof QA_RESPONSIBILITIES)[number], string> = {
  'workflow-validation': 'Workflow Validation',
  'ai-output-validation': 'AI Output Validation',
  'automation-validation': 'Automation Validation',
  'documentation-validation': 'Documentation Validation',
  'knowledge-integrity': 'Knowledge Integrity',
  'broken-link-detection': 'Broken Link Detection',
  'missing-dependency-detection': 'Missing Dependency Detection',
  'profession-brain-health': 'Profession Brain™ Health',
  'organization-health': 'Organization Health',
  'marketplace-quality': 'Marketplace Quality',
  'expert-quality': 'Expert Quality',
  'integration-health': 'Integration Health',
  'security-monitoring': 'Security Monitoring',
  'performance-monitoring': 'Performance Monitoring',
  'user-experience-validation': 'User Experience Validation',
};

const TRIGGER_LABELS: Record<ValidationTriggerId, string> = {
  'new-workflow': 'New Workflow',
  'updated-profession-brain': 'Updated Profession Brain™',
  'marketplace-submission': 'Marketplace Submission',
  'knowledge-update': 'Knowledge Update',
  'automation-change': 'Automation Change',
  'documentation-revision': 'Documentation Revision',
  'integration-change': 'Integration Change',
  'permission-change': 'Permission Change',
  'expert-response': 'Expert Response',
  'studio-intelligence-recommendation': 'Studio Intelligence Recommendation',
};

const ISSUE_COUNTS: Partial<Record<(typeof QA_RESPONSIBILITIES)[number], number>> = {
  'automation-validation': 2,
  'broken-link-detection': 4,
  'missing-dependency-detection': 1,
  'documentation-validation': 3,
  'integration-health': 1,
  'performance-monitoring': 3,
  'user-experience-validation': 2,
};

export function buildQaResponsibilities(now: string): QaResponsibilityEntry[] {
  return QA_RESPONSIBILITIES.map((responsibilityId, idx) => ({
    responsibilityId,
    label: RESPONSIBILITY_LABELS[responsibilityId],
    active: true,
    coveragePct: Math.min(99, 88 + (idx % 5)),
    lastCheckedAt: now,
    issueCount: ISSUE_COUNTS[responsibilityId] ?? 0,
  }));
}

export function buildRecentValidations(now: string): ContinuousValidationEvent[] {
  const iso = (offsetHours: number) => new Date(Date.parse(now) - offsetHours * 3600000).toISOString();

  return [
    {
      id: 'val-1',
      trigger: 'automation-change',
      triggerLabel: TRIGGER_LABELS['automation-change'],
      status: 'warning',
      startedAt: iso(1),
      completedAt: iso(0.9),
      systemsChecked: ['Automations', 'Workflows', 'Policy Engine'],
      findingsCount: 2,
      summary: 'Conflicting automation triggers detected — inspector notified.',
    },
    {
      id: 'val-2',
      trigger: 'documentation-revision',
      triggerLabel: TRIGGER_LABELS['documentation-revision'],
      status: 'passed',
      startedAt: iso(4),
      completedAt: iso(3.8),
      systemsChecked: ['Documentation', 'Knowledge Library', 'Broken Links'],
      findingsCount: 0,
      summary: 'Documentation revision validated · links intact.',
    },
    {
      id: 'val-3',
      trigger: 'updated-profession-brain',
      triggerLabel: TRIGGER_LABELS['updated-profession-brain'],
      status: 'passed',
      startedAt: iso(8),
      completedAt: iso(7.7),
      systemsChecked: ['Profession Brain™', 'Prompt Registry', 'Studio Intelligence'],
      findingsCount: 0,
      summary: 'Brain instructions consistent · no contradicting rules.',
    },
    {
      id: 'val-4',
      trigger: 'new-workflow',
      triggerLabel: TRIGGER_LABELS['new-workflow'],
      status: 'running',
      startedAt: iso(0.2),
      systemsChecked: ['Workflows', 'Permissions', 'Simulation Engine'],
      findingsCount: 0,
      summary: 'Pre-production simulation in progress…',
    },
    {
      id: 'val-5',
      trigger: 'marketplace-submission',
      triggerLabel: TRIGGER_LABELS['marketplace-submission'],
      status: 'pending',
      startedAt: iso(0),
      systemsChecked: ['Marketplace', 'Expert Marketplace', 'Trust Scores'],
      findingsCount: 0,
      summary: 'Queued for QA Inspector review.',
    },
  ];
}

export function countActiveIssues(responsibilities: QaResponsibilityEntry[]): number {
  return responsibilities.reduce((sum, r) => sum + r.issueCount, 0);
}

export function countValidationsToday(events: ContinuousValidationEvent[]): number {
  return events.filter((e) => e.status !== 'pending').length;
}

export { TRIGGER_LABELS, RESPONSIBILITY_LABELS };
