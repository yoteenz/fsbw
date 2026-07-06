import type { ExecutiveBriefing } from '../executive-council/org-types';
import type { LAB_SIMULATION_TYPES } from './constants';

export type LabSimulationType = (typeof LAB_SIMULATION_TYPES)[number];

export type SimulationCouncilReview = {
  reviewedAt: string;
  participants: string[];
  summary: string;
  recommendations: string[];
  risks: string[];
  confidencePct: number;
  briefing?: ExecutiveBriefing;
};

export type BusinessSimulationReport = {
  id: string;
  organizationId: string;
  query: string;
  scenarioTitle: string;
  simulationType: LabSimulationType;
  runAt: string;
  sandbox: true;
  executiveSummary: string;
  predictedOutcomes: string[];
  revenueImpact: string;
  customerImpact: string;
  operationalImpact: string;
  departmentImpact: string[];
  riskAssessment: string[];
  confidenceScore: number;
  requiredResources: string[];
  suggestedImprovements: string[];
  alternativeStrategies: string[];
  councilReview: SimulationCouncilReview;
  intelligenceSourcesUsed: string[];
};

export type ScenarioLibraryEntry = {
  id: string;
  scenario: string;
  simulationType: LabSimulationType;
  date: string;
  decision: 'pending' | 'approved' | 'deferred' | 'rejected' | 'implemented';
  outcome: string;
  actualResults?: string;
  lessonsLearned: string[];
  reportId: string;
  confidenceScore: number;
};

export type OrganizationSimulationLabProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  labReadinessScore: number;
  totalSimulationsRun: number;
  scenariosPendingDecision: number;
  reports: BusinessSimulationReport[];
  scenarioLibrary: ScenarioLibraryEntry[];
  syncedSources: string[];
};

export type BusinessSimulationLabStore = {
  version: string;
  profiles: OrganizationSimulationLabProfile[];
};

export type SimulationLabDockAdvice = {
  response: string;
  concierge: string;
  report?: BusinessSimulationReport;
  labReadinessScore?: number;
};
