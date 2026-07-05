/** Leadership Manifesto Framework V1.0 — constitutional foundation inherited by every executive (Milestone 60.5). */

export type LeadershipManifestoFrameworkWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ExecutiveManifestoIdentity = {
  id: string;
  executiveTitle: string;
  organizationalPurpose: string;
  leadershipMission: string;
  responsibilities: string;
  primaryStakeholders: string;
  areasOfStewardship: string;
  organizationalInfluence: string;
  executiveRelationships: string;
  status: 'active' | 'planned' | 'future';
};

export type LeadershipPhilosophyEntry = {
  id: string;
  dimension: string;
  principle: string;
};

export type CoreBelief = {
  id: string;
  belief: string;
  category: 'values' | 'never-change' | 'improve' | 'success' | 'excellence';
};

export type NonNegotiable = {
  id: string;
  principle: string;
  description: string;
};

export type DecisionEvaluation = {
  id: string;
  dimension: string;
  description: string;
};

export type ExecutiveCompassEntry = {
  id: string;
  executive: string;
  compassQuestion: string;
  discipline: string;
};

export type ExcellenceDefinition = {
  id: string;
  executive: string;
  exceptional: string;
  average: string;
  warningSigns: string;
  failureIndicators: string;
};

export type CommunicationStandard = {
  id: string;
  standard: string;
  description: string;
};

export type CollaborationPrinciple = {
  id: string;
  principle: string;
};

export type LearningSource = {
  id: string;
  source: string;
  contribution: string;
  status: 'active' | 'growing' | 'pending';
};

export type FounderRelationship = {
  id: string;
  responsibility: string;
  description: string;
};

export type LegacyCommitment = {
  id: string;
  asset: string;
  commitment: string;
};

export type ManifestoInheritance = {
  id: string;
  executiveTitle: string;
  inheritsFramework: boolean;
  readiness: 'active' | 'architecture-ready' | 'planned' | 'future';
  customizedManifesto: boolean;
};

export type LeadershipManifestoFrameworkStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: LeadershipManifestoFrameworkWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    activeManifestos: number;
    inheritedExecutives: number;
    nonNegotiables: number;
    manifestoHealthPct: number;
    organizationalWisdomPct: number;
    futureExecutivesPrepared: number;
  };
  manifestoPhilosophy: string[];
  executiveIdentities: ExecutiveManifestoIdentity[];
  leadershipPhilosophy: LeadershipPhilosophyEntry[];
  coreBeliefs: CoreBelief[];
  nonNegotiables: NonNegotiable[];
  decisionEvaluations: DecisionEvaluation[];
  executiveCompasses: ExecutiveCompassEntry[];
  excellenceDefinitions: ExcellenceDefinition[];
  communicationStandards: CommunicationStandard[];
  collaborationPhilosophy: CollaborationPrinciple[];
  learningSources: LearningSource[];
  founderRelationship: FounderRelationship[];
  legacyCommitments: LegacyCommitment[];
  manifestoInheritance: ManifestoInheritance[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
