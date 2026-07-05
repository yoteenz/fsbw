/** Concierge Layer — founder-facing experience on top of executive organization. */

export type ConciergeLayerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ConciergeId =
  | 'chief-concierge'
  | 'brand-concierge'
  | 'experience-concierge'
  | 'digital-concierge'
  | 'technology-concierge'
  | 'growth-concierge'
  | 'knowledge-concierge'
  | 'launch-concierge';

export type ConciergeIdentity = {
  id: ConciergeId;
  conciergeTitle: string;
  representsExecutive: string;
  tagline: string;
  teaches: string[];
  behavior: string[];
  exampleInteraction: string;
};

export type ConciergeBehaviorPrinciple = {
  id: string;
  principle: string;
  description: string;
};

export type ConciergeExperienceMoment = {
  id: string;
  experience: string;
  chiefConciergeRole: string;
  timing: 'begin' | 'conclude' | 'both';
};

export type ConciergeRelationshipExample = {
  id: string;
  founderQuestion: string;
  concierge: string;
  behindTheScenes: string;
  founderExperience: string;
};

export type ConciergeLayerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ConciergeLayerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    conciergeTeamSize: number;
    activeGuidanceSessions: number;
    founderSatisfactionPct: number;
    recommendationsToday: number;
    organizationalConfidencePct: number;
  };
  conciergePhilosophy: string[];
  conciergeIdentities: ConciergeIdentity[];
  conciergeBehavior: ConciergeBehaviorPrinciple[];
  chiefConciergeExperience: ConciergeExperienceMoment[];
  relationshipExamples: ConciergeRelationshipExample[];
  terminologyMap: { founderFacing: string; internalGovernance: string }[];
  futureOpportunities: string[];
};
