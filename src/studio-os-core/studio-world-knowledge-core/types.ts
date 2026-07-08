/**
 * Studio World Knowledge Core™ — internal memory of the civilization.
 *
 * The Knowledge Core is not documentation. It is structured institutional
 * memory that can be projected into docs, the Orb, the Atlas, and future rooms.
 */

export const KNOWLEDGE_CORE_STATUSES = [
  'Canon',
  'Approved',
  'Draft',
  'Experimental',
  'Deprecated',
  'Historical',
  'Archived',
] as const;

export type KnowledgeCoreStatus = (typeof KNOWLEDGE_CORE_STATUSES)[number];

export const KNOWLEDGE_CORE_DOMAINS = [
  'Constitution™',
  'Architecture™',
  'World Bible™',
  'Design Language™',
  'Experience System™',
  'Orb™',
  'Mission Control™',
  'Atlas™',
  'Scene Assembly™',
  'Knowledge Engine™',
  'Marketplace™',
  'Discovery Packs™',
  'Civilization™',
  'ADR Archive™',
  'Asset Standards™',
  'Engineering Standards™',
  'Prompt Standards™',
  'Brand Standards™',
  'Research™',
  'Future Concepts™',
  "Architect's Memory™",
] as const;

export type KnowledgeCoreDomain = (typeof KNOWLEDGE_CORE_DOMAINS)[number];

export type KnowledgeImplementationStatus =
  | 'Not Started'
  | 'Specified'
  | 'Implemented'
  | 'Live'
  | 'Historical';

export type KnowledgeEntryVersion = {
  version: string;
  createdAt: string;
  summary: string;
  status: KnowledgeCoreStatus;
  supersededBy?: string;
};

export type KnowledgeRelationshipType =
  | 'governed-by'
  | 'references'
  | 'integrates-with'
  | 'located-in'
  | 'supersedes'
  | 'owns'
  | 'evidence-for';

export type KnowledgeRelationship = {
  type: KnowledgeRelationshipType;
  targetId: string;
  targetLabel: string;
  label?: string;
};

export type KnowledgeCoreEntry = {
  id: string;
  title: string;
  domain: KnowledgeCoreDomain;
  status: KnowledgeCoreStatus;
  version: string;
  summary: string;
  reasoning: string;
  finalPrompt: string;
  architectureAdded: string[];
  relatedSystems: string[];
  constitutionArticles: string[];
  adrReferences: string[];
  worldBibleReferences: string[];
  implementationStatus: KnowledgeImplementationStatus;
  supersededBy?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  versionHistory?: KnowledgeEntryVersion[];
  relationships?: KnowledgeRelationship[];
};

export type KnowledgeCoreSearchHit = {
  entry: KnowledgeCoreEntry;
  score: number;
  matchReason: string;
  domainLabel: string;
  canInfluenceArchitecture: boolean;
};

export type PromptMemoryIngestInput = {
  title: string;
  summary: string;
  reasoning: string;
  finalPrompt: string;
  domain?: KnowledgeCoreDomain;
  status?: KnowledgeCoreStatus;
  architectureAdded?: string[];
  relatedSystems?: string[];
  constitutionArticles?: string[];
  adrReferences?: string[];
  worldBibleReferences?: string[];
  implementationStatus?: KnowledgeImplementationStatus;
  tags?: string[];
};

export type IngestedPromptMemory = {
  entry: KnowledgeCoreEntry;
  ingestedAt: string;
  source: 'prompt-memory-pipeline';
};

export type OrganizationKnowledgeCoreProfile = {
  organizationId: string;
  syncedAt: string;
  entryCount: number;
  canonCount: number;
  domainCount: number;
  promptStandardCount: number;
  ingestedPromptCount: number;
  archivistLines: string[];
};

export type KnowledgeCoreStore = {
  version: string;
  profiles: OrganizationKnowledgeCoreProfile[];
  ingestedEntries: KnowledgeCoreEntry[];
};

export type PromptStandard = {
  id: string;
  title: string;
  status: KnowledgeCoreStatus;
  standard: string;
  reason: string;
};

export const MEMORY_SYSTEM_LAYERS = [
  'Conversation Archive™',
  'Knowledge Ingestion™',
  'Architect Review™',
  'Knowledge Core™',
] as const;

export type MemorySystemLayer = (typeof MEMORY_SYSTEM_LAYERS)[number];

export const ARCHITECT_REVIEW_ACTIONS = ['Approve', 'Modify', 'Reject', 'Merge', 'Delay'] as const;
export type ArchitectReviewAction = (typeof ARCHITECT_REVIEW_ACTIONS)[number];

export type ConversationArchiveRecord = {
  id: string;
  title: string;
  date: string;
  status: 'Archived';
  transcriptPath: string;
  summaryForIndex: string;
  preservedExactly: boolean;
  relatedExtractionReportId: string;
};

export type KnowledgeExtractionReport = {
  id: string;
  title: string;
  sourceConversationId: string;
  status: 'Awaiting Founder Review';
  reportPath: string;
  conversationSummary: string;
  architecturalDecisions: string[];
  systemsIntroduced: string[];
  designPrinciples: string[];
  conflictsDetected: string[];
  potentialAdrs: string[];
  constitutionUpdates: string[];
  worldBibleUpdates: string[];
  promptStandardUpdates: string[];
  engineeringRecommendations: string[];
  futureOpportunities: string[];
  itemsAwaitingApproval: string[];
};

export type ArchitectsMemoryPrinciple = {
  id: string;
  title: string;
  status: KnowledgeCoreStatus;
  principle: string;
  source: string;
};
