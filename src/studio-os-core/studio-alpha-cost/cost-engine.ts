/**
 * Studio Alpha™ cost engine — estimates from pricing config; labels Estimated / Actual / Unknown.
 */

import { findFalPricingEntry, STUDIO_ALPHA_DEFAULT_QUALITY, STUDIO_ALPHA_DEFAULT_RESOLUTION } from './pricing-config';
import type { CostCertainty, CostLabel } from './types';

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function costLabel(
  value: number,
  certainty: CostCertainty
): CostLabel {
  const prefix =
    certainty === 'estimated' ? 'Est. ' : certainty === 'unknown' ? 'Unknown ' : '';
  return {
    value,
    certainty,
    display: `${prefix}${formatUsd(value)}`,
  };
}

export function estimateGenerationCost(input: {
  model?: string;
  quality?: string;
  resolution?: string;
  imageCount?: number;
}): { estimatedCost: number; pricingNotes?: string } {
  const entry = findFalPricingEntry({
    model: input.model,
    quality: input.quality ?? STUDIO_ALPHA_DEFAULT_QUALITY,
    resolution: input.resolution ?? STUDIO_ALPHA_DEFAULT_RESOLUTION,
  });
  const count = Math.max(1, input.imageCount ?? 1);
  const base = entry.costPerImage * count;
  const storage = (entry.estimatedStorageCost ?? 0) * count;
  return {
    estimatedCost: Math.round((base + storage) * 100) / 100,
    pricingNotes: entry.notes,
  };
}

export function resolveActualCost(input: {
  apiActualCost?: number | null;
  model?: string;
  resolution?: string;
}): { actualCost: number; certainty: CostCertainty } {
  if (typeof input.apiActualCost === 'number' && input.apiActualCost >= 0) {
    return { actualCost: input.apiActualCost, certainty: 'actual' };
  }
  const { estimatedCost } = estimateGenerationCost({
    model: input.model,
    resolution: input.resolution,
  });
  return { actualCost: estimatedCost, certainty: 'estimated' };
}

export function estimateGenerationDurationSec(model?: string): number {
  const m = model ?? '';
  if (m.includes('flux')) return 45;
  if (m.includes('gpt-image')) return 25;
  return 32;
}

export function effectiveCostPerUse(generationCost: number, reuseCount: number): number {
  const uses = Math.max(1, reuseCount + 1);
  return Math.round((generationCost / uses) * 10000) / 10000;
}

export function savingsFromReuse(generationCost: number, reuseCount: number): number {
  if (reuseCount <= 0) return 0;
  return Math.round(generationCost * reuseCount * 100) / 100;
}
