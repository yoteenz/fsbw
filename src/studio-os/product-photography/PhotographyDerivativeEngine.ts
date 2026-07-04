/**
 * Photography Derivative Engine — prepares derivative slots when hero portrait is approved.
 * No image processing in Milestone 21 — infrastructure and registries only.
 */

import { PHOTOGRAPHY_SYSTEM_VERSION } from './PhotographySpecifications';
import {
  buildDerivativeRecordFromSlot,
  listDerivativeSlotsForProductLine,
  assertCropTemplateForSlot,
  type DerivativeAssetRecord,
  type PhotographyProductLine,
} from './DerivativeAssetRegistry';

export type PrepareDerivativesInput = {
  productLine: PhotographyProductLine;
  unitSlug: string;
  photographyVersion?: string;
  approvedAt?: string;
};

export type DerivativeEngineResult = {
  productLine: PhotographyProductLine;
  unitSlug: string;
  masterSource: 'hero-portrait';
  photographyVersion: string;
  preparedAt: string;
  derivatives: DerivativeAssetRecord[];
};

/** Prepare all derivative asset slots when master hero portrait is approved. */
export function prepareDerivativesOnHeroApproval(input: PrepareDerivativesInput): DerivativeEngineResult {
  const version = input.photographyVersion ?? PHOTOGRAPHY_SYSTEM_VERSION;
  const preparedAt = input.approvedAt ?? new Date().toISOString().slice(0, 10);
  const slots = listDerivativeSlotsForProductLine(input.productLine);

  const derivatives = slots.map((slot) => {
    const template = assertCropTemplateForSlot(slot);
    return buildDerivativeRecordFromSlot(slot, template, {
      productLine: input.productLine,
      unitSlug: input.unitSlug,
      version,
      lastUpdated: preparedAt,
    });
  });

  return {
    productLine: input.productLine,
    unitSlug: input.unitSlug,
    masterSource: 'hero-portrait',
    photographyVersion: version,
    preparedAt,
    derivatives,
  };
}

export function mergeDerivativeStores(
  existing: Record<string, DerivativeEngineResult>,
  next: DerivativeEngineResult
): Record<string, DerivativeEngineResult> {
  const key = derivativeStoreKey(next.productLine, next.unitSlug);
  return { ...existing, [key]: next };
}

export function derivativeStoreKey(productLine: PhotographyProductLine, unitSlug: string): string {
  return `${productLine}/${unitSlug}`;
}

export function getDerivativesForUnit(
  store: Record<string, DerivativeEngineResult>,
  productLine: PhotographyProductLine,
  unitSlug: string
): DerivativeAssetRecord[] {
  return store[derivativeStoreKey(productLine, unitSlug)]?.derivatives ?? [];
}

export function countPreparedDerivatives(records: DerivativeAssetRecord[]): number {
  return records.filter((d) => d.status === 'slot-prepared' || d.status === 'pending-generation').length;
}

/** Future-ready — same engine for any studio os product line. */
export function prepareDerivativesForProduct(input: PrepareDerivativesInput): DerivativeEngineResult {
  return prepareDerivativesOnHeroApproval(input);
}
