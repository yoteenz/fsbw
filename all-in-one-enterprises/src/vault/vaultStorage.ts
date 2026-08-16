import { FILE_POLICY } from './vaultConfig';
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

/** Demo: store as data URL in metadata. Backend: would upload to dedicated AIO bucket. */
export async function storeVaultFile(input: VaultUploadInput): Promise<VaultUploadResult> {
  const validationError = validateUploadFile(input.file);
  if (validationError) return { document: null as never, error: validationError };

  if (getStorageMode() === 'backend') {
    return { document: null as never, error: 'Secure storage not configured. Document metadata saved in demo mode only.' };
  }

  const dataUrl = await readFileAsDataUrl(input.file);
  return {
    document: {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      category: input.category,
      documentType: input.documentType,
      title: input.title,
      description: input.notes,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      serviceRequestId: input.serviceRequestId,
      roadReadyItemId: input.roadReadyItemId,
      status: 'uploaded',
      verificationStatus: 'pending_review',
      storageReference: dataUrl,
      mimeType: input.file.type || 'application/octet-stream',
      fileName: input.file.name,
      fileSizeBytes: input.file.size,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      visibility: 'customer',
      isCurrent: true,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function canPreviewDocument(mimeType?: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}
