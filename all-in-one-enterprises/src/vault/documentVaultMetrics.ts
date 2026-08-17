import type { VaultDocument } from './vaultTypes';

export type DocumentVaultMetrics = {
  total: number;
  current: number;
  expiringSoon: number;
  needsReview: number;
};

const EXPIRING_SOON_DAYS = 60;

function daysUntil(isoDate: string): number {
  const due = new Date(isoDate.slice(0, 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeDocumentVaultMetrics(docs: VaultDocument[]): DocumentVaultMetrics {
  const active = docs.filter((d) => d.status !== 'archived');
  return {
    total: active.length,
    current: active.filter((d) => d.isCurrent && d.recordLifecycle !== 'superseded').length,
    expiringSoon: active.filter(
      (d) =>
        d.isCurrent &&
        d.expiresAt &&
        daysUntil(d.expiresAt) >= 0 &&
        daysUntil(d.expiresAt) <= EXPIRING_SOON_DAYS,
    ).length,
    needsReview: active.filter(
      (d) =>
        d.reviewStatus === 'needs_attention' ||
        d.recordLifecycle === 'needs_review' ||
        ['uploaded', 'under_review'].includes(d.status),
    ).length,
  };
}

export type MigrationDashboardMetrics = {
  clientsDigitized: number;
  totalClients: number;
  documentsPreserved: number;
  needsReview: number;
  unmatchedDocuments: number;
  possibleDuplicates: number;
  percentComplete: number;
};

export function computeMigrationDashboardMetrics(input: {
  clients: { id: string; archiveMigrationStatus?: string }[];
  documents: VaultDocument[];
  batches: { state: string; organizationId: string }[];
}): MigrationDashboardMetrics {
  const totalClients = input.clients.length;
  const clientsDigitized = input.clients.filter((c) =>
    ['digitized', 'quality_check', 'complete'].includes(c.archiveMigrationStatus ?? 'not_started'),
  ).length;
  const legacyDocs = input.documents.filter((d) => d.source === 'legacy_scan' || d.category === 'legacy');
  const documentsPreserved = legacyDocs.length;
  const needsReview = input.batches.filter((b) =>
    ['ready_for_review', 'reviewing', 'needs_attention'].includes(b.state),
  ).length;

  const hashCounts = new Map<string, number>();
  for (const d of input.documents) {
    if (!d.fileHash) continue;
    const key = `${d.organizationId}:${d.fileHash}`;
    hashCounts.set(key, (hashCounts.get(key) ?? 0) + 1);
  }
  const possibleDuplicates = [...hashCounts.values()].filter((n) => n > 1).length;

  const unmatchedDocuments = input.batches.filter((b) => b.state === 'failed').length;

  return {
    clientsDigitized,
    totalClients,
    documentsPreserved,
    needsReview,
    unmatchedDocuments,
    possibleDuplicates,
    percentComplete: totalClients === 0 ? 0 : Math.round((clientsDigitized / totalClients) * 100),
  };
}
