import type { RegistrySupabase } from '../assetRegistry/types.js';
import { getReuseRecommendations } from '../assetRegistry/recommendations.js';
import { searchRegistryAssets } from '../assetRegistry/service.js';
import type { FounderIntentInput, ReusableAssetMatch } from './types.js';

function mapRecommendation(
  rec: Awaited<ReturnType<typeof getReuseRecommendations>>[number],
  source: ReusableAssetMatch['source']
): ReusableAssetMatch {
  return {
    asset_id: rec.asset_id,
    name: rec.name,
    category: rec.category,
    source,
    compatibility_score: rec.compatibility_score,
    match_type: rec.match_type,
    generation_cost: 0,
    usage_count: rec.usage_count,
    reason: rec.reason,
  };
}

export async function discoverReusableAssets(
  supabase: RegistrySupabase,
  intent: FounderIntentInput
): Promise<ReusableAssetMatch[]> {
  const orgId = intent.org_id;
  const matches: ReusableAssetMatch[] = [];
  const seen = new Set<string>();

  const add = (item: ReusableAssetMatch) => {
    if (seen.has(item.asset_id)) return;
    seen.add(item.asset_id);
    matches.push(item);
  };

  const recs = await getReuseRecommendations(supabase, {
    org_id: orgId,
    category: intent.category,
    reuse_category: intent.reuse_category,
    tags: intent.tags,
    materials: intent.materials,
    lighting_profile: intent.lighting_profile,
    limit: 15,
  });

  for (const rec of recs) add(mapRecommendation(rec, 'registry'));

  if (intent.department_id) {
    const { assets } = await searchRegistryAssets(supabase, {
      org_id: orgId,
      department_id: intent.department_id,
      limit: 10,
    });
    for (const asset of assets) {
      add({
        asset_id: asset.id,
        name: asset.name,
        category: asset.category,
        source: 'department',
        compatibility_score: 0.5,
        match_type: 'partial',
        generation_cost: Number(asset.generation_cost ?? 0),
        usage_count: asset.usage_count,
        reason: `Department asset in ${intent.department_id}`,
      });
    }
  }

  if (intent.workspace_id || intent.scene_id) {
    const { assets } = await searchRegistryAssets(supabase, {
      org_id: orgId,
      workspace_scene_id: intent.workspace_id,
      scene_id: intent.scene_id,
      limit: 8,
    });
    for (const asset of assets) {
      add({
        asset_id: asset.id,
        name: asset.name,
        category: asset.category,
        source: 'workspace',
        compatibility_score: 0.55,
        match_type: 'close',
        generation_cost: Number(asset.generation_cost ?? 0),
        usage_count: asset.usage_count,
        reason: 'Previously used in this workspace or scene',
      });
    }
  }

  const { assets: goldenCandidates } = await searchRegistryAssets(supabase, {
    org_id: orgId,
    tags: ['golden-build'],
    limit: 5,
  });
  for (const asset of goldenCandidates) {
    add({
      asset_id: asset.id,
      name: asset.name,
      category: asset.category,
      source: 'golden_build',
      compatibility_score: 0.75,
      match_type: 'close',
      generation_cost: Number(asset.generation_cost ?? 0),
      usage_count: asset.usage_count,
      reason: 'Approved Golden Build™ asset',
    });
  }

  const { assets: marketplaceCandidates } = await searchRegistryAssets(supabase, {
    org_id: orgId,
    q: intent.category ?? intent.raw_intent.slice(0, 40),
    limit: 5,
  });
  for (const asset of marketplaceCandidates.filter((a) => a.marketplace_eligible)) {
    add({
      asset_id: asset.id,
      name: asset.name,
      category: asset.category,
      source: 'marketplace',
      compatibility_score: 0.6,
      match_type: 'partial',
      generation_cost: Number(asset.generation_cost ?? 0),
      usage_count: asset.usage_count,
      reason: 'Marketplace-eligible pack asset',
    });
  }

  matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
  return matches.slice(0, 20);
}
