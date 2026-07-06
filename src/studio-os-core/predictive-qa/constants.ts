/** Milestone 149 — Predictive QA™ · Future Risk Protection Engine */

export const PREDICTIVE_QA_STORAGE_KEY = 'studioOsPredictiveQa_v1';
export const PREDICTIVE_QA_VERSION = '1.0.0';
export const STUDIO_OS_PREDICTIVE_QA_UPDATED = 'studio-os-predictive-qa-updated';

export const PREDICTIVE_QA_ACCENT = '#0D9488';

export const PREDICTIVE_QA_PHILOSOPHY = [
  'Predictive QA™ protects the future — identifying operational risks before they occur.',
  'Rather than validating the past, Studio OS identifies tomorrow\'s problems while there is still time to prevent them.',
  'Every prediction includes confidence, evidence, timeline, business impact, departments affected, and preventative action.',
  'Continuous analysis across Profession Brains™, Knowledge Graph™, workflows, automations, customers, and growth signals.',
] as const;

export const PREDICTION_PATTERN_TYPES = [
  'workflow-failure',
  'automation-overload',
  'scaling-bottleneck',
  'declining-trust-score',
  'knowledge-gap',
  'expert-shortage',
  'permission-risk',
  'technical-debt',
  'customer-frustration',
  'outdated-documentation',
] as const;

export const ANALYSIS_SOURCES = [
  'profession-brains',
  'knowledge-graph',
  'workflow-history',
  'automation-behavior',
  'customer-activity',
  'marketplace-trends',
  'performance-history',
  'system-changes',
  'organization-growth',
  'user-behavior',
] as const;

export const PREDICTION_TIMELINES = [
  'within-7-days',
  'within-30-days',
  'next-quarter',
  'within-6-months',
] as const;

export const PREDICTION_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export const PREDICTION_STATUSES = ['active', 'mitigating', 'dismissed', 'realized'] as const;

export const PATTERN_TRENDS = ['emerging', 'stable', 'accelerating'] as const;

export const ACTION_PRIORITIES = ['immediate', 'this-week', 'this-month'] as const;

export const PREDICTION_PATTERN_LABELS: Record<(typeof PREDICTION_PATTERN_TYPES)[number], string> = {
  'workflow-failure': 'Likely Workflow Failure',
  'automation-overload': 'Automation Overload',
  'scaling-bottleneck': 'Scaling Bottleneck',
  'declining-trust-score': 'Declining Trust Score',
  'knowledge-gap': 'Knowledge Gap',
  'expert-shortage': 'Expert Shortage',
  'permission-risk': 'Permission Risk',
  'technical-debt': 'Growing Technical Debt',
  'customer-frustration': 'Customer Frustration',
  'outdated-documentation': 'Documentation Becoming Outdated',
};

export const ANALYSIS_SOURCE_LABELS: Record<(typeof ANALYSIS_SOURCES)[number], string> = {
  'profession-brains': 'Profession Brains™',
  'knowledge-graph': 'Knowledge Graph™',
  'workflow-history': 'Workflow History',
  'automation-behavior': 'Automation Behavior',
  'customer-activity': 'Customer Activity',
  'marketplace-trends': 'Marketplace Trends',
  'performance-history': 'Performance History',
  'system-changes': 'System Changes',
  'organization-growth': 'Organization Growth',
  'user-behavior': 'User Behavior',
};

export const PREDICTION_TIMELINE_LABELS: Record<(typeof PREDICTION_TIMELINES)[number], string> = {
  'within-7-days': 'Within 7 days',
  'within-30-days': 'Within 30 days',
  'next-quarter': 'Next quarter',
  'within-6-months': 'Within 6 months',
};

export const DEPARTMENTS = [
  'Operations',
  'Customer Success',
  'Engineering',
  'Knowledge',
  'Security',
  'Marketplace',
  'Executive',
  'QA',
] as const;
