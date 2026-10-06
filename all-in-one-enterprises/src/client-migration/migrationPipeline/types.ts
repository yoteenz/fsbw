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
  | 'PROVIDER_TIMEOUT'
  | 'PROCESSING_FAILED'
  | 'PARTIAL_EXTRACTION';

export type MigrationExtractionOutcome =
  | 'EXTRACTION_COMPLETE'
  | 'PARTIAL_EXTRACTION'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'PROCESSING_FAILED';

export interface MigrationFileInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
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
  /** High-level extraction outcome for queue + manual fallback UX. */
  extractionOutcome?: MigrationExtractionOutcome;
  documentClass?: string;
  documentClassConfidence?: number;
  /** Raw or OCR text when provider returns it (proposed only — not canonical). */
  extractedText?: string;
  proposedFacts: ProposedFact[];
  ambiguousClientMatches?: string[];
}

export interface MigrationPipelineAdapter {
  processFile(input: MigrationFileInput, context: { organizationId: string; batchId: string }): Promise<MigrationPipelineResult>;
}
