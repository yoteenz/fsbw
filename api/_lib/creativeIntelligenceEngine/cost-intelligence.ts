import type { CostIntelligence, FounderIntentInput, MissingAssetSpec, ReusableAssetMatch } from './types.js';
import type { ProviderCapability, ProviderModel } from './providers.js';
import { estimateProviderCost } from './providers.js';
import { qualityTokenMultiplier } from './quality-intelligence.js';
import type { QualityIntent } from './types.js';

const BASE_REGEN_COST = 0.35;
const TOKENS_PER_IMAGE = 1200;

export function computeCostIntelligence(input: {
  intent: FounderIntentInput;
  quality: QualityIntent;
  provider: ProviderCapability;
  model: ProviderModel;
  reusable_assets: ReusableAssetMatch[];
  missing_count: number;
  step_count: number;
  concept_count: number;
  asset_type: import('./types.js').AssetType;
}): CostIntelligence {
  const { intent, quality, provider, model, reusable_assets, missing_count, step_count, concept_count, asset_type } =
    input;

  const fullGenCost = estimateProviderCost(provider, model, {
    asset_type,
    step_count,
    concept_count,
    duration_seconds: asset_type === 'video' ? 4 : undefined,
  });

  const tierMult = qualityTokenMultiplier(quality);
  const estimated_provider_cost = Math.round(fullGenCost * tierMult * 10000) / 10000;

  const reusePool = reusable_assets.filter((a) => a.compatibility_score >= 0.55);
  const registryReuse = reusePool
    .filter((a) => a.source === 'registry' || a.source === 'department' || a.source === 'workspace')
    .slice(0, 3);
  const marketplaceReuse = reusePool.filter((a) => a.source === 'marketplace').slice(0, 2);
  const goldenReuse = reusePool.filter((a) => a.source === 'golden_build').slice(0, 2);

  const previous_asset_savings = registryReuse.reduce(
    (sum, a) => sum + Math.max(0, BASE_REGEN_COST - a.generation_cost),
    0
  );
  const marketplace_savings = marketplaceReuse.reduce(
    (sum, a) => sum + Math.max(0, BASE_REGEN_COST * 0.8 - a.generation_cost * 0.5),
    0
  );
  const goldenSavings = goldenReuse.length > 0 ? BASE_REGEN_COST * 0.9 * goldenReuse.length : 0;
  const reuse_savings = Math.round((previous_asset_savings + marketplace_savings + goldenSavings) * 10000) / 10000;

  const reuseRatio = Math.min(0.85, reusePool.length * 0.12);
  const estimated_total_project_cost = Math.round(
    Math.max(0, estimated_provider_cost * (1 - reuseRatio) + missing_count * provider.cost_per_image_usd * 0.5) *
      10000
  ) / 10000;

  const projected_tokens = Math.round(
    TOKENS_PER_IMAGE * step_count * concept_count * tierMult * (1 - reuseRatio * 0.6)
  );

  const avgSeconds = model.avg_seconds * step_count * concept_count;
  const estimated_duration_seconds = Math.round(avgSeconds * (1 - reuseRatio * 0.4));

  return {
    estimated_provider_cost,
    estimated_total_project_cost,
    reuse_savings,
    marketplace_savings: Math.round(marketplace_savings * 10000) / 10000,
    previous_asset_savings: Math.round(previous_asset_savings * 10000) / 10000,
    projected_tokens,
    estimated_duration_seconds,
  };
}

export function identifyMissingAssets(input: {
  intent: FounderIntentInput;
  reusable_assets: ReusableAssetMatch[];
  layered: boolean;
}): MissingAssetSpec[] {
  const { intent, reusable_assets, layered } = input;
  const covered = new Set(reusable_assets.filter((a) => a.compatibility_score >= 0.7).map((a) => a.category));

  if (!layered) {
    if (covered.has(intent.category ?? '')) return [];
    return [
      {
        category: intent.category ?? 'asset',
        reason: 'No high-confidence reusable match for requested category',
        estimated_cost: 0.12,
      },
    ];
  }

  const layers = ['environment', 'lighting', 'materials', 'furniture', 'hero', 'atmosphere'];
  return layers
    .filter((cat) => !covered.has(cat))
    .map((cat) => ({
      category: cat,
      layer_id: cat,
      reason: `Layer ${cat} not found in registry — generation required`,
      estimated_cost: 0.08,
    }));
}
