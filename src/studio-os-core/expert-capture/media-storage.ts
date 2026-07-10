import { EXPERT_CAPTURE_DB_NAME, EXPERT_CAPTURE_DB_STORE } from './constants';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(EXPERT_CAPTURE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(EXPERT_CAPTURE_DB_STORE)) {
        db.createObjectStore(EXPERT_CAPTURE_DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EXPERT_CAPTURE_DB_STORE, 'readwrite');
    tx.objectStore(EXPERT_CAPTURE_DB_STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB put failed'));
  });
  db.close();
}

export async function loadMediaBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(EXPERT_CAPTURE_DB_STORE, 'readonly');
    const req = tx.objectStore(EXPERT_CAPTURE_DB_STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
  });
  db.close();
  return blob;
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EXPERT_CAPTURE_DB_STORE, 'readwrite');
    tx.objectStore(EXPERT_CAPTURE_DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
  });
  db.close();
}

export async function clearAllMediaBlobs(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EXPERT_CAPTURE_DB_STORE, 'readwrite');
    tx.objectStore(EXPERT_CAPTURE_DB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB clear failed'));
  });
  db.close();
}

export function newMediaBlobId(prefix: 'video' | 'audio'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
