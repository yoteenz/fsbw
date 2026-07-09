/**
 * Genesis.md — Canonical Object Model™ schemas.
 * Infrastructure only — no hardcoded Studio World content.
 */

import type { GENESIS_COMPILE_TARGETS, GENESIS_PIPELINE_STAGES } from './constants';

export type GenesisPipelineStage = (typeof GENESIS_PIPELINE_STAGES)[number];

export type GenesisCompileTargetId = (typeof GENESIS_COMPILE_TARGETS)[number];

export type GenesisObjectType =
  | 'system'
  | 'institution'
  | 'principle'
  | 'article'
  | 'profession'
  | 'department'
  | 'workflow'
  | 'capability'
  | 'world-entity'
  | 'ui-component'
  | 'event'
  | 'registry'
  | 'policy'
  | 'mission'
  | 'hero-object'
  | 'expansion-pack'
  | 'research-paper'
  | 'specification'
  | 'implementation'
  | 'adr'
  | 'proposal'
  | 'amendment'
  | 'compilation-target'
  | 'collection'
  | 'book'
  | 'volume'
  | 'chapter';

export type GenesisObjectStatus =
  | 'proposed'
  | 'draft'
  | 'review'
  | 'approved'
  | 'canonical'
  | 'superseded'
  | 'deprecated'
  | 'archived';

export type GenesisCanonicalStatus =
  | 'non-canonical'
  | 'working'
  | 'review-pending'
  | 'canonical'
  | 'historical';

export type GenesisRelationshipType =
  | 'defines'
  | 'implements'
  | 'governs'
  | 'depends-on'
  | 'supports'
  | 'extends'
  | 'supersedes'
  | 'contradicts'
  | 'references'
  | 'compiled-to'
  | 'owned-by'
  | 'validated-by'
  | 'blocks'
  | 'derived-from';

export type GenesisVersion = {
  major: number;
  minor: number;
  patch: number;
  edition?: string;
};

export type GenesisObjectReference = {
  refId: string;
  label: string;
  relationship?: GenesisRelationshipType;
};

export type GenesisReviewRecord = {
  reviewId: string;
  stage: GenesisPipelineStage;
  decision: 'pass' | 'fail' | 'return' | 'defer';
  reviewer: string;
  notes: string;
  createdAt: string;
};

export type GenesisObjectRevision = {
  revisionId: string;
  version: GenesisVersion;
  summary: string;
  author: string;
  createdAt: string;
  changeNote: string;
  snapshot?: Record<string, unknown>;
};

export type GenesisRelationship = {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  type: GenesisRelationshipType;
  required?: boolean;
  rationale?: string;
  createdAt: string;
};

/** Canonical Object Model™ — every Genesis object extends this base. */
export type GenesisObject = {
  objectId: string;
  type: GenesisObjectType;
  title: string;
  category: string;
  status: GenesisObjectStatus;
  pipelineStage: GenesisPipelineStage;
  version: GenesisVersion;
  canonicalStatus: GenesisCanonicalStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
  contributors: string[];
  dependencies: string[];
  relationships: GenesisRelationship[];
  reviewHistory: GenesisReviewRecord[];
  tags: string[];
  references: GenesisObjectReference[];
  revisionHistory: GenesisObjectRevision[];
  summary?: string;
  payload?: Record<string, unknown>;
};

export type GenesisProposal = {
  proposalId: string;
  objectId: string;
  title: string;
  problem: string;
  proposedChange: string;
  affectedObjectIds: string[];
  requiredEvidence: string[];
  pipelineStage: GenesisPipelineStage;
  status: 'open' | 'in-review' | 'accepted' | 'returned' | 'rejected' | 'promoted';
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type GenesisAdrOption = {
  option: string;
  tradeoffs: string[];
};

export type GenesisAdr = {
  adrId: string;
  objectId: string;
  proposalId?: string;
  title: string;
  decisionContext: string;
  optionsConsidered: GenesisAdrOption[];
  decision: string;
  consequences: string[];
  supersedesAdrIds: string[];
  status: 'draft' | 'review' | 'accepted' | 'superseded';
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type GenesisReviewSession = {
  sessionId: string;
  objectId: string;
  proposalId?: string;
  adrId?: string;
  stage: GenesisPipelineStage;
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'returned';
  reviewer?: string;
  gatesPassed: string[];
  gatesFailed: string[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
};

export type GenesisCompileManifestEntry = {
  targetId: GenesisCompileTargetId;
  outputPath: string;
  objectCount: number;
  warnings: string[];
  errors: string[];
};

export type GenesisCompileManifest = {
  compileId: string;
  genesisVersion: string;
  sourceObjectCount: number;
  targets: GenesisCompileManifestEntry[];
  generatedAt: string;
};

export type GenesisHistoricalRevision = {
  historyId: string;
  objectId: string;
  revision: GenesisObjectRevision;
  archivedAt: string;
  reason: string;
};

export type GenesisStore = {
  version: string;
  frameworkVersion: string;
  objects: GenesisObject[];
  relationships: GenesisRelationship[];
  proposals: GenesisProposal[];
  adrs: GenesisAdr[];
  reviews: GenesisReviewSession[];
  compileManifests: GenesisCompileManifest[];
  historicalRevisions: GenesisHistoricalRevision[];
  constitution?: import('./constitution/types').ConstitutionStore;
  objectModel?: import('./object-model/types').ObjectModelStore;
  interactionModel?: import('./interaction-model/types').InteractionModelStore;
  decisionEngine?: import('./decision-engine/types').DecisionEngineStore;
  coreSystems?: import('./core-systems/types').CoreSystemsStore;
  dependencyMap?: import('./dependency-map/types').DependencyMapStore;
  buildOrder?: import('./build-order/types').BuildOrderStore;
  identityEngine?: import('./identity-engine/types').IdentityEngineStore;
  bootstrappedAt?: string;
};

export type GenesisRegistryStats = {
  objectCount: number;
  canonicalCount: number;
  proposalCount: number;
  adrCount: number;
  reviewQueue: number;
  relationshipCount: number;
  compileRunCount: number;
};
