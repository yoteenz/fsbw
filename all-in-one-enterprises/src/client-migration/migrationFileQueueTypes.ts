export type MigrationFileQueueState =
  | 'QUEUED'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'CLASSIFYING'
  | 'EXTRACTING'
  | 'MATCHING'
  | 'READY_FOR_REVIEW'
  | 'FAILED'
  | 'UNSUPPORTED'
  | 'DUPLICATE';

export type MigrationProcessingStage =
  | 'HASH'
  | 'DUPLICATE_CHECK'
  | 'CLASSIFICATION'
  | 'TEXT_EXTRACTION'
  | 'FIELD_EXTRACTION'
  | 'ENTITY_MATCHING'
  | 'CONFLICT_ANALYSIS'
  | 'READY_FOR_REVIEW';

export const MIGRATION_FILE_QUEUE_LABELS: Record<MigrationFileQueueState, string> = {
  QUEUED: 'Queued',
  UPLOADING: 'Uploading',
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  CLASSIFYING: 'Classifying',
  EXTRACTING: 'Extracting',
  MATCHING: 'Matching',
  READY_FOR_REVIEW: 'Ready for review',
  FAILED: 'Failed',
  UNSUPPORTED: 'Unsupported',
  DUPLICATE: 'Duplicate',
};
