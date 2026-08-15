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
  | 'billing';

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
}

export interface VaultUploadResult {
  document: VaultDocument;
  error?: string;
}
