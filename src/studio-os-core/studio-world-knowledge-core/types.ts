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
  implementationStatus: 'Not Started' | 'Specified' | 'Implemented' | 'Live' | 'Historical';
  supersededBy?: string;
  tags: string[];
};

export type PromptStandard = {
  id: string;
  title: string;
  status: KnowledgeCoreStatus;
  standard: string;
  reason: string;
};
