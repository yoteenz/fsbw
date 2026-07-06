import { SIMULATION_PERSONAS, SIMULATION_SCENARIOS } from './constants';
import type { ProductionGateEntry, SimulationPersona, SimulationRunResult, SimulationScenario } from './types';

const PERSONA_LABELS: Record<SimulationPersona, string> = {
  customer: 'Customer',
  employee: 'Employee',
  administrator: 'Administrator',
  expert: 'Expert',
  marketplace: 'Marketplace',
  guest: 'Guest',
  founder: 'Founder',
};

const SCENARIO_LABELS: Record<SimulationScenario, string> = {
  'create-customer-account': 'Create Customer Account',
  'purchase-product': 'Purchase Product',
  'book-appointment': 'Book Appointment',
  'request-legal-advice': 'Request Legal Advice',
  'upload-tax-documents': 'Upload Tax Documents',
  'file-quarterly-fuel-taxes': 'File Quarterly Fuel Taxes',
  'publish-knowledge': 'Publish Knowledge',
  'hire-expert': 'Hire Expert',
  'complete-onboarding': 'Complete Onboarding',
  'trigger-automations': 'Trigger Automations',
};

const SIMULATION_SEEDS: Omit<
  SimulationRunResult,
  'id' | 'ranAt' | 'personaLabel' | 'scenarioLabel' | 'productionReady'
>[] = [
  {
    persona: 'customer',
    scenario: 'book-appointment',
    status: 'warning',
    successRatePct: 78,
    confusingScreens: ['Time slot picker — timezone unclear', 'Confirmation page missing booking reference'],
    brokenFlows: [],
    missingInformation: ['Cancellation policy not shown before confirm'],
    accessibilityIssues: ['Time picker lacks keyboard navigation'],
    performanceBottlenecks: ['Calendar load 2.8s on mobile'],
    expectedCompletionMinutes: 4,
    dropOffRiskPct: 22,
    suggestedImprovements: ['Add timezone label', 'Show booking reference on confirmation', 'Surface cancellation policy'],
  },
  {
    persona: 'customer',
    scenario: 'purchase-product',
    status: 'passed',
    successRatePct: 94,
    confusingScreens: [],
    brokenFlows: [],
    missingInformation: [],
    accessibilityIssues: [],
    performanceBottlenecks: ['Checkout step 2.1s'],
    expectedCompletionMinutes: 3,
    dropOffRiskPct: 6,
    suggestedImprovements: ['Optimize checkout asset loading'],
  },
  {
    persona: 'employee',
    scenario: 'complete-onboarding',
    status: 'failed',
    successRatePct: 62,
    confusingScreens: ['Permission overview uses internal role names'],
    brokenFlows: ['Step 4 redirects to deprecated dashboard'],
    missingInformation: ['Missing permission acknowledgment step'],
    accessibilityIssues: ['Progress indicator not announced to screen readers'],
    performanceBottlenecks: [],
    expectedCompletionMinutes: 18,
    dropOffRiskPct: 38,
    suggestedImprovements: ['Fix step 4 redirect', 'Add permission acknowledgment', 'Use plain-language role names'],
  },
  {
    persona: 'administrator',
    scenario: 'trigger-automations',
    status: 'passed',
    successRatePct: 91,
    confusingScreens: [],
    brokenFlows: [],
    missingInformation: [],
    accessibilityIssues: [],
    performanceBottlenecks: ['Automation log panel 2.4s'],
    expectedCompletionMinutes: 2,
    dropOffRiskPct: 4,
    suggestedImprovements: ['Paginate automation logs'],
  },
  {
    persona: 'expert',
    scenario: 'request-legal-advice',
    status: 'warning',
    successRatePct: 81,
    confusingScreens: ['Escalation boundary not visible to expert'],
    brokenFlows: [],
    missingInformation: ['Client jurisdiction field optional but required downstream'],
    accessibilityIssues: [],
    performanceBottlenecks: [],
    expectedCompletionMinutes: 12,
    dropOffRiskPct: 14,
    suggestedImprovements: ['Show Professional Trust Framework boundaries', 'Require jurisdiction before submit'],
  },
  {
    persona: 'founder',
    scenario: 'publish-knowledge',
    status: 'passed',
    successRatePct: 96,
    confusingScreens: [],
    brokenFlows: [],
    missingInformation: [],
    accessibilityIssues: [],
    performanceBottlenecks: [],
    expectedCompletionMinutes: 5,
    dropOffRiskPct: 2,
    suggestedImprovements: [],
  },
  {
    persona: 'guest',
    scenario: 'create-customer-account',
    status: 'warning',
    successRatePct: 84,
    confusingScreens: ['Account type selection unclear for business vs personal'],
    brokenFlows: [],
    missingInformation: ['Privacy policy link below fold on mobile'],
    accessibilityIssues: ['Form labels missing aria-describedby'],
    performanceBottlenecks: ['Signup page 2.6s TTI'],
    expectedCompletionMinutes: 3,
    dropOffRiskPct: 16,
    suggestedImprovements: ['Clarify account types', 'Move privacy policy above fold', 'Add aria labels'],
  },
];

export function buildSimulationRuns(now: string): SimulationRunResult[] {
  return SIMULATION_SEEDS.map((seed, idx) => ({
    ...seed,
    id: `sim-${idx + 1}`,
    personaLabel: PERSONA_LABELS[seed.persona],
    scenarioLabel: SCENARIO_LABELS[seed.scenario],
    ranAt: new Date(Date.parse(now) - idx * 5400000).toISOString(),
    productionReady: seed.status === 'passed' && seed.successRatePct >= 90,
  }));
}

export function buildProductionGates(now: string): ProductionGateEntry[] {
  return [
    {
      changeType: 'new-workflow',
      changeLabel: 'Customer Booking Workflow v3',
      gateStatus: 'conditional',
      simulationsRequired: 3,
      simulationsPassed: 2,
      blockedReason: 'Customer simulation warning — confirmation step incomplete.',
      lastCheckedAt: now,
    },
    {
      changeType: 'updated-profession-brain',
      changeLabel: 'Legal Brain boundary update',
      gateStatus: 'cleared',
      simulationsRequired: 2,
      simulationsPassed: 2,
      lastCheckedAt: now,
    },
    {
      changeType: 'automation-change',
      changeLabel: 'Welcome email automation',
      gateStatus: 'blocked',
      simulationsRequired: 2,
      simulationsPassed: 0,
      blockedReason: 'Conflicting automation detected — resolve in QA Inspector first.',
      lastCheckedAt: now,
    },
  ];
}

export function computeSimulationScore(runs: SimulationRunResult[]): number {
  if (runs.length === 0) return 0;
  const avg = runs.reduce((sum, r) => sum + r.successRatePct, 0) / runs.length;
  return Math.round(avg);
}

export function computeAverageSuccessRate(runs: SimulationRunResult[]): number {
  return computeSimulationScore(runs);
}

export function resolveProductionGateStatus(gates: ProductionGateEntry[]): ProductionGateEntry['gateStatus'] {
  if (gates.some((g) => g.gateStatus === 'blocked')) return 'blocked';
  if (gates.some((g) => g.gateStatus === 'conditional')) return 'conditional';
  return 'cleared';
}

export { PERSONA_LABELS, SCENARIO_LABELS, SIMULATION_PERSONAS, SIMULATION_SCENARIOS };
