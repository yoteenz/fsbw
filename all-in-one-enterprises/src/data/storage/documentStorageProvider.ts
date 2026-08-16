/**
 * Document storage abstraction — Demo vs Supabase implementations.
 */

export interface PrepareUploadInput {
  organizationId: string;
  documentType: string;
  classification: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
}

export interface PrepareUploadResult {
  uploadId: string;
  storagePath: string;
  bucket: string;
}

export interface FinalizeUploadInput {
  uploadId: string;
  storagePath: string;
  bucket: string;
  documentId: string;
}

export interface AuthorizedDownloadInput {
  documentId: string;
  organizationId: string;
  actorUserId: string;
}

export interface AuthorizedDownloadResult {
  url: string;
  expiresAt: string;
}

export interface DocumentStorageProvider {
  readonly mode: 'demo' | 'supabase';
  prepareUpload(input: PrepareUploadInput): Promise<PrepareUploadResult>;
  finalizeUpload(input: FinalizeUploadInput): Promise<void>;
  getAuthorizedDownload(input: AuthorizedDownloadInput): Promise<AuthorizedDownloadResult | null>;
  deleteOrphan(storagePath: string, bucket: string): Promise<void>;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

export class DemoDocumentStorageProvider implements DocumentStorageProvider {
  readonly mode = 'demo' as const;
  private blobs = new Map<string, { mime: string; name: string }>();

  async prepareUpload(input: PrepareUploadInput): Promise<PrepareUploadResult> {
    const uploadId = `demo-upload-${crypto.randomUUID()}`;
    const docSegment = crypto.randomUUID();
    const storagePath = `organization/${input.organizationId}/pending/${docSegment}/${safeFilename(input.originalFilename)}`;
    this.blobs.set(uploadId, { mime: input.mimeType, name: input.originalFilename });
    return {
      uploadId,
      storagePath,
      bucket: 'demo-local',
    };
  }

  async finalizeUpload(input: FinalizeUploadInput): Promise<void> {
    this.blobs.delete(input.uploadId);
  }

  async getAuthorizedDownload(input: AuthorizedDownloadInput): Promise<AuthorizedDownloadResult | null> {
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    return {
      url: `demo://document/${input.documentId}?org=${input.organizationId}`,
      expiresAt: expires,
    };
  }

  async deleteOrphan(_storagePath: string, _bucket: string): Promise<void> {
    /* no-op in demo */
  }
}

export class SupabaseDocumentStorageProvider implements DocumentStorageProvider {
  readonly mode = 'supabase' as const;

  async prepareUpload(_input: PrepareUploadInput): Promise<PrepareUploadResult> {
    throw new Error('Supabase storage not configured — dedicated AIO project required');
  }

  async finalizeUpload(_input: FinalizeUploadInput): Promise<void> {
    throw new Error('Supabase storage not configured');
  }

  async getAuthorizedDownload(_input: AuthorizedDownloadInput): Promise<AuthorizedDownloadResult | null> {
    throw new Error('Supabase storage not configured');
  }

  async deleteOrphan(_storagePath: string, _bucket: string): Promise<void> {
    throw new Error('Supabase storage not configured');
  }
}

import { isSupabaseMode } from '../../config/dataMode';

let _provider: DocumentStorageProvider | null = null;

export function getDocumentStorageProvider(): DocumentStorageProvider {
  if (!_provider) {
    _provider = isSupabaseMode()
      ? new SupabaseDocumentStorageProvider()
      : new DemoDocumentStorageProvider();
  }
  return _provider;
}

export function resetDocumentStorageProvider(): void {
  _provider = null;
}
