#!/usr/bin/env node
/**
 * Studio Asset Registry™ smoke test — exercises Supabase tables directly.
 * Usage: node scripts/studio-asset-registry-smoke.mjs
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';

const ORG_ID = process.env.STUDIO_REGISTRY_ORG_ID || 'frontal-slayer';

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  const url = requireEnv('SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, key);

  const stamp = Date.now();
  const assetRow = {
    org_id: ORG_ID,
    name: `Smoke Test Asset ${stamp}`,
    category: 'prop',
    department_id: 'visuals',
    scene_id: `scene-smoke-${stamp}`,
    generation_pack_id: `pack-smoke-${stamp}`,
    tags: ['smoke', 'registry', `run-${stamp}`],
    materials: ['marble', 'glass'],
    lighting_profile: 'soft-key',
    generation_cost: 0.12,
    generation_provider: 'fal',
    generation_model: 'flux-pro',
    prompt_version: 'v1',
    reuse_category: 'set-dressing',
    similarity_traits: { mood: 'bright', finish: 'gloss' },
    metadata: { smoke: true, run: stamp },
  };

  console.log('1. Register asset…');
  const { data: created, error: createErr } = await supabase
    .from('studio_asset_registry_assets')
    .insert(assetRow)
    .select()
    .single();
  if (createErr) throw createErr;
  const assetId = created.id;
  console.log('   ✓', assetId, created.name);

  console.log('2. Version history…');
  const { error: versionErr } = await supabase.from('studio_asset_registry_versions').insert({
    asset_id: assetId,
    org_id: ORG_ID,
    version_number: 1,
    change_summary: 'Smoke initial',
    snapshot: { name: created.name, category: created.category },
    generation_cost: created.generation_cost,
    generation_provider: created.generation_provider,
    is_current: true,
  });
  if (versionErr) throw versionErr;
  console.log('   ✓ version 1');

  console.log('3. Similarity hook…');
  const { error: simErr } = await supabase.from('studio_asset_registry_similarity_hooks').upsert({
    asset_id: assetId,
    org_id: ORG_ID,
    traits: assetRow.similarity_traits,
    hook_type: 'traits',
  });
  if (simErr) throw simErr;
  console.log('   ✓ traits hook');

  console.log('4. Relationships…');
  const { error: relErr } = await supabase.from('studio_asset_registry_relationships').insert([
    {
      org_id: ORG_ID,
      from_asset_id: assetId,
      relation_type: 'belongs_to_scene',
      target_kind: 'scene',
      target_ref: assetRow.scene_id,
    },
    {
      org_id: ORG_ID,
      from_asset_id: assetId,
      relation_type: 'belongs_to_department',
      target_kind: 'department',
      target_ref: assetRow.department_id,
    },
    {
      org_id: ORG_ID,
      from_asset_id: assetId,
      relation_type: 'from_generation_pack',
      target_kind: 'generation_pack',
      target_ref: assetRow.generation_pack_id,
    },
  ]);
  if (relErr) throw relErr;
  console.log('   ✓ scene, department, generation_pack links');

  console.log('5. Search by tag…');
  const { data: tagHits, error: tagErr } = await supabase
    .from('studio_asset_registry_assets')
    .select('id, name, tags')
    .eq('org_id', ORG_ID)
    .contains('tags', [`run-${stamp}`]);
  if (tagErr) throw tagErr;
  console.log('   ✓', tagHits?.length ?? 0, 'hit(s)');

  console.log('6. Full-text search…');
  const { data: ftsHits, error: ftsErr } = await supabase
    .from('studio_asset_registry_assets')
    .select('id, name')
    .eq('org_id', ORG_ID)
    .textSearch('search_document', `Smoke & Test`);
  if (ftsErr) throw ftsErr;
  console.log('   ✓', ftsHits?.length ?? 0, 'hit(s)');

  console.log('7. Usage tracking…');
  const { error: usageErr } = await supabase.from('studio_asset_registry_usage_events').insert({
    asset_id: assetId,
    org_id: ORG_ID,
    event_type: 'reuse',
    context: { scene: assetRow.scene_id, smoke: true },
  });
  if (usageErr) throw usageErr;
  const { data: usageAsset, error: usageCountErr } = await supabase
    .from('studio_asset_registry_assets')
    .update({ usage_count: 1 })
    .eq('id', assetId)
    .select('usage_count, generation_cost, generation_provider')
    .single();
  if (usageCountErr) throw usageCountErr;
  console.log('   ✓ usage_count=', usageAsset.usage_count, 'cost=', usageAsset.generation_cost);

  console.log('8. Retrieve asset…');
  const { data: retrieved, error: getErr } = await supabase
    .from('studio_asset_registry_assets')
    .select('*')
    .eq('id', assetId)
    .single();
  if (getErr) throw getErr;
  console.log('   ✓', retrieved.name, 'v', retrieved.current_version);

  console.log('9. Related assets query…');
  const { data: rels, error: relGetErr } = await supabase
    .from('studio_asset_registry_relationships')
    .select('*')
    .eq('from_asset_id', assetId);
  if (relGetErr) throw relGetErr;
  console.log('   ✓', rels?.length ?? 0, 'relationship(s)');

  console.log('\n✅ Studio Asset Registry smoke test passed');
  console.log('   Asset ID:', assetId);
  console.log('   (Test row left in DB — archive manually if desired)');
}

main().catch((err) => {
  console.error('❌ Smoke test failed:', err.message || err);
  process.exit(1);
});
