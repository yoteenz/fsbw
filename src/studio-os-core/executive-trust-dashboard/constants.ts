/** Milestone 147 — Executive Trust Dashboard™ · Trust as a first-class metric */

export const EXECUTIVE_TRUST_DASHBOARD_STORAGE_KEY = 'studioOsExecutiveTrustDashboard_v1';
export const EXECUTIVE_TRUST_DASHBOARD_VERSION = '1.0.0';
export const STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED = 'studio-os-executive-trust-dashboard-updated';

export const EXECUTIVE_TRUST_DASHBOARD_ACCENT = '#0EA5E9';

export const EXECUTIVE_TRUST_DASHBOARD_PHILOSOPHY = [
  'Trust becomes a first-class metric inside Studio OS — measurable, not assumed.',
  'Founders ask: "How much confidence do I have in my entire organization today?"',
  'Studio OS answers that question before they even think to ask it.',
  'The Executive Trust Dashboard™ is one of the most valuable pages in Studio OS.',
] as const;

export const TRUST_DASHBOARD_SYSTEMS = [
  'studio-intelligence',
  'profession-brains',
  'knowledge-graph',
  'automations',
  'marketplace',
  'expert-marketplace',
  'documentation',
  'integrations',
  'security',
  'customer-experience',
  'performance',
  'accessibility',
  'compliance',
] as const;

export const TRUST_TRENDS = ['rising', 'stable', 'declining'] as const;

export const TRUST_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const TRUST_HISTORY_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'lifetime',
] as const;

export const TRUST_HISTORY_PERIOD_LABELS: Record<(typeof TRUST_HISTORY_PERIODS)[number], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  lifetime: 'Organization Lifetime',
};
