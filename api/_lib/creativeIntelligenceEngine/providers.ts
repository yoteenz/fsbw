/** Provider capability registry — engine selects provider; never hardcode execution. */

import type { AssetType, QualityIntent } from './types.js';

export type ProviderCapability = {
  id: string;
  label: string;
  strengths: string[];
  weaknesses: string[];
  supported_resolutions: string[];
  cost_per_image_usd: number;
  cost_per_video_second_usd: number;
  avg_generation_seconds: number;
  best_use_cases: string[];
  supported_asset_types: AssetType[];
  models: ProviderModel[];
  available: boolean;
};

export type ProviderModel = {
  id: string;
  label: string;
  asset_types: AssetType[];
  quality_tiers: QualityIntent[];
  cost_multiplier: number;
  avg_seconds: number;
};

export const PROVIDER_CAPABILITIES: ProviderCapability[] = [
  {
    id: 'fal',
    label: 'FAL',
    strengths: ['Fast iteration', 'Image edit', 'Scene layers', 'Video'],
    weaknesses: ['Token cost at scale', 'Complex multi-pass scenes'],
    supported_resolutions: ['1024x1024', '1536x2048', '1920x1080', '2048x2048'],
    cost_per_image_usd: 0.04,
    cost_per_video_second_usd: 0.12,
    avg_generation_seconds: 18,
    best_use_cases: ['environment', 'furniture', 'layered scenes', 'video'],
    supported_asset_types: ['image', 'video', 'layer', 'scene'],
    models: [
      { id: 'flux-pro', label: 'Flux Pro', asset_types: ['image', 'layer', 'scene'], quality_tiers: ['production', 'marketplace', 'system_reusable'], cost_multiplier: 1.2, avg_seconds: 22 },
      { id: 'flux-dev', label: 'Flux Dev', asset_types: ['image', 'layer'], quality_tiers: ['draft', 'concept'], cost_multiplier: 0.6, avg_seconds: 12 },
      { id: 'nano-banana-pro', label: 'Nano Banana Pro', asset_types: ['image', 'layer'], quality_tiers: ['production', 'concept'], cost_multiplier: 1.0, avg_seconds: 16 },
    ],
    available: Boolean(process.env.FAL_KEY?.trim()),
  },
  {
    id: 'gpt-image',
    label: 'GPT Image',
    strengths: ['Product fidelity', 'Edit precision', 'Brand consistency'],
    weaknesses: ['Slower for batch', 'Limited video'],
    supported_resolutions: ['1024x1024', '1536x2048'],
    cost_per_image_usd: 0.08,
    cost_per_video_second_usd: 0,
    avg_generation_seconds: 28,
    best_use_cases: ['hero objects', 'product shots', 'portrait fidelity'],
    supported_asset_types: ['image', 'layer'],
    models: [
      { id: 'openai/gpt-image-2/edit', label: 'GPT Image 2 Edit', asset_types: ['image', 'layer'], quality_tiers: ['production', 'marketplace'], cost_multiplier: 1.4, avg_seconds: 30 },
    ],
    available: Boolean(process.env.OPENAI_API_KEY?.trim()),
  },
  {
    id: 'flux',
    label: 'Flux (direct)',
    strengths: ['High detail stills', 'Material realism'],
    weaknesses: ['No native video', 'Setup overhead'],
    supported_resolutions: ['1024x1024', '2048x2048'],
    cost_per_image_usd: 0.035,
    cost_per_video_second_usd: 0,
    avg_generation_seconds: 20,
    best_use_cases: ['architecture', 'materials', 'still environments'],
    supported_asset_types: ['image', 'layer', 'scene'],
    models: [
      { id: 'flux-1.1-pro', label: 'Flux 1.1 Pro', asset_types: ['image', 'scene'], quality_tiers: ['production', 'marketplace'], cost_multiplier: 1.1, avg_seconds: 24 },
    ],
    available: false,
  },
  {
    id: 'imagen',
    label: 'Imagen',
    strengths: ['Photoreal scenes', 'Natural lighting'],
    weaknesses: ['Latency', 'Limited edit pipeline'],
    supported_resolutions: ['1024x1024', '1920x1080'],
    cost_per_image_usd: 0.05,
    cost_per_video_second_usd: 0,
    avg_generation_seconds: 25,
    best_use_cases: ['environment shell', 'atmospheric scenes'],
    supported_asset_types: ['image', 'scene'],
    models: [
      { id: 'imagen-3', label: 'Imagen 3', asset_types: ['image', 'scene'], quality_tiers: ['production', 'concept'], cost_multiplier: 1.0, avg_seconds: 26 },
    ],
    available: false,
  },
  {
    id: 'runway',
    label: 'Runway',
    strengths: ['Cinematic video', 'Motion'],
    weaknesses: ['Cost at duration', 'Less ideal for still layers'],
    supported_resolutions: ['1280x720', '1920x1080'],
    cost_per_image_usd: 0,
    cost_per_video_second_usd: 0.15,
    avg_generation_seconds: 45,
    best_use_cases: ['video', 'motion previews', 'cinematic b-roll'],
    supported_asset_types: ['video'],
    models: [
      { id: 'gen-3-alpha', label: 'Gen-3 Alpha', asset_types: ['video'], quality_tiers: ['production', 'concept'], cost_multiplier: 1.0, avg_seconds: 50 },
    ],
    available: false,
  },
];

const LAYER_GENERATION_ORDER = [
  { step_id: 'environment-shell', label: 'Environment Shell™', category: 'environment' },
  { step_id: 'lighting-systems', label: 'Lighting Systems™', category: 'lighting' },
  { step_id: 'surface-materials', label: 'Surface Materials™', category: 'materials' },
  { step_id: 'furniture-objects', label: 'Furniture & Objects™', category: 'furniture' },
  { step_id: 'signature-landmark', label: 'Signature Landmark™', category: 'hero' },
  { step_id: 'atmospheric-systems', label: 'Atmospheric Systems™', category: 'atmosphere' },
];

export function selectProviderAndModel(input: {
  asset_type: AssetType;
  quality_tier: QualityIntent;
  category?: string;
}): { provider: ProviderCapability; model: ProviderModel } {
  const assetType = input.asset_type;
  const tier = input.quality_tier;

  const candidates = PROVIDER_CAPABILITIES.filter(
    (p) => p.supported_asset_types.includes(assetType) && (p.available || p.id === 'fal')
  );

  let best = candidates[0] ?? PROVIDER_CAPABILITIES[0];
  let bestScore = -1;

  for (const provider of candidates) {
    let score = provider.available ? 10 : 1;
    const category = (input.category ?? '').toLowerCase();
    if (provider.best_use_cases.some((u) => category.includes(u) || u.includes(category))) score += 5;
    if (assetType === 'video' && provider.supported_asset_types.includes('video')) score += 8;
    if (tier === 'production' || tier === 'marketplace') {
      if (provider.id === 'gpt-image' && category.includes('hero')) score += 4;
      if (provider.id === 'fal') score += 3;
    }
    if (tier === 'draft' || tier === 'concept') {
      if (provider.avg_generation_seconds < 20) score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      best = provider;
    }
  }

  const model =
    best.models.find((m) => m.quality_tiers.includes(tier) && m.asset_types.includes(assetType)) ??
    best.models[0];

  return { provider: best, model };
}

export function buildLayeredGenerationOrder(
  reusableByCategory: Map<string, string>
): import('./types.js').GenerationOrderStep[] {
  return LAYER_GENERATION_ORDER.map((layer, idx) => {
    const reuseId = reusableByCategory.get(layer.category);
    return {
      order: idx + 1,
      step_id: layer.step_id,
      label: layer.label,
      category: layer.category,
      action: reuseId ? 'reuse' : 'generate',
      asset_id: reuseId,
      requires_approval: true,
    };
  });
}

export function estimateProviderCost(
  provider: ProviderCapability,
  model: ProviderModel,
  input: { asset_type: AssetType; step_count: number; concept_count: number; duration_seconds?: number }
): number {
  const steps = Math.max(1, input.step_count);
  const concepts = Math.max(1, input.concept_count);
  if (input.asset_type === 'video') {
    const secs = input.duration_seconds ?? 4;
    return provider.cost_per_video_second_usd * secs * model.cost_multiplier * concepts;
  }
  return provider.cost_per_image_usd * model.cost_multiplier * steps * concepts;
}
