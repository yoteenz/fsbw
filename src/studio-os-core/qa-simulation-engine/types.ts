import type {
  PRODUCTION_GATE_STATUSES,
  QA_SIMULATION_ENGINE_PHILOSOPHY,
  SIMULATION_PERSONAS,
  SIMULATION_SCENARIOS,
  SIMULATION_STATUSES,
} from './constants';

export type SimulationPersona = (typeof SIMULATION_PERSONAS)[number];
export type SimulationScenario = (typeof SIMULATION_SCENARIOS)[number];
export type SimulationStatus = (typeof SIMULATION_STATUSES)[number];
export type ProductionGateStatus = (typeof PRODUCTION_GATE_STATUSES)[number];
export type QaSimulationPhilosophyLine = (typeof QA_SIMULATION_ENGINE_PHILOSOPHY)[number];

export type SimulationRunResult = {
  id: string;
  persona: SimulationPersona;
  personaLabel: string;
  scenario: SimulationScenario;
  scenarioLabel: string;
  status: SimulationStatus;
  successRatePct: number;
  confusingScreens: string[];
  brokenFlows: string[];
  missingInformation: string[];
  accessibilityIssues: string[];
  performanceBottlenecks: string[];
  expectedCompletionMinutes: number;
  dropOffRiskPct: number;
  suggestedImprovements: string[];
  ranAt: string;
  productionReady: boolean;
};

export type ProductionGateEntry = {
  changeType: string;
  changeLabel: string;
  gateStatus: ProductionGateStatus;
  simulationsRequired: number;
  simulationsPassed: number;
  blockedReason?: string;
  lastCheckedAt: string;
};

export type OrganizationQaSimulationEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  simulationScore: number;
  averageSuccessRate: number;
  productionGateStatus: ProductionGateStatus;
  simulationsRun: number;
  simulationsPassed: number;
  recentSimulations: SimulationRunResult[];
  productionGates: ProductionGateEntry[];
  dockSimulationLine: string;
  practiceFieldActive: true;
  lastSyncedAt: string;
};

export type QaSimulationEngineStore = {
  version: string;
  profiles: OrganizationQaSimulationEngineProfile[];
};

export type QaSimulationEngineDockAdvice = {
  response: string;
  concierge: string;
  simulationScore?: number;
};

export type QaSimulationSearchHit = {
  type: 'simulation' | 'persona' | 'gate';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
