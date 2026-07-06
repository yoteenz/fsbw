/** Milestone 143 — QA Inspector™ · Intelligent continuous audit layer */

export const QA_INSPECTOR_STORAGE_KEY = 'studioOsQaInspector_v1';
export const QA_INSPECTOR_VERSION = '1.0.0';
export const STUDIO_OS_QA_INSPECTOR_UPDATED = 'studio-os-qa-inspector-updated';

export const QA_INSPECTOR_ACCENT = '#F59E0B';

export const QA_INSPECTOR_PHILOSOPHY = [
  'The QA Inspector™ continuously audits every organization without human intervention.',
  'It detects broken workflows, conflicting automations, outdated docs, and permission conflicts.',
  'Every issue receives severity, confidence, root cause, and recommended solution.',
  'The Inspector never silently modifies systems — it recommends. The organization decides.',
] as const;

export const INSPECTOR_AUDIT_DOMAINS = [
  'profession-brains',
  'workflows',
  'automations',
  'organization-settings',
  'permissions',
  'documentation',
  'marketplace-listings',
  'expert-responses',
  'knowledge-graph',
  'studio-intelligence',
] as const;

export const INSPECTOR_ISSUE_TYPES = [
  'broken-workflow',
  'duplicate-logic',
  'conflicting-automation',
  'outdated-documentation',
  'missing-documentation',
  'unused-asset',
  'dead-integration',
  'circular-dependency',
  'permission-conflict',
  'contradicting-brain-instruction',
  'ai-hallucination-risk',
  'broken-user-journey',
  'missing-onboarding-step',
] as const;

export const INSPECTOR_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;

export const INSPECTOR_FINDING_STATUSES = ['open', 'acknowledged', 'resolved', 'dismissed'] as const;
