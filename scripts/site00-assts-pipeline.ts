/**
 * SITE 00 ASSTS production pipeline (server-side, service role).
 * Usage: npx tsx scripts/site00-assts-pipeline.ts [bootstrap|generate|poll|approve-all|lock|status]
 */
import { ensureBootstrapBatch, enrichAsset, enrichBatch, getBatchByKey, listAssetsForBatch, recordReviewEvent, recomputeBatchStatus } from '../api/_lib/site00Assts/service.js';
import { pollPendingGenerationJobs, runBatchGeneration } from '../api/_lib/site00Assts/generation.js';
import { lockBatchAndPromoteSlots, resolveProductionAsset } from '../api/_lib/site00Assts/slots.js';
import { BATCH_ASSTS_ENV_001 } from '../api/_lib/site00Assts/manifests.js';
import { getSupabaseAdmin } from '../api/_lib/supabase.js';

const cmd = process.argv[2] ?? 'status';
const BATCH_KEY = 'BATCH-ASSTS-ENV-001';

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const supabase = getSupabaseAdmin();

  if (cmd === 'bootstrap') {
    const batch = await ensureBootstrapBatch(BATCH_KEY);
    console.log(JSON.stringify({ ok: true, batchId: batch.id, batchKey: batch.batch_key }, null, 2));
    return;
  }

  if (cmd === 'generate') {
    await ensureBootstrapBatch(BATCH_KEY);
    const result = await runBatchGeneration(BATCH_KEY);
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    return;
  }

  if (cmd === 'poll') {
    const maxRounds = Number(process.argv[3] ?? 40);
    let total = 0;
    for (let i = 0; i < maxRounds; i += 1) {
      const n = await pollPendingGenerationJobs(10);
      total += n;
      const batch = await getBatchByKey(BATCH_KEY);
      const assets = batch ? await listAssetsForBatch(batch.id) : [];
      console.log(`poll round ${i + 1}: completed=${n} assets=${assets.map((a) => `${a.asset_key}:${a.status}`).join(', ')}`);
      const pending = assets.some((a) => a.status === 'GENERATING' || a.status === 'QUEUED');
      if (!pending && assets.length > 0 && assets.every((a) => ['NEEDS_REVIEW', 'APPROVED', 'LOCKED'].includes(a.status))) {
        console.log(JSON.stringify({ ok: true, totalCompleted: total, done: true }, null, 2));
        return;
      }
      await sleep(8000);
    }
    console.log(JSON.stringify({ ok: false, totalCompleted: total, done: false, error: 'timeout' }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (cmd === 'regenerate-test') {
    const assetKey = process.argv[3] ?? 's00_env_assts_inspection_mobile';
    const { getAssetByKey } = await import('../api/_lib/site00Assts/service.js');
    const { queueRegeneration } = await import('../api/_lib/site00Assts/generation.js');
    const asset = await getAssetByKey(assetKey);
    if (!asset) throw new Error(`Asset ${assetKey} missing`);
    const before = await enrichAsset(asset);
    console.log('before', before.versions.map((v) => `v${v.version_number}:${v.status}`).join(', '));
    const { versionId } = await queueRegeneration(asset.id, { categories: ['LIGHTING'], note: 'Regeneration v02 validation' });
    console.log('queued', versionId);
    for (let i = 0; i < 25; i += 1) {
      await pollPendingGenerationJobs(5);
      const current = await getAssetByKey(assetKey);
      const after = current ? await enrichAsset(current) : null;
      const v2 = after?.versions.find((v) => v.version_number === 2);
      console.log(`poll ${i + 1}: asset=${after?.status} v2=${v2?.status ?? 'missing'}`);
      if (v2?.status === 'NEEDS_REVIEW') {
        console.log(JSON.stringify({ ok: true, v1Preserved: after!.versions.some((v) => v.version_number === 1), v2Ready: true }, null, 2));
        return;
      }
      await sleep(8000);
    }
    throw new Error('Regeneration poll timeout');
  }

  if (cmd === 'approve-all') {
    const batch = await getBatchByKey(BATCH_KEY);
    if (!batch) throw new Error('Batch missing — run bootstrap first');
    const assets = await listAssetsForBatch(batch.id);
    for (const asset of assets) {
      const enriched = await enrichAsset(asset);
      const version = enriched.currentVersion;
      if (!version || version.status !== 'NEEDS_REVIEW') {
        console.log(`skip ${asset.asset_key} status=${asset.status}`);
        continue;
      }
      await supabase.from('site00_asset_versions').update({ status: 'APPROVED' }).eq('id', version.id);
      await supabase
        .from('site00_logical_assets')
        .update({ status: 'APPROVED', approved_version_id: version.id, updated_at: new Date().toISOString() })
        .eq('id', asset.id);
      await recordReviewEvent({
        assetId: asset.id,
        assetVersionId: version.id,
        batchId: batch.id,
        action: 'APPROVE',
        note: 'Pipeline auto-approve for bootstrap validation',
      });
      console.log(`approved ${asset.asset_key} v${version.version_number}`);
    }
    await recomputeBatchStatus(batch.id);
    const updated = await enrichBatch(batch);
    console.log(JSON.stringify({ ok: true, batchStatus: updated.status, counts: updated.counts }, null, 2));
    return;
  }

  if (cmd === 'reset-review') {
    const batch = await getBatchByKey(BATCH_KEY);
    if (!batch) throw new Error('Batch missing');
    const { resetBatchForReview, recomputeBatchStatus } = await import('../api/_lib/site00Assts/service.js');
    await resetBatchForReview(batch.id);
    await recomputeBatchStatus(batch.id);
    console.log(JSON.stringify({ ok: true, batchId: batch.id, status: 'IN_REVIEW' }, null, 2));
    return;
  }

  if (cmd === 'lock') {
    const batch = await getBatchByKey(BATCH_KEY);
    if (!batch) throw new Error('Batch missing');
    await pollPendingGenerationJobs(10);
    await recomputeBatchStatus(batch.id);
    const result = await lockBatchAndPromoteSlots(batch.id);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === 'status') {
    const batch = await getBatchByKey(BATCH_KEY);
    const resolved: Record<string, unknown> = {};
    for (const manifestAsset of BATCH_ASSTS_ENV_001.assets) {
      resolved[manifestAsset.semanticSlotKey] = await resolveProductionAsset(manifestAsset.semanticSlotKey);
    }
    const assets = batch ? await listAssetsForBatch(batch.id) : [];
    console.log(
      JSON.stringify(
        {
          batch: batch ? { id: batch.id, status: batch.status, batch_key: batch.batch_key } : null,
          assets: assets.map((a) => ({ key: a.asset_key, status: a.status, approved: a.approved_version_id })),
          slots: resolved,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
