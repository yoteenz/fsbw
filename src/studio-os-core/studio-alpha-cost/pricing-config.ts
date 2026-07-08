/**
 * Centralized FAL pricing config for Studio Alpha™ production cost estimates.
 * Update entries here when FAL pricing changes — do not hardcode prices in components.
 */

import type { FalPricingEntry } from './types';

export const STUDIO_ALPHA_DEFAULT_MODEL = 'fal-ai/nano-banana-pro/edit';
export const STUDIO_ALPHA_DEFAULT_PROVIDER = 'FAL';
export const STUDIO_ALPHA_DEFAULT_QUALITY = '4K / high quality';
export const STUDIO_ALPHA_DEFAULT_RESOLUTION = '16:9';

/** Placeholder pricing — replace when exact FAL billing is wired from API responses. */
export const FAL_PRICING_CONFIG: FalPricingEntry[] = [
  {
    provider: 'FAL',
    model: 'fal-ai/nano-banana-pro/edit',
    quality: '4K / high quality',
    resolution: '16:9',
    costPerImage: 0.18,
    estimatedStorageCost: 0.001,
    lastUpdated: '2026-07-08',
    notes: 'Studio Builder Scene Stack default — NBP edit at high tier.',
  },
  {
    provider: 'FAL',
    model: 'fal-ai/nano-banana-pro/edit',
    quality: '4K / high quality',
    resolution: '3:4',
    costPerImage: 0.2,
    estimatedStorageCost: 0.001,
    lastUpdated: '2026-07-08',
    notes: 'Portrait / editorial aspect for CDS zones.',
  },
  {
    provider: 'FAL',
    model: 'openai/gpt-image-2/edit',
    quality: '2K / medium',
    resolution: '3:4',
    costPerImage: 0.12,
    estimatedStorageCost: 0.001,
    lastUpdated: '2026-07-08',
    notes: 'NOIR live color path — medium quality tier.',
  },
  {
    provider: 'FAL',
    model: 'fal-ai/flux-2-max/edit',
    quality: '4K / high quality',
    resolution: '16:9',
    costPerImage: 0.24,
    upscaleCost: 0.06,
    estimatedStorageCost: 0.001,
    lastUpdated: '2026-07-08',
    notes: 'Premium environment shells when Flux is selected.',
  },
];

export function findFalPricingEntry(input: {
  model?: string;
  quality?: string;
  resolution?: string;
}): FalPricingEntry {
  const model = input.model?.trim() || STUDIO_ALPHA_DEFAULT_MODEL;
  const quality = input.quality?.trim() || STUDIO_ALPHA_DEFAULT_QUALITY;
  const resolution = input.resolution?.trim() || STUDIO_ALPHA_DEFAULT_RESOLUTION;

  const exact = FAL_PRICING_CONFIG.find(
    (e) => e.model === model && e.resolution === resolution && e.quality === quality
  );
  if (exact) return exact;

  const byModelRes = FAL_PRICING_CONFIG.find(
    (e) => e.model === model && e.resolution === resolution
  );
  if (byModelRes) return byModelRes;

  const byModel = FAL_PRICING_CONFIG.find((e) => e.model === model);
  if (byModel) return byModel;

  return FAL_PRICING_CONFIG[0];
}
