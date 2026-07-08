/**
 * Studio Alpha™ generation receipts — persisted localStorage feed for production HUD totals.
 */

import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { GenerationReceipt, GenerationReceiptStatus } from './types';

export const STUDIO_ALPHA_RECEIPTS_STORAGE_KEY = 'studioOsStudioAlphaCostReceipts_v1';
export const STUDIO_ALPHA_COST_UPDATED_EVENT = 'studio-os-alpha-cost-updated';

type ReceiptStore = { receipts: GenerationReceipt[] };

const EMPTY: ReceiptStore = { receipts: [] };
const MAX_RECEIPTS = 500;

function uid(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStore(): ReceiptStore {
  const raw = readStudioOsJson(STUDIO_ALPHA_RECEIPTS_STORAGE_KEY, () => EMPTY);
  if (!raw || !Array.isArray(raw.receipts)) return EMPTY;
  return { receipts: raw.receipts.filter(isValidReceipt) };
}

function writeStore(store: ReceiptStore): void {
  const trimmed = store.receipts.slice(0, MAX_RECEIPTS);
  writeStudioOsJson(STUDIO_ALPHA_RECEIPTS_STORAGE_KEY, { receipts: trimmed });
  dispatchCostUpdated();
}

function isValidReceipt(r: unknown): r is GenerationReceipt {
  if (!r || typeof r !== 'object') return false;
  const x = r as GenerationReceipt;
  return (
    typeof x.generationId === 'string' &&
    typeof x.departmentId === 'string' &&
    typeof x.projectId === 'string' &&
    typeof x.estimatedCost === 'number' &&
    typeof x.createdAt === 'string'
  );
}

export function dispatchCostUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_ALPHA_COST_UPDATED_EVENT));
}

export function listGenerationReceipts(): GenerationReceipt[] {
  return readStore().receipts;
}

export function getGenerationReceipt(generationId: string): GenerationReceipt | null {
  return readStore().receipts.find((r) => r.generationId === generationId) ?? null;
}

export function createGenerationReceipt(
  input: Omit<
    GenerationReceipt,
    'generationId' | 'createdAt' | 'status' | 'actualCostCertainty'
  > & {
    status?: GenerationReceiptStatus;
    actualCostCertainty?: GenerationReceipt['actualCostCertainty'];
  }
): GenerationReceipt {
  const receipt: GenerationReceipt = {
    generationId: uid(),
    createdAt: new Date().toISOString(),
    status: input.status ?? 'generating',
    actualCostCertainty: input.actualCostCertainty ?? 'estimated',
    ...input,
  };
  const store = readStore();
  writeStore({ receipts: [receipt, ...store.receipts] });
  return receipt;
}

export function updateGenerationReceipt(
  generationId: string,
  patch: Partial<GenerationReceipt>
): GenerationReceipt | null {
  const store = readStore();
  const idx = store.receipts.findIndex((r) => r.generationId === generationId);
  if (idx < 0) return null;
  const updated = { ...store.receipts[idx], ...patch };
  const next = [...store.receipts];
  next[idx] = updated;
  writeStore({ receipts: next });
  return updated;
}

export function getActiveGenerationReceipt(
  departmentId: string,
  projectId: string
): GenerationReceipt | null {
  return (
    readStore().receipts.find(
      (r) =>
        r.departmentId === departmentId &&
        r.projectId === projectId &&
        (r.status === 'generating' || r.status === 'queued')
    ) ?? null
  );
}

export function sumReceiptCosts(
  receipts: GenerationReceipt[],
  filter?: (r: GenerationReceipt) => boolean
): number {
  const list = filter ? receipts.filter(filter) : receipts;
  return list.reduce((sum, r) => {
    const cost =
      r.actualCostCertainty === 'actual' && typeof r.actualCost === 'number'
        ? r.actualCost
        : r.estimatedCost;
    return sum + cost;
  }, 0);
}
