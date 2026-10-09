import { putDemoBlob, toDemoBlobRef } from '../storage/demoBlobStore';
import { FILE_POLICY } from './vaultConfig';
import { hashFileSha256 } from './documentHash';
import type { VaultUploadInput, VaultUploadResult } from './vaultTypes';

export type StorageMode = 'demo' | 'backend';

export function getStorageMode(): StorageMode {
  return import.meta.env.VITE_AIO_DATA_MODE === 'backend' ? 'backend' : 'demo';
}

export function validateUploadFile(file: File): string | null {
  if (file.size > FILE_POLICY.maxBytes) {
    return `File exceeds ${Math.round(FILE_POLICY.maxBytes / 1024 / 1024)}MB limit.`;
  }
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!FILE_POLICY.allowedExtensions.includes(ext as typeof FILE_POLICY.allowedExtensions[number])) {
    return 'Unsupported file type. Use PDF, JPG, PNG, or WEBP.';
  }
  if (file.type && !FILE_POLICY.allowedMimeTypes.includes(file.type as typeof FILE_POLICY.allowedMimeTypes[number])) {
    return 'Unsupported file type.';
  }
  return null;
}

/** Demo: store bytes in IndexedDB; metadata + blob ref in demo store. Backend: dedicated AIO bucket. */
export async function storeVaultFile(input: VaultUploadInput): Promise<VaultUploadResult> {
  const validationError = validateUploadFile(input.file);
  if (validationError) return { document: null as never, error: validationError };

  if (getStorageMode() === 'backend') {
    return { document: null as never, error: 'Secure storage not configured. Document metadata saved in demo mode only.' };
  }

  const fileHash = await hashFileSha256(input.file);
  const documentId = crypto.randomUUID();
  const buf = await input.file.arrayBuffer();
  await putDemoBlob({
    id: documentId,
    mimeType: input.file.type || 'application/octet-stream',
    fileName: input.file.name,
    data: buf,
  });
  const storageReference = toDemoBlobRef(documentId);
  return {
    document: {
      id: documentId,
      organizationId: input.organizationId,
      category: input.category,
      documentType: input.documentType,
      title: input.title,
      description: input.notes,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      serviceRequestId: input.serviceRequestId,
      roadReadyItemId: input.roadReadyItemId,
      relatedServiceId: input.relatedServiceId,
      status: 'uploaded',
      verificationStatus: 'pending_review',
      recordLifecycle: 'pending',
      source: input.source ?? 'client_upload',
      storageReference,
      mimeType: input.file.type || 'application/octet-stream',
      fileName: input.file.name,
      fileSizeBytes: input.file.size,
      fileHash,
      issuedAt: input.issuedAt,
      effectiveAt: input.effectiveAt,
      expiresAt: input.expiresAt,
      renewalDate: input.renewalDate,
      jurisdiction: input.jurisdiction,
      issuingAgency: input.issuingAgency,
      physicalOriginalStatus: input.physicalOriginalStatus,
      physicalArchiveLocation: input.physicalArchiveLocation,
      visibility: input.visibility ?? 'customer',
      metadataExtractionStatus: 'none',
      reviewStatus: 'pending',
      version: 1,
      isCurrent: true,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function canPreviewDocument(mimeType?: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}
