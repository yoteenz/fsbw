/** Milestone 104 — Business Simulation Lab™ V1.0 */

export const SIMULATION_LAB_STORAGE_KEY = 'studioOsBusinessSimulationLab_v1';
export const SIMULATION_LAB_VERSION = '1.0.0';
export const STUDIO_OS_SIMULATION_LAB_UPDATED = 'studio-os-business-simulation-lab-updated';

export const SIMULATION_LAB_PHILOSOPHY = [
  'Great organizations should not learn only from mistakes — they should also learn from simulation.',
  'Studio OS provides a strategic environment where founders experiment without risking the real business.',
  'Practice tomorrow before living it — better decisions come from better preparation.',
  'Studio OS becomes a strategic laboratory — not simply an operational platform.',
] as const;

export const LAB_SIMULATION_TYPES = [
  'marketing-campaign',
  'pricing-change',
  'hiring-plan',
  'department-expansion',
  'product-launch',
  'geographic-expansion',
  'inventory-change',
  'membership-model',
  'automation-rollout',
  'subscription-model',
  'revenue-forecast',
  'digital-workforce-growth',
  'knowledge-product-launch',
  'operational-change',
] as const;

export const LAB_SIMULATION_LABELS: Record<(typeof LAB_SIMULATION_TYPES)[number], string> = {
  'marketing-campaign': 'Marketing Campaigns',
  'pricing-change': 'Pricing Changes',
  'hiring-plan': 'Hiring Plans',
  'department-expansion': 'Department Expansion',
  'product-launch': 'Product Launches',
  'geographic-expansion': 'Geographic Expansion',
  'inventory-change': 'Inventory Changes',
  'membership-model': 'Membership Models',
  'automation-rollout': 'Automation Rollouts',
  'subscription-model': 'Subscription Models',
  'revenue-forecast': 'Revenue Forecasts',
  'digital-workforce-growth': 'Digital Workforce Growth',
  'knowledge-product-launch': 'Knowledge Product Launches',
  'operational-change': 'Operational Changes',
};

export const LAB_INTELLIGENCE_SOURCES = [
  'profession-brain',
  'memory-engine',
  'wisdom-capture',
  'company-health-index',
  'organization-pulse',
  'executive-council',
  'organization-digital-twin',
  'simulation-engine',
  'strategy-engine',
] as const;

/** Simulations above this confidence threshold trigger full Executive Council review. */
export const MAJOR_SIMULATION_CONFIDENCE_THRESHOLD = 70;
