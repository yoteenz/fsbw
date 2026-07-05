/** Executive Framework V1.0 — constitutional foundation for AI executives (Milestone 60). */

export type ExecutiveFrameworkWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ExecutiveRoleId =
  | 'chief-of-staff'
  | 'business-architect'
  | 'brand-architect'
  | 'experience-architect'
  | 'digital-architect'
  | 'growth-architect';

export type ExecutiveIdentityInheritance = {
  id: string;
  source: string;
  status: 'inherited' | 'partial' | 'pending';
  note: string;
};

export type DecisionCriterion = {
  id: string;
  dimension: string;
  description: string;
};

export type ExecutiveCollaboration = {
  id: string;
  fromExecutive: string;
  toExecutive: string;
  request: string;
  status: 'active' | 'resolved' | 'escalated';
};

export type ExecutiveMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type ExecutiveWorkspace = {
  id: string;
  executive: string;
  office: string;
  activePriorities: number;
  pendingRecommendations: number;
  location: string;
};

export type AccountabilityMetric = {
  id: string;
  executive: string;
  metric: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
};

export type RecommendationFormat = {
  id: string;
  executive: string;
  summary: string;
  confidence: number;
  alignmentScore: number;
  hasAlternatives: boolean;
};

export type FutureExecutiveRole = {
  id: string;
  title: string;
  readiness: 'planned' | 'architecture-ready' | 'future';
  inheritsFramework: boolean;
};

export type LeadershipMapEntry = {
  id: string;
  executive: string;
  responsibility: string;
  authority: string;
  reportsTo: string;
};

export type ExecutiveFrameworkStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ExecutiveFrameworkWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    activeExecutives: number;
    activeCollaborations: number;
    recommendationPipeline: number;
    executiveHealthPct: number;
    organizationalAlignmentPct: number;
    futureRolesPrepared: number;
  };
  executivePhilosophy: string[];
  executiveStandards: string[];
  identityInheritance: ExecutiveIdentityInheritance[];
  decisionCriteria: DecisionCriterion[];
  collaborations: ExecutiveCollaboration[];
  institutionalMemory: ExecutiveMemory[];
  executiveWorkspaces: ExecutiveWorkspace[];
  accountability: AccountabilityMetric[];
  recommendationPipeline: RecommendationFormat[];
  futureExecutives: FutureExecutiveRole[];
  leadershipMap: LeadershipMapEntry[];
  organizationalPriorities: string[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
