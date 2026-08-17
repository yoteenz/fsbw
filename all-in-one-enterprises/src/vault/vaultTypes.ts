export type VaultCategory =
  | 'business'
  | 'authority'
  | 'registration'
  | 'tax_fuel'
  | 'insurance'
  | 'permits'
  | 'fleet'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'billing'
  | 'poa_authorization'
  | 'contracts'
  | 'supporting'
  | 'correspondence'
  | 'legacy';

export type DocumentSource =
  | 'digital_upload'
  | 'client_upload'
  | 'employee_upload'
  | 'legacy_scan'
  | 'service_generated'
  | 'system_generated'
  | 'imported';

export type DocumentRecordLifecycle =
  | 'current'
  | 'historical'
  | 'superseded'
  | 'expired'
  | 'pending'
  | 'needs_review'
  | 'archived';

export type PhysicalOriginalStatus =
  | 'digital_only'
  | 'physical_retained'
  | 'physical_required'
  | 'disposition_review'
  | 'physical_destroyed';

export type ClientMigrationStatus =
  | 'not_started'
  | 'in_progress'
  | 'needs_review'
  | 'digitized'
  | 'quality_check'
  | 'complete';

export type MetadataExtractionStatus = 'none' | 'pending' | 'complete' | 'failed';

export type DocumentReviewStatus = 'pending' | 'approved' | 'needs_attention';

export type DocumentStatus =
  | 'requested'
  | 'uploaded'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'archived';

export type DocumentVerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export type RelatedEntityType =
  | 'organization'
  | 'vehicle'
  | 'request'
  | 'renewal'
  | 'load'
  | 'factoring'
  | 'shipment'
  | 'road_ready_item';

export type RejectionReason =
  | 'wrong_document'
  | 'unreadable'
  | 'expired'
  | 'missing_page'
  | 'info_mismatch'
  | 'incorrect_vehicle'
  | 'other';

export interface VaultDocument {
  id: string;
  organizationId: string;
  category: VaultCategory;
  documentType: string;
  title: string;
  description?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  serviceRequestId?: string;
  roadReadyItemId?: string;
  renewalId?: string;
  status: DocumentStatus;
  verificationStatus: DocumentVerificationStatus;
  storageReference?: string;
  mimeType?: string;
  fileName?: string;
  fileSizeBytes?: number;
  issuedAt?: string;
  effectiveAt?: string;
  expiresAt?: string;
  uploadedBy?: string;
  verifiedByStaffId?: string;
  verifiedAt?: string;
  rejectionReason?: RejectionReason;
  rejectionMessage?: string;
  visibility: 'internal' | 'customer';
  supersededByDocumentId?: string;
  supersedesDocumentId?: string;
  isCurrent: boolean;
  requestedAt?: string;
  uploadedAt?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  source?: DocumentSource;
  recordLifecycle?: DocumentRecordLifecycle;
  jurisdiction?: string;
  issuingAgency?: string;
  renewalDate?: string;
  physicalOriginalStatus?: PhysicalOriginalStatus;
  /** Internal staff only — never expose in client portal */
  physicalArchiveLocation?: string;
  fileHash?: string;
  batchId?: string;
  migrationBatchFileId?: string;
  reviewStatus?: DocumentReviewStatus;
  classificationConfidence?: number;
  metadataExtractionStatus?: MetadataExtractionStatus;
  /** OCR / AI hooks — suggested values for human review */
  suggestedMetadata?: Record<string, unknown>;
  internalNotes?: string;
  relatedServiceId?: string;
  version?: number;
  /** @deprecated use organizationId */
  clientId?: string;
  /** @deprecated use title */
  name?: string;
  /** legacy load link */
  loadId?: string;
  /** legacy vehicle link */
  relatedVehicle?: string;
}

export interface VaultUploadInput {
  organizationId: string;
  category: VaultCategory;
  documentType: string;
  title: string;
  file: File;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  serviceRequestId?: string;
  roadReadyItemId?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  source?: DocumentSource;
  visibility?: 'internal' | 'customer';
  physicalOriginalStatus?: PhysicalOriginalStatus;
  physicalArchiveLocation?: string;
  jurisdiction?: string;
  issuingAgency?: string;
  effectiveAt?: string;
  renewalDate?: string;
  relatedServiceId?: string;
}

export interface VaultUploadResult {
  document: VaultDocument;
  error?: string;
}
