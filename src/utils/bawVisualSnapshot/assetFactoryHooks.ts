/**
 * Asset Factory integration hooks — generation requests for missing color variants.
 * Milestone 21.5: architecture only; no AI pipeline execution.
 */

import { buildSnapshotAssetId } from './assetNaming';
import type { BawVisualSnapshotBuildInput } from './types';
import { colorNameToSlug } from './colorPalette';
import { productNameToUnitSlug } from './unitSlug';

export type BawVisualVariantGenerationRequest = {
  id: string;
  unitSlug: string;
  colorSlug: string;
  colorName: string;
  assetIds: string[];
  config: BawVisualSnapshotBuildInput;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  createdAt: string;
};

const GENERATION_QUEUE_KEY = 'bawVisualSnapshotGenerationQueue_v1';

function readQueue(): BawVisualVariantGenerationRequest[] {
  try {
    const raw = localStorage.getItem(GENERATION_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: BawVisualVariantGenerationRequest[]): void {
  try {
    localStorage.setItem(GENERATION_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* quota */
  }
}

/** Queue placeholder for Asset Factory — does not block checkout. */
export function enqueueBawVisualVariantGeneration(
  input: BawVisualSnapshotBuildInput
): BawVisualVariantGenerationRequest | null {
  if (typeof localStorage === 'undefined') return null;
  const unitSlug = productNameToUnitSlug(input.productName);
  if (!unitSlug) return null;
  const colorSlug = colorNameToSlug(input.color);
  const assetIds = (['hero', 'cart', 'wishlist', 'checkout', 'order', 'admin'] as const).map((suffix) =>
    buildSnapshotAssetId(unitSlug, colorSlug, suffix)
  );
  const id = `baw-vgen-${unitSlug}-${colorSlug}-${Date.now()}`;
  const existing = readQueue().find((r) => r.unitSlug === unitSlug && r.colorSlug === colorSlug && r.status !== 'complete');
  if (existing) return existing;

  const request: BawVisualVariantGenerationRequest = {
    id,
    unitSlug,
    colorSlug,
    colorName: String(input.color || '').trim().toUpperCase(),
    assetIds,
    config: input,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  writeQueue([request, ...readQueue()]);
  window.dispatchEvent(new CustomEvent('bawVisualSnapshotGenerationQueued', { detail: request }));
  return request;
}

export function listBawVisualVariantGenerationQueue(): BawVisualVariantGenerationRequest[] {
  return readQueue();
}
