import { hashFileSha256, findDuplicateDocuments } from '../vault/documentHash';
import { storeVaultFile, validateUploadFile } from '../vault/vaultStorage';
import type {
  ArchiveMigrationBatch,
  ArchiveMigrationBatchFile,
  MigrationBatchState,
} from '../vault/archiveMigrationTypes';
import type { ClientMigrationStatus, VaultDocument } from '../vault/vaultTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { Client, DemoStore } from './demoTypes';
import { recordSecurityAudit } from '../security/securityAudit';

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function searchClientsForMigration(query: string, store: DemoStore = loadDemoStore()): Client[] {
  const q = query.trim().toLowerCase();
  if (!q) return store.clients.slice(0, 20);
  return store.clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q),
  );
}

export function getClientMigrationStatus(clientId: string, store: DemoStore = loadDemoStore()): ClientMigrationStatus {
  const client = store.clients.find((c) => c.id === clientId);
  return client?.archiveMigrationStatus ?? 'not_started';
}

export function getArchiveMigrationBatches(store: DemoStore = loadDemoStore()): ArchiveMigrationBatch[] {
  return store.archiveMigrationBatches ?? [];
}

export function getArchiveMigrationBatch(batchId: string, store: DemoStore = loadDemoStore()): ArchiveMigrationBatch | undefined {
  return store.archiveMigrationBatches?.find((b) => b.id === batchId);
}

export function getBatchFiles(batchId: string, store: DemoStore = loadDemoStore()): ArchiveMigrationBatchFile[] {
  return (store.archiveMigrationBatchFiles ?? []).filter((f) => f.batchId === batchId);
}

export function createMigrationBatch(clientId: string, staffId: string): ArchiveMigrationBatch {
  const batch: ArchiveMigrationBatch = {
    id: uid(),
    organizationId: clientId,
    clientId,
    createdByStaffId: staffId,
    state: 'uploading',
    reviewState: 'pending',
    approvalState: 'pending',
    fileCount: 0,
    documentCount: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  updateDemoStore((s) => {
    if (!s.archiveMigrationBatches) s.archiveMigrationBatches = [];
    s.archiveMigrationBatches.unshift(batch);
    const client = s.clients.find((c) => c.id === clientId);
    if (client) client.archiveMigrationStatus = 'in_progress';
    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_UPLOADED',
      title: `Archive migration batch started — ${client?.companyName ?? clientId}`,
      clientId,
      createdAt: now(),
      visibility: 'internal',
    });
    recordSecurityAudit(s, {
      eventType: 'ARCHIVE_MIGRATION_BATCH_CREATED',
      action: 'Archive migration batch created',
      result: 'SUCCESS',
      actorId: staffId,
      organizationId: clientId,
      entityType: 'archive_migration_batch',
      entityId: batch.id,
    });
    return s;
  });

  return batch;
}

export async function addFilesToMigrationBatch(
  batchId: string,
  files: File[],
): Promise<{ added: number; errors: string[]; duplicates: string[] }> {
  const errors: string[] = [];
  const duplicates: string[] = [];
  let added = 0;

  for (const file of files) {
    const validationError = validateUploadFile(file);
    if (validationError) {
      errors.push(`${file.name}: ${validationError}`);
      continue;
    }

    const batch = getArchiveMigrationBatch(batchId);
    if (!batch) {
      errors.push('Batch not found');
      break;
    }

    const fileHash = await hashFileSha256(file);
    const store = loadDemoStore();
    const dupes = findDuplicateDocuments(batch.organizationId, fileHash, store.documents);
    if (dupes.length > 0) {
      duplicates.push(`${file.name} — possible duplicate of "${dupes[0].title}"`);
    }

    const stored = await storeVaultFile({
      organizationId: batch.organizationId,
      category: 'legacy',
      documentType: 'Legacy Scan',
      title: file.name.replace(/\.[^.]+$/, ''),
      file,
      source: 'legacy_scan',
      visibility: 'internal',
    });

    if (stored.error || !stored.document) {
      errors.push(`${file.name}: ${stored.error ?? 'Storage failed'}`);
      continue;
    }

    const batchFile: ArchiveMigrationBatchFile = {
      id: uid(),
      batchId,
      organizationId: batch.organizationId,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
      fileHash,
      storageReference: stored.document.storageReference,
      processingState: 'ready',
      createdAt: now(),
    };

    const pendingDoc: VaultDocument = {
      ...stored.document,
      source: 'legacy_scan',
      visibility: 'internal',
      recordLifecycle: 'needs_review',
      reviewStatus: 'pending',
      metadataExtractionStatus: 'none',
      fileHash,
      batchId,
      migrationBatchFileId: batchFile.id,
      status: 'under_review',
      verificationStatus: 'pending_review',
    };

    updateDemoStore((s) => {
      if (!s.archiveMigrationBatchFiles) s.archiveMigrationBatchFiles = [];
      s.archiveMigrationBatchFiles.push(batchFile);
      s.documents.push(pendingDoc);
      const b = s.archiveMigrationBatches?.find((x) => x.id === batchId);
      if (b) {
        b.fileCount += 1;
        b.documentCount += 1;
        b.state = 'ready_for_review';
        b.updatedAt = now();
      }
      return s;
    });

    added += 1;
  }

  return { added, errors, duplicates };
}

export type MigrationReviewInput = {
  documentId: string;
  title: string;
  category: VaultDocument['category'];
  documentType: string;
  issuedAt?: string;
  effectiveAt?: string;
  expiresAt?: string;
  jurisdiction?: string;
  relatedServiceId?: string;
  recordLifecycle: VaultDocument['recordLifecycle'];
  physicalOriginalStatus?: VaultDocument['physicalOriginalStatus'];
  physicalArchiveLocation?: string;
  visibility: VaultDocument['visibility'];
  internalNotes?: string;
};

export function reviewMigrationDocument(input: MigrationReviewInput, staffId: string): void {
  updateDemoStore((s) => {
    const doc = s.documents.find((d) => d.id === input.documentId);
    if (!doc) return s;
    doc.title = input.title;
    doc.category = input.category;
    doc.documentType = input.documentType;
    doc.issuedAt = input.issuedAt;
    doc.effectiveAt = input.effectiveAt;
    doc.expiresAt = input.expiresAt;
    doc.jurisdiction = input.jurisdiction;
    doc.relatedServiceId = input.relatedServiceId;
    doc.recordLifecycle = input.recordLifecycle ?? 'current';
    doc.physicalOriginalStatus = input.physicalOriginalStatus;
    doc.physicalArchiveLocation = input.physicalArchiveLocation;
    doc.visibility = input.visibility;
    doc.internalNotes = input.internalNotes;
    doc.reviewStatus = 'approved';
    doc.status = input.recordLifecycle === 'current' ? 'uploaded' : doc.status;
    doc.updatedAt = now();

    const batch = s.archiveMigrationBatches?.find((b) => b.id === doc.batchId);
    if (batch) {
      batch.reviewState = 'in_progress';
      batch.updatedAt = now();
    }

    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_VERIFIED',
      title: `Migration document classified — ${doc.title}`,
      clientId: doc.organizationId,
      createdAt: now(),
      visibility: 'internal',
    });
    recordSecurityAudit(s, {
      eventType: 'DOCUMENT_CLASSIFIED',
      action: 'Migration document classified',
      result: 'SUCCESS',
      actorId: staffId,
      organizationId: doc.organizationId,
      entityType: 'document',
      entityId: input.documentId,
    });
    return s;
  });
}

export function approveMigrationBatch(batchId: string, staffId: string): void {
  updateDemoStore((s) => {
    const batch = s.archiveMigrationBatches?.find((b) => b.id === batchId);
    if (!batch) return s;

    const batchDocs = s.documents.filter((d) => d.batchId === batchId);
    for (const doc of batchDocs) {
      if (doc.reviewStatus !== 'approved') {
        doc.reviewStatus = 'needs_attention';
        continue;
      }
      doc.status = 'verified';
      doc.verificationStatus = 'verified';
      doc.recordLifecycle = doc.recordLifecycle === 'needs_review' ? 'current' : doc.recordLifecycle;
      doc.isCurrent = doc.recordLifecycle === 'current';
    }

    batch.state = 'completed';
    batch.approvalState = 'approved';
    batch.reviewState = 'complete';
    batch.updatedAt = now();

    const client = s.clients.find((c) => c.id === batch.clientId);
    if (client) {
      const pending = batchDocs.some((d) => d.reviewStatus === 'needs_attention');
      client.archiveMigrationStatus = pending ? 'needs_review' : 'digitized';
    }

    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_VERIFIED',
      title: `Archive migration batch approved — ${client?.companyName ?? batch.clientId}`,
      clientId: batch.clientId,
      createdAt: now(),
      visibility: 'internal',
    });
    recordSecurityAudit(s, {
      eventType: 'ARCHIVE_MIGRATION_BATCH_APPROVED',
      action: 'Archive migration batch approved',
      result: 'SUCCESS',
      actorId: staffId,
      organizationId: batch.clientId,
      entityType: 'archive_migration_batch',
      entityId: batchId,
    });
    return s;
  });
}

export function setBatchState(batchId: string, state: MigrationBatchState): void {
  updateDemoStore((s) => {
    const batch = s.archiveMigrationBatches?.find((b) => b.id === batchId);
    if (batch) {
      batch.state = state;
      batch.updatedAt = now();
    }
    return s;
  });
}

export function getPendingMigrationDocuments(clientId?: string, store: DemoStore = loadDemoStore()): VaultDocument[] {
  return store.documents.filter(
    (d) =>
      (d.source === 'legacy_scan' || d.category === 'legacy') &&
      d.reviewStatus !== 'approved' &&
      (!clientId || d.organizationId === clientId),
  );
}
