/** Milestone 151 — Decision Audit™ · Permanent Decision Accountability */

export const DECISION_AUDIT_STORAGE_KEY = 'studioOsDecisionAudit_v1';
export const DECISION_AUDIT_VERSION = '1.0.0';
export const STUDIO_OS_DECISION_AUDIT_UPDATED = 'studio-os-decision-audit-updated';

export const DECISION_AUDIT_ACCENT = '#6366F1';

export const DECISION_AUDIT_PHILOSOPHY = [
  'Decision Audit™ records every significant recommendation, approval, rejection, automation, and AI decision — permanently.',
  'Organizations should never wonder "Why did this happen?" Every important decision has a permanent explanation.',
  'Studio Intelligence™ should never behave like a black box — every recommendation understandable, every decision explainable, every action accountable.',
  'Decision Timeline™ replays organizational decisions chronologically with evidence, approvers, documents, conversations, and workflows.',
] as const;

export const AUDIT_SOURCES = [
  'studio-intelligence',
  'profession-brains',
  'ai-concierges',
  'automations',
  'workflow-engine',
  'marketplace',
  'expert-marketplace',
  'knowledge-graph',
  'human-administrators',
] as const;

export const DECISION_TYPES = [
  'approve-workflow',
  'reject-marketplace-submission',
  'recommend-publishing-schedule',
  'update-profession-brain',
  'trigger-automation',
  'escalate-risk',
  'create-knowledge-asset',
  'recommend-pricing-change',
  'hire-expert',
  'approve-refund',
] as const;

export const APPROVAL_STATUSES = [
  'approved',
  'rejected',
  'pending',
  'auto-approved',
  'escalated',
  'informational',
] as const;

export const TIMELINE_FILTERS = [
  'all',
  'today',
  'week',
  'month',
  'quarter',
] as const;

export const AUDIT_SOURCE_LABELS: Record<(typeof AUDIT_SOURCES)[number], string> = {
  'studio-intelligence': 'Studio Intelligence™',
  'profession-brains': 'Profession Brains™',
  'ai-concierges': 'AI Concierges™',
  automations: 'Automations™',
  'workflow-engine': 'Workflow Engine™',
  marketplace: 'Marketplace™',
  'expert-marketplace': 'Expert Marketplace™',
  'knowledge-graph': 'Knowledge Graph™',
  'human-administrators': 'Human Administrators',
};

export const DECISION_TYPE_LABELS: Record<(typeof DECISION_TYPES)[number], string> = {
  'approve-workflow': 'Approve Workflow',
  'reject-marketplace-submission': 'Reject Marketplace Submission',
  'recommend-publishing-schedule': 'Recommend Publishing Schedule',
  'update-profession-brain': 'Update Profession Brain™',
  'trigger-automation': 'Trigger Automation',
  'escalate-risk': 'Escalate Risk',
  'create-knowledge-asset': 'Create Knowledge Asset',
  'recommend-pricing-change': 'Recommend Pricing Change',
  'hire-expert': 'Hire Expert',
  'approve-refund': 'Approve Refund',
};

export const APPROVAL_STATUS_LABELS: Record<(typeof APPROVAL_STATUSES)[number], string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  'auto-approved': 'Auto-Approved',
  escalated: 'Escalated',
  informational: 'Informational',
};

export const DEPARTMENTS = [
  'Executive',
  'Operations',
  'Knowledge',
  'Marketplace',
  'Customer Success',
  'Finance',
  'Engineering',
  'QA',
] as const;
