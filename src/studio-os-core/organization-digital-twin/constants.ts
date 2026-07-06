/** Milestone 145 — Digital Twin™ V2.0 · Complete sandbox replica for Studio Intelligence™ */

export const DIGITAL_TWIN_STORAGE_KEY = 'studioOsOrganizationDigitalTwin_v1';
export const DIGITAL_TWIN_VERSION = '2.0.0';
export const STUDIO_OS_DIGITAL_TWIN_UPDATED = 'studio-os-organization-digital-twin-updated';

export const DIGITAL_TWIN_ACCENT = '#9333EA';

export const DIGITAL_TWIN_PHILOSOPHY = [
  'Every organization receives a complete sandbox replica — Studio OS practices before it performs.',
  'No major operational change should be recommended until tested inside the Digital Twin™.',
  'Studio Intelligence™ safely tests ideas before they affect the real business.',
  'The Digital Twin™ simulates the organization — it does not replace it.',
] as const;

export const SANDBOX_GUARANTEES = [
  'No real data changes',
  'No production workflows execute',
  'No real customers or employees affected',
  'Studio Intelligence tests safely before recommending',
  'Founders and administrators feel free to experiment',
] as const;

/** Every organization automatically receives these sandbox replicas */
export const SANDBOX_REPLICA_COMPONENTS = [
  'sandbox-headquarters',
  'sandbox-profession-brains',
  'sandbox-workflows',
  'sandbox-automations',
  'sandbox-marketplace',
  'sandbox-knowledge-graph',
  'sandbox-integrations',
  'sandbox-customers',
  'sandbox-employees',
  'sandbox-analytics',
] as const;

export const SANDBOX_REPLICA_LABELS: Record<(typeof SANDBOX_REPLICA_COMPONENTS)[number], string> = {
  'sandbox-headquarters': 'Sandbox Headquarters™',
  'sandbox-profession-brains': 'Sandbox Profession Brains™',
  'sandbox-workflows': 'Sandbox Workflows',
  'sandbox-automations': 'Sandbox Automations',
  'sandbox-marketplace': 'Sandbox Marketplace',
  'sandbox-knowledge-graph': 'Sandbox Knowledge Graph',
  'sandbox-integrations': 'Sandbox Integrations',
  'sandbox-customers': 'Sandbox Customers',
  'sandbox-employees': 'Sandbox Employees',
  'sandbox-analytics': 'Sandbox Analytics',
};

/** What Studio Intelligence™ can safely test in the twin */
export const TWIN_TEST_CATEGORIES = [
  'new-automations',
  'workflow-improvements',
  'profession-brain-updates',
  'marketplace-changes',
  'prompt-revisions',
  'ui-redesigns',
  'permission-updates',
  'ai-models',
  'business-rules',
  'pricing-strategies',
  'scheduling-logic',
] as const;

export const TWIN_TEST_CATEGORY_LABELS: Record<(typeof TWIN_TEST_CATEGORIES)[number], string> = {
  'new-automations': 'New Automations',
  'workflow-improvements': 'Workflow Improvements',
  'profession-brain-updates': 'Profession Brain Updates',
  'marketplace-changes': 'Marketplace Changes',
  'prompt-revisions': 'Prompt Revisions',
  'ui-redesigns': 'UI Redesigns',
  'permission-updates': 'Permission Updates',
  'ai-models': 'AI Models',
  'business-rules': 'Business Rules',
  'pricing-strategies': 'Pricing Strategies',
  'scheduling-logic': 'Scheduling Logic',
};

export const TWIN_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

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
  'remove-approval-step',
  'integration-disconnect',
  'ai-model-replacement',
  'payroll-change',
  'traffic-surge',
  'workflow-improvement',
  'brain-update',
  'permission-change',
  'prompt-revision',
  'ui-redesign',
  'scheduling-change',
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
  'remove-approval-step': 'Removing Approval Step',
  'integration-disconnect': 'Integration Disconnect',
  'ai-model-replacement': 'AI Model Replacement',
  'payroll-change': 'Payroll Change',
  'traffic-surge': 'Customer Traffic Surge',
  'workflow-improvement': 'Workflow Improvement',
  'brain-update': 'Profession Brain Update',
  'permission-change': 'Permission Update',
  'prompt-revision': 'Prompt Revision',
  'ui-redesign': 'UI Redesign',
  'scheduling-change': 'Scheduling Logic Change',
};

export const TWIN_EXAMPLE_QUERIES = [
  'What happens if we remove this approval step?',
  'What happens if Instagram disconnects?',
  'What happens if AI Model A is replaced?',
  'What happens if payroll doubles?',
  'What happens if 500 customers arrive at once?',
] as const;

export const TWIN_INTELLIGENCE_SOURCES = [
  'profession-brain',
  'memory-engine',
  'wisdom-capture',
  'company-health-index',
  'organization-pulse',
  'executive-council',
  'shadow-mode',
  'business-discovery-blueprint',
  'studio-intelligence',
  'qa-simulation-engine',
  'workflow-engine',
  'automation-registry',
  'knowledge-graph',
] as const;
