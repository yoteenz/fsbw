/** Milestone 160 — Regression Engine™ · Studio OS remembers everything that worked */

export const REGRESSION_ENGINE_STORAGE_KEY = 'studioOsRegressionEngine_v1';
export const REGRESSION_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_REGRESSION_ENGINE_UPDATED = 'studio-os-regression-engine-updated';

export const REGRESSION_ENGINE_ACCENT = '#7C3AED';

export const REGRESSION_ENGINE_PHILOSOPHY = [
  'Regression Engine™ continuously verifies that every new change does not unintentionally break existing functionality.',
  'Studio OS should remember everything that has ever worked — whenever a feature changes, related systems are automatically retested.',
  'Studio OS should never repeat the same engineering mistake twice.',
  'Every regression becomes permanent organizational knowledge. The system continuously learns from its own failures.',
] as const;

export const REGRESSION_CATEGORIES = [
  'ui-components',
  'navigation',
  'profession-brains',
  'studio-intelligence',
  'ai-concierges',
  'workflows',
  'automations',
  'marketplace',
  'knowledge-graph',
  'integrations',
  'permissions',
  'notifications',
  'reports',
  'dashboards',
  'studio-orb',
  'living-headquarters',
] as const;

export const REGRESSION_REPLAYS = [
  'customer-journeys',
  'employee-workflows',
  'expert-consultations',
  'marketplace-purchases',
  'knowledge-publishing',
  'appointment-booking',
  'ai-conversations',
  'automation-chains',
  'onboarding',
  'organization-creation',
] as const;

export const REGRESSION_RISK_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const REGRESSION_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const REGRESSION_CATEGORY_LABELS: Record<(typeof REGRESSION_CATEGORIES)[number], string> = {
  'ui-components': 'UI Components',
  navigation: 'Navigation',
  'profession-brains': 'Profession Brains™',
  'studio-intelligence': 'Studio Intelligence™',
  'ai-concierges': 'AI Concierges™',
  workflows: 'Workflows',
  automations: 'Automations',
  marketplace: 'Marketplace',
  'knowledge-graph': 'Knowledge Graph™',
  integrations: 'Integrations',
  permissions: 'Permissions',
  notifications: 'Notifications',
  reports: 'Reports',
  dashboards: 'Dashboards',
  'studio-orb': 'Studio Orb™',
  'living-headquarters': 'Living Headquarters™',
};

export const REGRESSION_REPLAY_LABELS: Record<(typeof REGRESSION_REPLAYS)[number], string> = {
  'customer-journeys': 'Customer Journeys',
  'employee-workflows': 'Employee Workflows',
  'expert-consultations': 'Expert Consultations',
  'marketplace-purchases': 'Marketplace Purchases',
  'knowledge-publishing': 'Knowledge Publishing',
  'appointment-booking': 'Appointment Booking',
  'ai-conversations': 'AI Conversations',
  'automation-chains': 'Automation Chains',
  onboarding: 'Onboarding',
  'organization-creation': 'Organization Creation',
};
