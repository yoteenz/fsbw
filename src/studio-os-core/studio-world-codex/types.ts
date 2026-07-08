/**
 * Studio World Codex™ — canonical constitutional memory schemas.
 * Reusable platform types; no profession-specific hardcoding.
 */

export type CodexVolumeId =
  | 'volume-i-manifesto'
  | 'volume-ii-constitution'
  | 'volume-iii-world-bible'
  | 'volume-iv-architecture-standards'
  | 'volume-v-design-language'
  | 'volume-vi-production-standards'
  | 'volume-vii-profession-brains'
  | 'volume-viii-career-worlds'
  | 'volume-ix-knowledge-core'
  | 'volume-x-future-vision';

export type CodexPublicationStatus = 'Draft' | 'Approved' | 'Canonical';

export type CodexPipelineStage =
  | 'Idea'
  | 'Exploration'
  | 'Architectural Evolution'
  | 'Codex Article'
  | 'Constitution Review'
  | 'World Bible'
  | 'Implementation Plan'
  | 'Engineering'
  | 'Production'
  | 'Post-Launch Review'
  | 'Codex Update';

export type CodexRelationshipType =
  | 'supports'
  | 'depends-on'
  | 'supersedes'
  | 'extends'
  | 'contradicts'
  | 'related-to'
  | 'referenced-by';

export type CodexVolume = {
  id: CodexVolumeId;
  title: string;
  order: number;
  purpose: string;
  owns: string[];
  modulePath: string;
};

export type CodexArticleRevision = {
  revisionId: string;
  version: string;
  createdAt: string;
  author: string;
  summary: string;
  changeNote: string;
};

export type CodexArticleRelationship = {
  id: string;
  fromArticleId: string;
  toArticleId: string;
  type: CodexRelationshipType;
  label?: string;
  createdAt: string;
};

/** Full Codex Article record — constitutional memory unit. */
export type CodexArticleRecord = {
  articleId: string;
  title: string;
  category: string;
  volume: CodexVolumeId;
  status: CodexPublicationStatus;
  pipelineStage?: CodexPipelineStage;
  createdAt: string;
  updatedAt: string;
  author: string;
  contributors: string[];
  summary: string;
  philosophy: string;
  guidingPrinciples: string[];
  architecturalDecisions: string[];
  implementationReferences: string[];
  relatedSystems: string[];
  relatedArticles: string[];
  revisionHistory: CodexArticleRevision[];
  tags: string[];
  department?: string;
  docPaths?: string[];
  codePaths?: string[];
  worldGraphNodeId?: string;
};

export type CodexArticleRevisionSnapshot = {
  revisionId: string;
  articleId: string;
  version: string;
  snapshot: CodexArticleRecord;
  createdAt: string;
  author: string;
  changeNote: string;
};

export type CodexStore = {
  version: string;
  articles: CodexArticleRecord[];
  relationships: CodexArticleRelationship[];
  revisionSnapshots: CodexArticleRevisionSnapshot[];
  bootstrappedAt?: string;
};

export type CodexSearchFilters = {
  volume?: CodexVolumeId;
  category?: string;
  status?: CodexPublicationStatus;
  system?: string;
  department?: string;
  tag?: string;
  relatedArticleId?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
};

export type CodexSearchHit = {
  article: CodexArticleRecord;
  score: number;
  matchReason: string;
};

export type CodexReadinessInput = {
  hasArticle: boolean;
  hasPurpose: boolean;
  hasSystemConnections: boolean;
  hasReusableCapabilityAssessment: boolean;
  hasImplementationStrategy: boolean;
};

export type CodexReadinessResult = {
  readyForImplementation: boolean;
  missing: string[];
};

export type CodexOrbRecommendation = {
  kind:
    | 'related-article'
    | 'architectural-conflict'
    | 'historical-decision'
    | 'future-evolution'
    | 'relevant-philosophy';
  title: string;
  detail: string;
  articleId?: string;
};

/** @deprecated Use CodexArticleRecord — legacy alias for C01 architecture sprint. */
export type CodexArticle = CodexArticleRecord;

/** @deprecated Use CodexArticleRevision */
export type CodexRevision = CodexArticleRevision;
