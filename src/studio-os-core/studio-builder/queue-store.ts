import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { GenerationJobStatus, GenerationQueueItem } from './types';

const STORAGE_KEY = 'studioOsGenerationQueue_v1';

type Store = { items: GenerationQueueItem[] };

const EMPTY: Store = { items: [] };

function uid(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function listQueueItems(departmentId: string, projectId: string): GenerationQueueItem[] {
  return readStore().items.filter((i) => i.departmentId === departmentId && i.projectId === projectId);
}

export function getQueueItem(itemId: string): GenerationQueueItem | null {
  return readStore().items.find((i) => i.id === itemId) ?? null;
}

export function upsertQueueItem(
  patch: Partial<GenerationQueueItem> & Pick<GenerationQueueItem, 'departmentId' | 'packageId' | 'projectId' | 'productionGroupId' | 'displayName' | 'heroAssetId'>
): GenerationQueueItem {
  const store = readStore();
  const existing = store.items.find(
    (i) =>
      i.departmentId === patch.departmentId &&
      i.projectId === patch.projectId &&
      i.productionGroupId === patch.productionGroupId
  );

  const now = new Date().toISOString();
  const item: GenerationQueueItem = existing
    ? { ...existing, ...patch, updatedAt: now }
    : {
        id: uid(),
        status: 'queued',
        progressPct: 0,
        promptVersion: 'studio-builder.v1',
        createdAt: now,
        updatedAt: now,
        attempt: 0,
        ...patch,
      };

  const items = existing
    ? store.items.map((i) => (i.id === existing.id ? item : i))
    : [item, ...store.items];

  writeStore({ items });
  return item;
}

export function updateQueueItemStatus(
  itemId: string,
  status: GenerationJobStatus,
  extra?: Partial<GenerationQueueItem>
): GenerationQueueItem | null {
  const store = readStore();
  const idx = store.items.findIndex((i) => i.id === itemId);
  if (idx < 0) return null;
  const item = {
    ...store.items[idx],
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
    progressPct:
      status === 'complete' ? 100 : status === 'validating' ? 85 : status === 'generating' ? 45 : extra?.progressPct ?? store.items[idx].progressPct,
  };
  const items = [...store.items];
  items[idx] = item;
  writeStore({ items });
  return item;
}

export function markQueueRetry(itemId: string): GenerationQueueItem | null {
  const item = getQueueItem(itemId);
  if (!item) return null;
  return updateQueueItemStatus(itemId, 'queued', {
    attempt: item.attempt + 1,
    error: undefined,
    progressPct: 0,
  });
}
