/**
 * Append-only persistence — events are never deleted or overwritten.
 * Primary: IndexedDB. Mirror: in-memory buffer + sessionStorage summary for crash recovery.
 */
import type { FlightRecorderEvent } from '../types';

const DB_NAME = 'studio_os_flight_recorder_v1';
const STORE_NAME = 'events';
const SUMMARY_KEY = 'studioOsFlightRecorderSummary_v1';
const MAX_MEMORY_MIRROR = 2000;

let dbPromise: Promise<IDBDatabase> | null = null;
let memoryMirror: FlightRecorderEvent[] = [];
let writeQueue: FlightRecorderEvent[] = [];
let flushing = false;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'));
  });
  return dbPromise;
}

function mirrorToMemory(event: FlightRecorderEvent): void {
  memoryMirror.push(event);
  if (memoryMirror.length > MAX_MEMORY_MIRROR) {
    memoryMirror = memoryMirror.slice(-MAX_MEMORY_MIRROR);
  }
  try {
    sessionStorage.setItem(
      SUMMARY_KEY,
      JSON.stringify({
        lastEvent: event,
        totalInMemory: memoryMirror.length,
        sessionId: event.sessionId,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* quota */
  }
}

async function flushQueue(): Promise<void> {
  if (flushing || writeQueue.length === 0) return;
  flushing = true;
  const batch = writeQueue.splice(0, writeQueue.length);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const ev of batch) {
        store.put(ev);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('idb write failed'));
    });
  } catch {
    /* IndexedDB unavailable — memory mirror only */
  } finally {
    flushing = false;
    if (writeQueue.length > 0) void flushQueue();
  }
}

/** Append event — never overwrites prior records. */
export function persistFlightEvent(event: FlightRecorderEvent): void {
  mirrorToMemory(event);
  writeQueue.push(event);
  void flushQueue();
}

export function getMemoryMirror(): readonly FlightRecorderEvent[] {
  return memoryMirror;
}

/** Clear in-memory mirror for a fresh recording session (IndexedDB history preserved). */
export function clearMemoryMirror(): void {
  memoryMirror = [];
  writeQueue = [];
  try {
    sessionStorage.removeItem(SUMMARY_KEY);
  } catch {
    /* ignore */
  }
}

export async function loadAllEventsForSession(sessionId: string): Promise<FlightRecorderEvent[]> {
  const fromMemory = memoryMirror.filter((e) => e.sessionId === sessionId);
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('sessionId');
      const req = index.getAll(sessionId);
      req.onsuccess = () => {
        const fromDb = (req.result as FlightRecorderEvent[]) ?? [];
        const merged = [...fromDb];
        for (const ev of fromMemory) {
          if (!merged.some((m) => m.id === ev.id)) merged.push(ev);
        }
        merged.sort((a, b) => a.id - b.id);
        resolve(merged);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [...fromMemory].sort((a, b) => a.id - b.id);
  }
}

export function loadSummaryFromSessionStorage(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
