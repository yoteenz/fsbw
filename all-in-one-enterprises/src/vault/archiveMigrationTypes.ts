import type { ClientMigrationStatus } from './vaultTypes';

export type MigrationBatchState =
  | 'uploading'
  | 'processing'
  | 'ready_for_review'
  | 'reviewing'
  | 'needs_attention'
  | 'approved'
  | 'completed'
  | 'failed';

export type MigrationBatchReviewState = 'pending' | 'in_progress' | 'complete';
export type MigrationBatchApprovalState = 'pending' | 'approved' | 'rejected';

export type MigrationBatchFileState = 'uploaded' | 'processing' | 'ready' | 'grouped' | 'failed';

export interface ArchiveMigrationBatch {
  id: string;
  organizationId: string;
  clientId: string;
  createdByStaffId: string;
  state: MigrationBatchState;
  reviewState: MigrationBatchReviewState;
  approvalState: MigrationBatchApprovalState;
  fileCount: number;
  documentCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveMigrationBatchFile {
  id: string;
  batchId: string;
  organizationId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  fileHash?: string;
  storageReference?: string;
  pageCount?: number;
  processingState: MigrationBatchFileState;
  documentId?: string;
  createdAt: string;
}

export type ClientArchiveMigrationProfile = {
  clientId: string;
  organizationId: string;
  status: ClientMigrationStatus;
  batchCount: number;
  documentCount: number;
  lastBatchAt?: string;
};

export const MIGRATION_BATCH_STATE_LABELS: Record<MigrationBatchState, string> = {
  uploading: 'Uploading',
  processing: 'Processing',
  ready_for_review: 'Ready for Review',
  reviewing: 'Reviewing',
  needs_attention: 'Needs Attention',
  approved: 'Approved',
  completed: 'Completed',
  failed: 'Failed',
};

export const CLIENT_MIGRATION_STATUS_LABELS: Record<ClientMigrationStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  digitized: 'Digitized',
  quality_check: 'Quality Check',
  complete: 'Complete',
};
