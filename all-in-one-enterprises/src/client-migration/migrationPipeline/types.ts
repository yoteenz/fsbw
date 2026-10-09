export type MigrationPipelineStage =
  | 'INGEST'
  | 'HASH'
  | 'DUPLICATE_CHECK'
  | 'DOCUMENT_TYPE_DETECTION'
  | 'TEXT_FIELD_EXTRACTION'
  | 'ENTITY_EXTRACTION'
  | 'CLIENT_MATCHING'
  | 'RECORD_MATCHING'
  | 'STALENESS_ANALYSIS'
  | 'CONFLICT_ANALYSIS'
  | 'CONFIDENCE_SCORING'
  | 'PROPOSED_PROFILE_MUTATIONS'
  | 'REVIEW_REQUIRED';

export type MigrationExceptionCode =
  | 'UNSUPPORTED_DOCUMENT'
  | 'DUPLICATE_DOCUMENT'
  | 'UNREADABLE_DOCUMENT'
  | 'EXTRACTION_FAILED'
  | 'AMBIGUOUS_CLIENT_MATCH'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROCESSING_FAILED';

export interface MigrationFileInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  /** Vault document id — used for provenance links in review UI. */
  documentId?: string;
  /** Supabase storage path `bucket/object/path` for server-side byte retrieval. */
  storageReference?: string;
  /** Base64-encoded bytes when processing in-browser (demo) or inline API upload. */
  fileContentBase64?: string;
}

export interface ProposedFact {
  entityType: string;
  fieldKey: string;
  proposedValue: string;
  existingValue?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT';
  sourceReference: string;
}

export interface MigrationPipelineResult {
  stage: MigrationPipelineStage;
  exception?: MigrationExceptionCode;
  documentClass?: string;
  documentClassConfidence?: number;
  proposedFacts: ProposedFact[];
  ambiguousClientMatches?: string[];
}

export interface MigrationPipelineAdapter {
  processFile(input: MigrationFileInput, context: { organizationId: string; batchId: string }): Promise<MigrationPipelineResult>;
}
