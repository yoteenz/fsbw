import type { FOUNDER_PREFERENCE_TYPES, RELATIONSHIP_ENTITY_TYPES } from './constants';

export type FounderPreferenceType = (typeof FOUNDER_PREFERENCE_TYPES)[number];
export type RelationshipEntityType = (typeof RELATIONSHIP_ENTITY_TYPES)[number];

export type FounderPreferenceMemory = {
  type: FounderPreferenceType;
  label: string;
  learnedPreference: string;
  confidencePct: number;
  learnedThrough: 'observation';
  lastReinforcedAt: string;
};

export type OrganizationalRelationshipMemory = {
  id: string;
  entityType: RelationshipEntityType;
  entityName: string;
  preferredCommunication: string;
  meetingCadence: string;
  approvalWorkflow: string;
  recurringRequests: string[];
  interactionCount: number;
};

export type IntelligentAdaptationInsight = {
  id: string;
  insight: string;
  appliesTo: 'founder' | 'organization' | 'both';
  dockApplication: string;
  confidencePct: number;
};

export type OrganizationRelationshipMemoryProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  familiarityScore: number;
  preferencesLearned: number;
  relationshipsTracked: number;
  founderPreferences: FounderPreferenceMemory[];
  organizationalRelationships: OrganizationalRelationshipMemory[];
  adaptationInsights: IntelligentAdaptationInsight[];
  dockAdaptationLine: string;
  neverIntrusive: true;
  syncedSources: string[];
};

export type RelationshipMemoryStore = {
  version: string;
  profiles: OrganizationRelationshipMemoryProfile[];
};

export type RelationshipMemoryDockAdvice = {
  response: string;
  concierge: string;
  familiarityScore?: number;
  preferencesLearned?: number;
};
