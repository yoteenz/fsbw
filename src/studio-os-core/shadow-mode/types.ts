import type { SHADOW_CONFIDENCE_DIMENSIONS, SHADOW_LEARNING_PHASES } from './constants';

export type ShadowLearningPhase = (typeof SHADOW_LEARNING_PHASES)[number];
export type ShadowConfidenceDimension = (typeof SHADOW_CONFIDENCE_DIMENSIONS)[number];

export type ConciergeConfidenceScores = {
  knowledgeConfidence: number;
  workflowConfidence: number;
  decisionConfidence: number;
  automationReadiness: number;
  overallConfidence: number;
};

export type ConciergeShadowProfile = {
  conciergeId: string;
  conciergeName: string;
  department: string;
  currentPhase: ShadowLearningPhase;
  confidence: ConciergeConfidenceScores;
  automationThreshold: number;
  observationsCount: number;
  patternsLearned: number;
  recommendationsOffered: number;
  assistedWorkflows: number;
  automatedWorkflows: number;
  canAutomate: boolean;
  phaseRationale: string;
};

export type ShadowTransparencyEntry = {
  id: string;
  conciergeId: string;
  conciergeName: string;
  recordedAt: string;
  observed: string;
  learned: string;
  canAutomate: string;
  confidenceReason: string;
  phase: ShadowLearningPhase;
};

export type FounderPhaseThresholds = {
  observeMax: number;
  recommendMax: number;
  assistMax: number;
  automateMin: number;
};

export type OrganizationShadowModeProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  overallTrustScore: number;
  conciergesInShadow: number;
  conciergesReadyToAutomate: number;
  phaseThresholds: FounderPhaseThresholds;
  conciergeProfiles: ConciergeShadowProfile[];
  transparencyLog: ShadowTransparencyEntry[];
  syncedSources: string[];
};

export type ShadowModeStore = {
  version: string;
  profiles: OrganizationShadowModeProfile[];
};

export type ShadowModeDockAdvice = {
  response: string;
  concierge: string;
  phase?: ShadowLearningPhase;
  overallTrustScore?: number;
};
