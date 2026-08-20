/**
 * NDXbook legacy intelligence recovery — provenance + classification types.
 * Portable handoff for SITE 00 EVOLVE import (read-only recovery phase).
 */

export type ProvenanceClassification =
  | 'CANONICAL'
  | 'REFERENCE'
  | 'OWNER_CONFIRMATION_REQUIRED'
  | 'STUDIO_WORLD_ONLY'
  | 'DUPLICATE'
  | 'CONFLICT'
  | 'OBSOLETE';

export type ProvenanceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProvenanceRecord = {
  repository: string;
  file?: string;
  line?: number;
  commit?: string;
  databaseTable?: string;
  recordId?: string;
  timestamp?: string;
  note?: string;
};

export type ClassifiedField<T = unknown> = {
  value: T;
  classification: ProvenanceClassification;
  confidence: ProvenanceConfidence;
  provenance: ProvenanceRecord[];
  notes?: string;
};

export type EvolveGapStatus =
  | 'RECOVERED_CANONICAL'
  | 'RECOVERED_NEEDS_CONFIRMATION'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'NOT_APPLICABLE';

export type EvolveGapEntry = {
  domain: string;
  status: EvolveGapStatus;
  summary: string;
  sourceField?: string;
};

export type FounderQuestion = {
  id: string;
  question: string;
  reason: 'gap' | 'conflict' | 'time_sensitive' | 'approval';
  relatedDomains: string[];
};

export type NdxbookLegacyIntelligencePackage = {
  meta: {
    packageId: string;
    generatedAt: string;
    sourceRepository: string;
    sourceBranch: string;
    sourceCommit: string;
    targetEvolveSlug: string;
    targetEvolveOrganizationUuid: string;
    boundary: 'READ_ONLY_RECOVERY — no runtime coupling to fsbw';
  };
  brand: Record<string, ClassifiedField>;
  business: Record<string, ClassifiedField>;
  audience: Record<string, ClassifiedField>;
  voice: Record<string, ClassifiedField>;
  visualIdentity: Record<string, ClassifiedField>;
  strategy: Record<string, ClassifiedField>;
  marketing: Record<string, ClassifiedField>;
  content: Record<string, ClassifiedField>;
  channels: Record<string, ClassifiedField>;
  assets: ClassifiedField[];
  studioWorldHistory: Record<string, ClassifiedField>;
  evolveGapAnalysis: EvolveGapEntry[];
  founderQuestions: FounderQuestion[];
  provenance: ProvenanceRecord[];
  conflicts: ClassifiedField[];
  obsolete: ClassifiedField[];
  importContract: {
    packageName: 'NdxbookLegacyIntelligencePackage';
    stages: ['DISCOVERED', 'REVIEWED', 'OWNER_CONFIRMED', 'IMPORT_APPROVED', 'IMPORTED'];
    mappingRecommendations: Record<string, string>;
    rules: string[];
  };
};
