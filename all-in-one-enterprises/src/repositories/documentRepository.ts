import type { DemoStore } from '../demo/demoTypes';
import { loadDemoStore } from '../demo/demoStore';
import {
  getVaultDocument,
  getVaultDocuments,
  searchVaultDocuments,
  uploadVaultDocument,
  verifyVaultDocument,
  rejectVaultDocument,
  supersedeDocument,
} from '../demo/vaultActions';
import type { VaultDocument, VaultUploadInput } from '../vault/vaultTypes';
import type { RejectionReason } from '../vault/vaultTypes';

/** Repository facade — demo today; Supabase adapter when backend mode is active. */
export const documentRepository = {
  listForOrganization(orgId: string, store?: DemoStore): VaultDocument[] {
    return getVaultDocuments(orgId, store);
  },

  listForOffice(orgId: string | undefined, store?: DemoStore): VaultDocument[] {
    const s = store ?? loadDemoStore();
    if (!orgId) return s.documents;
    return s.documents.filter((d) => d.organizationId === orgId);
  },

  getById(id: string, store?: DemoStore): VaultDocument | undefined {
    return getVaultDocument(id, store);
  },

  search(orgId: string, query: string, filters?: { status?: string; category?: string }, store?: DemoStore) {
    return searchVaultDocuments(orgId, query, filters, store);
  },

  searchOffice(
    orgId: string | undefined,
    query: string,
    filters?: { category?: string; lifecycle?: string },
    store?: DemoStore,
  ): VaultDocument[] {
    let docs = orgId ? this.listForOffice(orgId, store) : this.listForOffice(undefined, store);
    const q = query.trim().toLowerCase();
    if (q) {
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q) ||
          d.category.includes(q) ||
          (d.jurisdiction?.toLowerCase().includes(q) ?? false) ||
          (d.issuingAgency?.toLowerCase().includes(q) ?? false) ||
          (d.fileName?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters?.category) docs = docs.filter((d) => d.category === filters.category);
    if (filters?.lifecycle) docs = docs.filter((d) => d.recordLifecycle === filters.lifecycle);
    return docs;
  },

  async upload(input: VaultUploadInput) {
    return uploadVaultDocument(input);
  },

  verify(documentId: string, staffId: string, staffName?: string) {
    verifyVaultDocument(documentId, staffId, staffName);
  },

  reject(documentId: string, staffId: string, reason: RejectionReason, message: string) {
    rejectVaultDocument(documentId, staffId, reason, message);
  },

  supersede(oldId: string, newDoc: VaultDocument) {
    supersedeDocument(oldId, newDoc);
  },
};
