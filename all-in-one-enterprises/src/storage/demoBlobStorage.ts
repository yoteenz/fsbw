/** Demo vault file bytes — IndexedDB so localStorage (aio_debug_store) stays metadata-only. */

const DB_NAME = 'aio_demo_vault_blobs';
const STORE = 'blobs';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function putDemoBlob(id: string, dataUrl: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
    tx.objectStore(STORE).put(dataUrl, id);
  });
}

export async function getDemoBlob(id: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read failed'));
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      db.close();
      resolve(typeof req.result === 'string' ? req.result : null);
    };
    req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
  });
}

export async function deleteDemoBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
    tx.objectStore(STORE).delete(id);
  });
}

export const DEMO_IDB_PREFIX = 'demo-idb:';

export function demoIdbReference(id: string): string {
  return `${DEMO_IDB_PREFIX}${id}`;
}

export function parseDemoIdbReference(ref: string): string | null {
  return ref.startsWith(DEMO_IDB_PREFIX) ? ref.slice(DEMO_IDB_PREFIX.length) : null;
}
