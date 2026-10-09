/** IndexedDB blob vault for demo mode — keeps document bytes out of localStorage. */

const DB_NAME = 'aio_demo_vault_v1';
const STORE = 'blobs';
const DB_VERSION = 1;

export const DEMO_BLOB_PREFIX = 'demo-blob:';

export type DemoBlobRecord = {
  id: string;
  mimeType: string;
  fileName?: string;
  sizeBytes: number;
  data: ArrayBuffer;
  createdAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function putDemoBlob(input: {
  id: string;
  mimeType: string;
  fileName?: string;
  data: ArrayBuffer;
}): Promise<void> {
  const db = await openDb();
  const record: DemoBlobRecord = {
    id: input.id,
    mimeType: input.mimeType,
    fileName: input.fileName,
    sizeBytes: input.data.byteLength,
    data: input.data,
    createdAt: new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
    tx.objectStore(STORE).put(record);
  });
  db.close();
}

export async function getDemoBlob(id: string): Promise<DemoBlobRecord | null> {
  const db = await openDb();
  const record = await new Promise<DemoBlobRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read failed'));
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as DemoBlobRecord | undefined);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
  });
  db.close();
  return record ?? null;
}

export async function demoBlobRefExists(ref: string): Promise<boolean> {
  const id = parseDemoBlobRef(ref);
  if (!id) return false;
  const blob = await getDemoBlob(id);
  return Boolean(blob);
}

export function parseDemoBlobRef(ref: string | undefined): string | null {
  if (!ref?.startsWith(DEMO_BLOB_PREFIX)) return null;
  return ref.slice(DEMO_BLOB_PREFIX.length) || null;
}

export function toDemoBlobRef(id: string): string {
  return `${DEMO_BLOB_PREFIX}${id}`;
}

const objectUrlCache = new Map<string, string>();

export async function resolveDemoBlobObjectUrl(ref: string): Promise<string | null> {
  if (ref.startsWith('data:') || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('blob:')) {
    return ref;
  }
  const id = parseDemoBlobRef(ref);
  if (!id) return null;
  const cached = objectUrlCache.get(id);
  if (cached) return cached;
  const record = await getDemoBlob(id);
  if (!record) return null;
  const url = URL.createObjectURL(new Blob([record.data], { type: record.mimeType }));
  objectUrlCache.set(id, url);
  return url;
}

export function revokeDemoBlobObjectUrls(): void {
  for (const url of objectUrlCache.values()) URL.revokeObjectURL(url);
  objectUrlCache.clear();
}

export async function migrateDataUrlToDemoBlob(documentId: string, dataUrl: string, mimeType: string, fileName?: string): Promise<string> {
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  await putDemoBlob({ id: documentId, mimeType, fileName, data: buf });
  return toDemoBlobRef(documentId);
}
