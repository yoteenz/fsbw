import type {
  COMMUNICATION_PREFERENCE_TYPES,
  IDENTITY_GRAPH_DOMAINS,
  IDENTITY_GRAPH_PHILOSOPHY,
  IDENTITY_TYPES,
  PERMISSION_LEVELS,
  RELATIONSHIP_EDGE_TYPES,
} from './constants';

export type IdentityType = (typeof IDENTITY_TYPES)[number];
export type RelationshipEdgeType = (typeof RELATIONSHIP_EDGE_TYPES)[number];
export type IdentityGraphDomain = (typeof IDENTITY_GRAPH_DOMAINS)[number];
export type IdentityPhilosophyLine = (typeof IDENTITY_GRAPH_PHILOSOPHY)[number];
export type CommunicationPreferenceType = (typeof COMMUNICATION_PREFERENCE_TYPES)[number];
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export type LifeCulturePreference = {
  id: string;
  category: string;
  preference: string;
  source: 'observed' | 'declared' | 'inferred';
};

export type LearningHistoryEntry = {
  id: string;
  title: string;
  completedAt: string;
  outcome: string;
  source: string;
};

export type KnowledgeContribution = {
  id: string;
  title: string;
  type: 'documentation' | 'brain-entry' | 'wisdom' | 'project' | 'mentorship';
  contributedAt: string;
  impactSummary: string;
};

export type IdentityAchievement = {
  id: string;
  title: string;
  achievedAt: string;
  category: string;
};

export type IdentityPersonProfile = {
  id: string;
  displayName: string;
  identityType: IdentityType;
  identityTypeLabel: string;
  personalSummary: string;
  organizationSummary: string;
  department: string;
  role: string;
  email?: string;
  skills: string[];
  expertise: string[];
  responsibilities: string[];
  projects: string[];
  knowledgeContributions: KnowledgeContribution[];
  achievements: IdentityAchievement[];
  communicationPreferences: string[];
  lifeCulturePreferences: LifeCulturePreference[];
  learningHistory: LearningHistoryEntry[];
  permissions: PermissionLevel;
  goals: string[];
  professionalInterests: string[];
  trustScore: number;
  relationshipCount: number;
  lastActiveAt: string;
  firstClassCitizen: true;
};

export type IdentityRelationshipEdge = {
  id: string;
  fromPersonId: string;
  fromPersonName: string;
  toPersonId: string;
  toPersonName: string;
  edgeType: RelationshipEdgeType;
  edgeTypeLabel: string;
  strength: number;
  summary: string;
  bidirectional: boolean;
};

export type IdentityGraphDomainStatus = {
  domain: IdentityGraphDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type IdentityGraphCluster = {
  id: string;
  label: string;
  identityTypes: IdentityType[];
  personCount: number;
  relationshipCount: number;
  summary: string;
};

export type OrganizationIdentityGraphProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  graphScore: number;
  peopleCount: number;
  relationshipCount: number;
  identityTypesRepresented: number;
  departmentsMapped: number;
  people: IdentityPersonProfile[];
  relationships: IdentityRelationshipEdge[];
  domainStatuses: IdentityGraphDomainStatus[];
  clusters: IdentityGraphCluster[];
  selectedPersonId: string | null;
  dockIdentityLine: string;
  peopleFirstClassCitizens: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type IdentityGraphStore = {
  version: string;
  profiles: OrganizationIdentityGraphProfile[];
};

export type IdentityGraphDockAdvice = {
  response: string;
  concierge: string;
  graphScore?: number;
  peopleCount?: number;
};

export type IdentityGraphSearchHit = {
  type: 'person' | 'relationship' | 'expertise' | 'department';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
