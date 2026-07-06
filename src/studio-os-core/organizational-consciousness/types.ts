import type {
  CONNECTED_SYSTEMS,
  LEARNING_CONTRIBUTION_TYPES,
  REASONING_FACTORS,
} from './constants';

export type ConnectedSystemId = (typeof CONNECTED_SYSTEMS)[number];
export type ReasoningFactor = (typeof REASONING_FACTORS)[number];
export type LearningContributionType = (typeof LEARNING_CONTRIBUTION_TYPES)[number];

export type ConnectedSystemSnapshot = {
  systemId: ConnectedSystemId;
  label: string;
  connected: boolean;
  contextShared: string;
  vitalityPct: number;
  lastSyncedAt: string;
};

export type ReasoningFactorSnapshot = {
  factor: ReasoningFactor;
  label: string;
  insight: string;
  weightPct: number;
  considered: true;
};

export type HolisticRecommendation = {
  id: string;
  recommendation: string;
  reasoning: string;
  factorsConsidered: ReasoningFactor[];
  confidencePct: number;
  holistic: true;
};

export type ContinuousLearningSignal = {
  id: string;
  type: LearningContributionType;
  label: string;
  contribution: string;
  strengthenedAt: string;
};

export type OrganizationConsciousnessProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  consciousnessScore: number;
  systemsConnected: number;
  systemsTotal: number;
  reasoningFactorsActive: number;
  learningSignalsCount: number;
  connectedSystems: ConnectedSystemSnapshot[];
  reasoningContext: ReasoningFactorSnapshot[];
  holisticRecommendations: HolisticRecommendation[];
  continuousLearning: ContinuousLearningSignal[];
  executiveIdentityLine: string;
  dockConsciousnessLine: string;
  unifiedIntelligence: true;
  syncedSources: string[];
};

export type OrganizationalConsciousnessStore = {
  version: string;
  profiles: OrganizationConsciousnessProfile[];
};

export type OrganizationalConsciousnessDockAdvice = {
  response: string;
  concierge: string;
  consciousnessScore?: number;
  systemsConnected?: number;
};
