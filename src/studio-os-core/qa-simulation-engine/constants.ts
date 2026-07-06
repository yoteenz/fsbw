/** Milestone 144 — QA Simulation Engine™ · Pre-production experience rehearsal */

export const QA_SIMULATION_ENGINE_STORAGE_KEY = 'studioOsQaSimulationEngine_v1';
export const QA_SIMULATION_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED = 'studio-os-qa-simulation-engine-updated';

export const QA_SIMULATION_ENGINE_ACCENT = '#6366F1';

export const QA_SIMULATION_ENGINE_PHILOSOPHY = [
  'Nothing significant reaches production until Studio OS has experienced it as a real person would.',
  'The QA Simulation Engine™ is Studio OS\'s practice field — every major experience rehearsed before users encounter it.',
  'Simulate as customer, employee, administrator, expert, founder — exactly as real users would.',
  'Simulation results reveal broken flows, confusing screens, and drop-off risk before trust is lost.',
] as const;

export const SIMULATION_PERSONAS = [
  'customer',
  'employee',
  'administrator',
  'expert',
  'marketplace',
  'guest',
  'founder',
] as const;

export const SIMULATION_SCENARIOS = [
  'create-customer-account',
  'purchase-product',
  'book-appointment',
  'request-legal-advice',
  'upload-tax-documents',
  'file-quarterly-fuel-taxes',
  'publish-knowledge',
  'hire-expert',
  'complete-onboarding',
  'trigger-automations',
] as const;

export const SIMULATION_STATUSES = ['passed', 'warning', 'failed', 'running', 'queued'] as const;

export const PRODUCTION_GATE_STATUSES = ['cleared', 'blocked', 'conditional'] as const;
