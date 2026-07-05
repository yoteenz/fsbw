/** Experience Architect V1.0 — emotional design for every touchpoint (Milestone 54). */

export type ExperienceArchitectWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type ExperienceBlueprintStageId =
  | 'first-impression'
  | 'brand-discovery'
  | 'customer-onboarding'
  | 'education'
  | 'purchase-journey'
  | 'checkout'
  | 'confirmation'
  | 'shipping'
  | 'product'
  | 'support'
  | 'membership'
  | 'renewal'
  | 'community'
  | 'referral'
  | 'anniversary'
  | 'win-back'
  | 'advocacy'
  | 'long-term-relationship';

export type ExperienceBlueprintStage = {
  id: ExperienceBlueprintStageId;
  label: string;
  emotionalGoal: string;
  identityReinforcement: string;
  status: 'defined' | 'optimizing' | 'approved';
};

export type JourneyTouchpoint = {
  id: string;
  stage: string;
  touchpoint: string;
  entryPoint: boolean;
  frictionScore: number;
  delightScore: number;
  trustBuilder: boolean;
  relationshipMilestone: boolean;
  dropOffRisk: 'low' | 'medium' | 'high';
  relationshipEngineLink: string;
};

export type EmotionalStage = {
  id: string;
  emotion: string;
  sequence: number;
  description: string;
  designedOutcome: string;
};

export type ExperienceSystem = {
  id: string;
  system: string;
  philosophy: string;
  status: 'draft' | 'active' | 'approved';
};

export type MicroExperience = {
  id: string;
  category: string;
  label: string;
  identityReinforcement: string;
  status: 'defined' | 'approved';
};

export type ExperienceSimulation = {
  id: string;
  persona: string;
  channel: string;
  frictionPct: number;
  clarityPct: number;
  emotionScore: number;
  trustPct: number;
  confidencePct: number;
  recommendations: string[];
};

export type ExperienceIntelligenceAlert = {
  id: string;
  category: string;
  signal: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type CrossChannelItem = {
  id: string;
  channel: string;
  consistencyPct: number;
  status: 'unified' | 'partial' | 'gap';
  notes: string;
};

export type ExperienceStandard = {
  id: string;
  standard: string;
  metric: string;
  target: string;
  status: 'defined' | 'measured' | 'active';
};

export type DigitalArchitectHandoff = {
  status: 'pending' | 'ready' | 'transferred';
  transferredAt: string | null;
  inheritedAssets: string[];
  downstreamTargets: string[];
};

export type ExperienceArchitectDashboard = {
  summary: string;
  experienceHealthPct: number;
  journeyCompletenessPct: number;
  emotionalCoherencePct: number;
  relationshipImpactPct: number;
  crossChannelConsistencyPct: number;
  approvalStatus: 'draft' | 'in-review' | 'approved' | 'handed-off';
};

export type ExperienceArchitectStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ExperienceArchitectWorkspaceId;
  companyName: string;
  dashboard: ExperienceArchitectDashboard;
  experiencePhilosophy: string[];
  blueprintStages: ExperienceBlueprintStage[];
  journeyTouchpoints: JourneyTouchpoint[];
  emotionalArchitecture: EmotionalStage[];
  experienceSystems: ExperienceSystem[];
  microExperiences: MicroExperience[];
  simulations: ExperienceSimulation[];
  intelligenceAlerts: ExperienceIntelligenceAlert[];
  crossChannel: CrossChannelItem[];
  experienceStandards: ExperienceStandard[];
  frictionAnalysis: string[];
  retentionOpportunities: string[];
  digitalHandoff: DigitalArchitectHandoff;
};
