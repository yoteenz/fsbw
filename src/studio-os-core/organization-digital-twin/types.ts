import type { TWIN_SCENARIO_TYPES } from './constants';

export type TwinScenarioType = (typeof TWIN_SCENARIO_TYPES)[number];

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

export type WhatIfSimulationResult = {
  id: string;
  organizationId: string;
  query: string;
  scenarioType: TwinScenarioType;
  scenarioLabel: string;
  runAt: string;
  sandbox: true;
  predictedImpact: string;
  departmentsAffected: string[];
  revenueImplications: string;
  operationalImpact: string;
  risks: string[];
  confidenceLevel: number;
  recommendedNextSteps: string[];
  executiveBriefing: string;
  intelligenceSourcesUsed: string[];
};

export type OrganizationDigitalTwinProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  twinFidelityScore: number;
  snapshot: TwinOrganizationSnapshot;
  simulationHistory: WhatIfSimulationResult[];
  sandboxActive: true;
  syncedSources: string[];
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
