/** Leadership Modes V1.0 — founder & executive mode adaptation (Milestone 73). */

export type LeadershipModesWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type LeadershipModeId = 'founder' | 'executive' | 'creator' | 'operator';

export type LeadershipModeDetail = {
  id: LeadershipModeId;
  label: string;
  tagline: string;
  priorities: string[];
  active: boolean;
};

export type ModeDetection = {
  id: string;
  signal: string;
  recommendedMode: LeadershipModeId;
  confidence: number;
  overrideAllowed: boolean;
};

export type AdaptiveInterfaceAdjustment = {
  id: string;
  area: string;
  currentMode: LeadershipModeId;
  adjustment: string;
};

export type ChiefOfStaffBriefing = {
  id: string;
  mode: LeadershipModeId;
  briefingType: string;
  summary: string;
  anticipates: string;
};

export type ExecutiveBehavior = {
  id: string;
  executive: string;
  mode: LeadershipModeId;
  communicationStyle: string;
  example: string;
};

export type OiModeIntegration = {
  id: string;
  evaluation: string;
  recommendation: LeadershipModeId;
  rationale: string;
};

export type CampusTransformation = {
  id: string;
  mode: LeadershipModeId;
  ambiance: string;
  spaces: string;
  feeling: string;
};

export type LeadershipTransition = {
  id: string;
  fromMode: LeadershipModeId;
  toMode: LeadershipModeId;
  preserved: string[];
  instant: boolean;
};

export type LeadershipModesStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: LeadershipModesWorkspaceId;
  companyName: string;
  activeModeId: LeadershipModeId;
  recommendedModeId: LeadershipModeId;
  dashboard: {
    summary: string;
    activeModeLabel: string;
    recommendedModeLabel: string;
    detectionConfidencePct: number;
    transitionsToday: number;
    briefingReady: boolean;
    campusAmbiance: string;
  };
  leadershipPhilosophy: string[];
  leadershipModes: LeadershipModeDetail[];
  modeDetections: ModeDetection[];
  adaptiveInterface: AdaptiveInterfaceAdjustment[];
  chiefOfStaffBriefings: ChiefOfStaffBriefing[];
  executiveBehaviors: ExecutiveBehavior[];
  oiModeIntegration: OiModeIntegration[];
  campusTransformations: CampusTransformation[];
  leadershipTransitions: LeadershipTransition[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
