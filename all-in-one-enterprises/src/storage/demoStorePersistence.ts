import type { DemoStore } from '../demo/demoTypes';
import { DEMO_BLOB_PREFIX, migrateDataUrlToDemoBlob, parseDemoBlobRef, toDemoBlobRef } from './demoBlobStore';

/** Size breakdown by top-level key (JSON byte length, no document body logging). */
export function measureDemoStoreSectionSizes(store: DemoStore): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of Object.keys(store) as (keyof DemoStore)[]) {
    try {
      out[String(key)] = JSON.stringify(store[key]).length;
    } catch {
      out[String(key)] = -1;
    }
  }
  return out;
}

export function estimateDataUrlBytesInDocuments(store: DemoStore): number {
  let total = 0;
  for (const doc of store.documents ?? []) {
    const ref = doc.storageReference ?? '';
    if (ref.startsWith('data:')) total += ref.length;
  }
  return total;
}

/** Clone store for localStorage: never persist inline data URLs (metadata + blob refs only). */
export function serializeDemoStoreForLocalStorage(store: DemoStore): DemoStore {
  const next = structuredClone(store);
  if (next.documents?.length) {
    next.documents = next.documents.map((doc) => {
      const ref = doc.storageReference ?? '';
      if (!ref.startsWith('data:')) return doc;
      const blobId = parseDemoBlobRef(ref) ?? doc.id;
      return {
        ...doc,
        storageReference: ref.startsWith(DEMO_BLOB_PREFIX) ? ref : toDemoBlobRef(blobId),
      };
    });
  }
  return next;
}

export type BlobMigrationResult = {
  changed: boolean;
  migratedDocuments: number;
  errors: string[];
};

/** Move legacy data-URL vault payloads into IndexedDB; update in-memory refs. */
export async function migrateLegacyDocumentBlobsToIndexedDb(store: DemoStore): Promise<{ store: DemoStore; result: BlobMigrationResult }> {
  const errors: string[] = [];
  let migratedDocuments = 0;
  let changed = false;
  const next = structuredClone(store);

  for (const doc of next.documents ?? []) {
    const ref = doc.storageReference ?? '';
    if (!ref.startsWith('data:')) continue;
    try {
      const blobRef = await migrateDataUrlToDemoBlob(
        doc.id,
        ref,
        doc.mimeType ?? 'application/octet-stream',
        doc.fileName,
      );
      doc.storageReference = blobRef;
      migratedDocuments += 1;
      changed = true;
    } catch (e) {
      errors.push(`${doc.id}: ${e instanceof Error ? e.message : 'migration failed'}`);
    }
  }

  return { store: next, result: { changed, migratedDocuments, errors } };
}

export function buildDemoStoreExportPayload(store: DemoStore): { metadata: DemoStore; note: string } {
  const metadata = serializeDemoStoreForLocalStorage(store);
  return {
    metadata,
    note: 'Document bytes are stored separately in IndexedDB (aio_demo_vault_v1). Re-import requires the same browser profile.',
  };
}
