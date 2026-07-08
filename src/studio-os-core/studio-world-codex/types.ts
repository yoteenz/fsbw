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

export type CodexArticleStatus =
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

export type CodexCanonicalStatus =
  | 'Draft'
  | 'In Review'
  | 'Accepted Architecture'
  | 'Canon'
  | 'Superseded'
  | 'Historical';

export type CodexVolume = {
  id: CodexVolumeId;
  title: string;
  order: number;
  purpose: string;
  owns: string[];
};

export type CodexRevision = {
  version: string;
  date: string;
  summary: string;
};

export type CodexArticle = {
  articleId: string;
  title: string;
  category: CodexVolumeId;
  status: CodexArticleStatus;
  origin: string;
  purpose: string;
  corePhilosophy: string;
  guidingPrinciples: string[];
  architecturalImplications: string[];
  affectedSystems: string[];
  dependencies: string[];
  futureEvolution: string[];
  relatedArticles: string[];
  implementationStrategy: string[];
  revisionHistory: CodexRevision[];
  canonicalStatus: CodexCanonicalStatus;
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
