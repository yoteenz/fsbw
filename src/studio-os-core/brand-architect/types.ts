/** Brand Architect V1.0 — cohesive brand systems from validated business (Milestone 53). */

export type BrandArchitectWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type BrandApprovalStatus = 'draft' | 'in-review' | 'approved' | 'handed-off';

export type BrandBlueprint = {
  purpose: string;
  promise: string;
  positioning: string;
  mission: string;
  vision: string;
  values: string[];
  personality: string[];
  archetype: string;
  voice: string;
  tone: string;
  communicationPrinciples: string[];
  brandPhilosophy: string;
  competitivePositioning: string;
  emotionalPositioning: string;
};

export type VerbalIdentity = {
  companyName: string;
  taglineOptions: string[];
  selectedTagline: string;
  messagingPillars: string[];
  elevatorPitch: string;
  brandStory: string;
  originStory: string;
  manifesto: string;
  brandVocabulary: string[];
  communicationRules: string[];
  writingStyle: string;
  headlineSystems: string[];
  ctaSystems: string[];
};

export type VisualIdentityElement = {
  id: string;
  category: string;
  label: string;
  direction: string;
  status: 'defined' | 'exploring' | 'approved';
};

export type BrandSystemItem = {
  id: string;
  system: string;
  description: string;
  status: 'draft' | 'active' | 'approved';
};

export type CompetitiveComparison = {
  id: string;
  competitor: string;
  positioning: string;
  visualDifferentiation: string;
  saturation: 'low' | 'medium' | 'high';
  whitespace: string;
};

export type BrandSimulation = {
  id: string;
  label: string;
  recognitionPct: number;
  memorabilityPct: number;
  luxuryPerceptionPct: number;
  trustPct: number;
  clarityPct: number;
  differentiationPct: number;
  emotionalResponse: string;
  confidencePct: number;
  recommendations: string[];
};

export type BrandHealthMetrics = {
  overallPct: number;
  coherencePct: number;
  consistencyPct: number;
  differentiationPct: number;
  emotionalResonancePct: number;
  systemCompletenessPct: number;
  strengths: string[];
  weaknesses: string[];
};

export type BrandEvolutionEntry = {
  id: string;
  date: string;
  label: string;
  type: 'founding' | 'refinement' | 'launch' | 'rebrand' | 'future';
};

export type ExperienceArchitectHandoff = {
  status: 'pending' | 'ready' | 'transferred';
  transferredAt: string | null;
  inheritedSystems: string[];
  downstreamTargets: string[];
};

export type BrandArchitectDashboard = {
  summary: string;
  brandHealthPct: number;
  blueprintCompletenessPct: number;
  verbalIdentityPct: number;
  visualIdentityPct: number;
  systemsPct: number;
  approvalStatus: BrandApprovalStatus;
};

export type BrandArchitectStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: BrandArchitectWorkspaceId;
  companyName: string;
  dashboard: BrandArchitectDashboard;
  brandPhilosophy: string[];
  blueprint: BrandBlueprint;
  verbalIdentity: VerbalIdentity;
  visualIdentity: VisualIdentityElement[];
  brandSystems: BrandSystemItem[];
  competitiveIntel: CompetitiveComparison[];
  competitiveOpportunities: string[];
  brandSimulations: BrandSimulation[];
  brandHealth: BrandHealthMetrics;
  brandEvolution: BrandEvolutionEntry[];
  futureOpportunities: string[];
  experienceHandoff: ExperienceArchitectHandoff;
};
