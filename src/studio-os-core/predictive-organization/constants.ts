/** Milestone 113 — Predictive Organization™ V1.0 */

export const PREDICTIVE_ORGANIZATION_STORAGE_KEY = 'studioOsPredictiveOrganization_v1';
export const PREDICTIVE_ORGANIZATION_VERSION = '1.0.0';
export const STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED = 'studio-os-predictive-organization-updated';

export const PREDICTIVE_ORGANIZATION_PHILOSOPHY = [
  'Organizations should not spend all their time reacting — prepare for tomorrow before it arrives.',
  'Prediction becomes one of Studio OS\'s greatest competitive advantages.',
  'Every forecast includes reasoning and confidence — founders lead, Studio OS prepares.',
] as const;

export const PREDICTIVE_INTELLIGENCE_DOMAINS = [
  'revenue-trends',
  'customer-behavior',
  'employee-activity',
  'department-performance',
  'marketing-results',
  'project-timelines',
  'seasonality',
  'knowledge-growth',
  'automation-usage',
  'founder-workload',
  'historical-patterns',
  'industry-trends',
] as const;

export const PREDICTIVE_INTELLIGENCE_LABELS: Record<(typeof PREDICTIVE_INTELLIGENCE_DOMAINS)[number], string> = {
  'revenue-trends': 'Revenue Trends',
  'customer-behavior': 'Customer Behavior',
  'employee-activity': 'Employee Activity',
  'department-performance': 'Department Performance',
  'marketing-results': 'Marketing Results',
  'project-timelines': 'Project Timelines',
  'seasonality': 'Seasonality',
  'knowledge-growth': 'Knowledge Growth',
  'automation-usage': 'Automation Usage',
  'founder-workload': 'Founder Workload',
  'historical-patterns': 'Historical Patterns',
  'industry-trends': 'Industry Trends',
};

export const PREDICTION_CATEGORIES = [
  'busy-season',
  'hiring',
  'marketing',
  'customer-churn',
  'inventory',
  'knowledge-gaps',
  'capacity',
  'founder-burnout',
  'cash-flow',
  'launch',
  'automation',
  'risk',
] as const;

export const PREDICTION_CATEGORY_LABELS: Record<(typeof PREDICTION_CATEGORIES)[number], string> = {
  'busy-season': 'Busy Season',
  hiring: 'Hiring Need',
  marketing: 'Marketing Performance',
  'customer-churn': 'Customer Churn Risk',
  inventory: 'Inventory Shortage',
  'knowledge-gaps': 'Knowledge Gaps',
  capacity: 'Department Capacity',
  'founder-burnout': 'Founder Burnout Risk',
  'cash-flow': 'Cash Flow',
  launch: 'Launch Preparation',
  automation: 'Automation Opportunity',
  risk: 'Operational Risk',
};

export const FORECAST_HORIZONS = [
  '30-day',
  '90-day',
  'annual',
  'growth-probability',
  'risk-forecast',
  'department-readiness',
  'automation-readiness',
  'knowledge-expansion',
] as const;

export const FORECAST_HORIZON_LABELS: Record<(typeof FORECAST_HORIZONS)[number], string> = {
  '30-day': '30-Day Forecast',
  '90-day': '90-Day Forecast',
  annual: 'Annual Outlook',
  'growth-probability': 'Growth Probability',
  'risk-forecast': 'Risk Forecast',
  'department-readiness': 'Department Readiness',
  'automation-readiness': 'Automation Readiness',
  'knowledge-expansion': 'Knowledge Expansion',
};
