/** Milestone 103 — Organization Digital Twin™ V1.0 */

export const DIGITAL_TWIN_STORAGE_KEY = 'studioOsOrganizationDigitalTwin_v1';
export const DIGITAL_TWIN_VERSION = '1.0.0';
export const STUDIO_OS_DIGITAL_TWIN_UPDATED = 'studio-os-organization-digital-twin-updated';

export const DIGITAL_TWIN_PHILOSOPHY = [
  'Founders should safely explore future decisions before making them.',
  'The Digital Twin™ simulates the organization — it does not replace it.',
  'All simulations occur inside a sandbox — no real data changes, no workflows execute.',
  'Test ideas before testing reality — explore the future safely before acting.',
] as const;

export const SANDBOX_GUARANTEES = [
  'No real data changes',
  'No workflows execute',
  'No customers are affected',
  'Founders should feel free to experiment',
] as const;

export const TWIN_SCENARIO_TYPES = [
  'hire-employees',
  'expand-departments',
  'install-department-pack',
  'launch-product',
  'enter-market',
  'increase-prices',
  'reduce-prices',
  'add-digital-staff',
  'remove-digital-staff',
  'marketing-campaign',
  'operational-change',
] as const;

export const TWIN_SCENARIO_LABELS: Record<(typeof TWIN_SCENARIO_TYPES)[number], string> = {
  'hire-employees': 'Hiring Employees',
  'expand-departments': 'Expanding Departments',
  'install-department-pack': 'Installing Department Packs',
  'launch-product': 'Launching Products',
  'enter-market': 'Entering New Markets',
  'increase-prices': 'Increasing Prices',
  'reduce-prices': 'Reducing Prices',
  'add-digital-staff': 'Adding Digital Staff',
  'remove-digital-staff': 'Removing Digital Staff',
  'marketing-campaign': 'Marketing Campaigns',
  'operational-change': 'Operational Changes',
};

export const TWIN_INTELLIGENCE_SOURCES = [
  'profession-brain',
  'memory-engine',
  'wisdom-capture',
  'company-health-index',
  'organization-pulse',
  'executive-council',
  'shadow-mode',
  'business-discovery-blueprint',
  'simulation-engine',
] as const;
