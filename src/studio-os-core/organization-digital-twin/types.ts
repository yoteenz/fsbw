import type {
  SANDBOX_REPLICA_COMPONENTS,
  TWIN_RISK_LEVELS,
  TWIN_SCENARIO_TYPES,
  TWIN_TEST_CATEGORIES,
} from './constants';

export type TwinScenarioType = (typeof TWIN_SCENARIO_TYPES)[number];
export type SandboxReplicaId = (typeof SANDBOX_REPLICA_COMPONENTS)[number];
export type TwinTestCategory = (typeof TWIN_TEST_CATEGORIES)[number];
export type TwinRiskLevel = (typeof TWIN_RISK_LEVELS)[number];

export type TwinDepartmentSnapshot = {
  id: string;
  name: string;
  headcount: number;
  digitalStaffCount: number;
  healthScore: number;
  pulseScore: number;
};

export type TwinOrganizationSnapshot = {
  capturedAt: string;
  departmentCount: number;
  totalHeadcount: number;
  digitalStaffCount: number;
  executiveHealthScore: number;
  pulseScore: number;
  pulseState: string;
  memoryEntries: number;
  wisdomEntries: number;
  departments: TwinDepartmentSnapshot[];
};

export type SandboxReplicaComponent = {
  componentId: SandboxReplicaId;
  label: string;
  status: 'active' | 'syncing' | 'ready';
  fidelityPct: number;
  entityCount: number;
  lastSyncedAt: string;
  summary: string;
};

export type WhatIfSimulationResult = {
  id: string;
  organizationId: string;
  query: string;
  scenarioType: TwinScenarioType;
  scenarioLabel: string;
  testCategory?: TwinTestCategory;
  runAt: string;
  sandbox: true;
  /** M141 structured results */
  riskLevel: TwinRiskLevel;
  confidenceLevel: number;
  affectedDepartments: string[];
  expectedOutcome: string;
  unexpectedSideEffects: string[];
  rollbackPlan: string;
  /** Legacy fields preserved for backward compatibility */
  predictedImpact: string;
  departmentsAffected: string[];
  revenueImplications: string;
  operationalImpact: string;
  risks: string[];
  recommendedNextSteps: string[];
  executiveBriefing: string;
  intelligenceSourcesUsed: string[];
  productionGateRequired: boolean;
};

export type OrganizationDigitalTwinProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  twinFidelityScore: number;
  snapshot: TwinOrganizationSnapshot;
  sandboxReplicas: SandboxReplicaComponent[];
  simulationHistory: WhatIfSimulationResult[];
  sandboxActive: true;
  practiceBeforePerform: true;
  syncedSources: string[];
  dockTwinLine: string;
};

export type OrganizationDigitalTwinStore = {
  version: string;
  profiles: OrganizationDigitalTwinProfile[];
};

export type DigitalTwinDockAdvice = {
  response: string;
  concierge: string;
  briefing?: WhatIfSimulationResult;
  twinFidelityScore?: number;
};
