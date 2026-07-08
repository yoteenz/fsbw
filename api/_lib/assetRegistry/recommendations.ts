import type {
  RegistrySupabase,
  ReuseRecommendation,
  SimilarityQuery,
} from './types.js';
import { findSimilarAssets } from './similarity.js';

const DEFAULT_REGEN_COST = 0.35;

export async function getReuseRecommendations(
  supabase: RegistrySupabase,
  query: SimilarityQuery & { estimated_regen_cost?: number }
): Promise<ReuseRecommendation[]> {
  const similar = await findSimilarAssets(supabase, query);
  const regenCost = query.estimated_regen_cost ?? DEFAULT_REGEN_COST;

  return similar.map((item) => {
    const savings = Math.max(0, regenCost - Number(item.asset.generation_cost ?? 0));
    let match_type: ReuseRecommendation['match_type'] = 'partial';
    if (item.score >= 0.85) match_type = 'exact';
    else if (item.score >= 0.55) match_type = 'close';

    const reasonParts = item.match_reasons.slice(0, 3);
    const reason =
      reasonParts.length > 0
        ? `Matches on ${reasonParts.join(', ')}`
        : `Similar ${item.asset.category} asset`;

    return {
      asset_id: item.asset.id,
      name: item.asset.name,
      category: item.asset.category,
      compatibility_score: item.score,
      match_type,
      estimated_savings: Math.round(savings * 10000) / 10000,
      usage_count: item.asset.usage_count,
      reason,
    };
  });
}
