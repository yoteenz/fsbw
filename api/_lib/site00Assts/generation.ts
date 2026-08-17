import { getSupabaseAdmin } from '../supabase.js';
import {
  pollStudioBuilderFalQueue,
  fetchStudioBuilderFalResult,
} from '../studioBuilderGeneration.js';
import { getBatchManifestByKey } from './manifests.js';
import {
  buildVersionStoragePath,
  downloadUrlToBuffer,
  uploadSite00AssetBuffer,
  SITE00_ASSETS_BUCKET,
} from './storage.js';
import {
  enrichAsset,
  getAssetById,
  getBatchByKey,
  getVersionsForAsset,
  listAssetsForBatch,
  publicUrlForStoragePath,
  recordReviewEvent,
  recomputeBatchStatus,
  type DbAsset,
} from './service.js';

const DEFAULT_MODEL = 'fal-ai/nano-banana-pro';

async function submitEnvironmentFalJob(
  prompt: string,
  aspectRatio: string,
  outputFormat: 'webp' | 'png',
  model = DEFAULT_MODEL,
): Promise<{ providerRequestId: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const falInput = {
    prompt,
    aspect_ratio: aspectRatio,
    output_format: outputFormat,
    resolution: '2K',
    num_images: 1,
  };
  const { request_id: providerRequestId } = await fal.queue.submit(model, { input: falInput });
  return { providerRequestId, model };
}

export async function createVersionAndQueueGeneration(
  asset: DbAsset,
  opts: {
    batchKey: string;
    prompt: string;
    promptVersion: string;
    model?: string;
    aspectRatio: string;
    outputFormat: 'webp' | 'png';
    parentVersionId?: string | null;
    correctionNote?: string;
    correctionCategories?: string[];
  },
): Promise<{ versionId: string; jobId: string }> {
  const supabase = getSupabaseAdmin();
  const versions = await getVersionsForAsset(asset.id);
  const nextVersion = (versions[versions.length - 1]?.version_number ?? 0) + 1;

  const { data: version, error: vErr } = await supabase
    .from('site00_asset_versions')
    .insert({
      asset_id: asset.id,
      version_number: nextVersion,
      generation_provider: 'fal',
      generation_model: opts.model ?? DEFAULT_MODEL,
      prompt_version: opts.promptVersion,
      prompt_snapshot: opts.prompt,
      status: 'GENERATING',
      parent_version_id: opts.parentVersionId ?? null,
      generation_parameters: {
        aspectRatio: opts.aspectRatio,
        outputFormat: opts.outputFormat,
        correctionNote: opts.correctionNote ?? null,
        correctionCategories: opts.correctionCategories ?? null,
      },
    })
    .select('*')
    .single();
  if (vErr) throw new Error(vErr.message);

  const idempotencyKey = `${asset.asset_key}:v${String(nextVersion).padStart(2, '0')}`;

  const { data: existingJob } = await supabase
    .from('site00_generation_jobs')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existingJob) {
    return { versionId: version.id, jobId: existingJob.id };
  }

  const submit = await submitEnvironmentFalJob(opts.prompt, opts.aspectRatio, opts.outputFormat, opts.model ?? DEFAULT_MODEL);

  const { data: job, error: jErr } = await supabase
    .from('site00_generation_jobs')
    .insert({
      asset_id: asset.id,
      asset_version_id: version.id,
      batch_id: asset.batch_id,
      provider: 'fal',
      provider_job_id: submit.providerRequestId,
      provider_model: submit.model,
      status: 'GENERATING',
      idempotency_key: idempotencyKey,
      request_snapshot: { prompt: opts.prompt, aspectRatio: opts.aspectRatio },
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (jErr) throw new Error(jErr.message);

  await supabase
    .from('site00_logical_assets')
    .update({ status: 'GENERATING', current_version_id: version.id, updated_at: new Date().toISOString() })
    .eq('id', asset.id);

  if (asset.batch_id) await recomputeBatchStatus(asset.batch_id);

  return { versionId: version.id, jobId: job.id };
}

export async function runBatchGeneration(batchKey: string): Promise<{ queued: number; jobs: string[] }> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error(`Unknown batch: ${batchKey}`);

  const batch = await getBatchByKey(batchKey);
  if (!batch) throw new Error('Batch not seeded — run bootstrap first');

  const assets = await listAssetsForBatch(batch.id);
  const jobs: string[] = [];
  let queued = 0;

  const supabase = getSupabaseAdmin();
  await supabase.from('site00_batches').update({ status: 'GENERATING' }).eq('id', batch.id);

  for (const manifestAsset of manifest.assets) {
    const asset = assets.find((a) => a.asset_key === manifestAsset.assetKey);
    if (!asset) continue;

    // Skip if already has a version in review or approved
    const versions = await getVersionsForAsset(asset.id);
    const hasActive = versions.some((v) => ['NEEDS_REVIEW', 'APPROVED', 'LOCKED', 'GENERATING'].includes(v.status));
    if (hasActive && asset.status !== 'QUEUED' && asset.status !== 'FAILED') continue;

    const fullPrompt = `${manifest.masterPrompt}\n\n${manifestAsset.compositionPrompt}`;
    const { jobId } = await createVersionAndQueueGeneration(asset, {
      batchKey,
      prompt: fullPrompt,
      promptVersion: manifest.promptVersion,
      model: manifest.model,
      aspectRatio: manifest.aspectRatio,
      outputFormat: manifest.outputFormat,
    });
    jobs.push(jobId);
    queued += 1;

    await recordReviewEvent({
      assetId: asset.id,
      batchId: batch.id,
      action: 'GENERATED',
      note: `Queued ${manifestAsset.assetKey} v${versions.length + 1}`,
    });
  }

  return { queued, jobs };
}

export async function pollPendingGenerationJobs(limit = 5): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: jobs } = await supabase
    .from('site00_generation_jobs')
    .select('*')
    .in('status', ['QUEUED', 'GENERATING'])
    .order('created_at', { ascending: true })
    .limit(limit);

  let completed = 0;
  for (const job of jobs ?? []) {
    if (!job.provider_job_id || !job.provider_model) continue;
    try {
      const { status } = await pollStudioBuilderFalQueue(job.provider_model, job.provider_job_id);
      if (status === 'IN_QUEUE' || status === 'IN_PROGRESS') continue;

      if (status === 'FAILED') {
        await supabase.from('site00_generation_jobs').update({ status: 'FAILED', error: 'FAL failed', completed_at: new Date().toISOString() }).eq('id', job.id);
        if (job.asset_version_id) {
          await supabase.from('site00_asset_versions').update({ status: 'FAILED' }).eq('id', job.asset_version_id);
        }
        if (job.asset_id) {
          await supabase.from('site00_logical_assets').update({ status: 'FAILED' }).eq('id', job.asset_id);
        }
        continue;
      }

      const imageUrl = await fetchStudioBuilderFalResult(job.provider_model, job.provider_job_id);
      if (!imageUrl) {
        await supabase.from('site00_generation_jobs').update({ status: 'FAILED', error: 'No image URL', completed_at: new Date().toISOString() }).eq('id', job.id);
        continue;
      }

      const asset = job.asset_id ? await getAssetById(job.asset_id) : null;
      let batchKey = 'BATCH-ASSTS-ENV-001';
      if (asset?.batch_id) {
        const { data: batchRow } = await supabase.from('site00_batches').select('batch_key').eq('id', asset.batch_id).single();
        if (batchRow?.batch_key) batchKey = batchRow.batch_key;
      }

      const { data: version } = await supabase.from('site00_asset_versions').select('*').eq('id', job.asset_version_id).single();
      const versionNumber = version?.version_number ?? 1;
      const ext = 'webp';
      const storagePath = buildVersionStoragePath(batchKey ?? 'BATCH-ASSTS-ENV-001', asset?.asset_key ?? 'asset', versionNumber, ext);

      const buffer = await downloadUrlToBuffer(imageUrl);
      const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');

      await supabase
        .from('site00_asset_versions')
        .update({
          status: 'NEEDS_REVIEW',
          file_path: uploaded.storagePath,
          thumbnail_path: uploaded.storagePath,
          preview_path: uploaded.storagePath,
        })
        .eq('id', job.asset_version_id);

      await supabase
        .from('site00_logical_assets')
        .update({ status: 'NEEDS_REVIEW', current_version_id: job.asset_version_id, updated_at: new Date().toISOString() })
        .eq('id', job.asset_id);

      await supabase
        .from('site00_generation_jobs')
        .update({
          status: 'COMPLETE',
          response_snapshot: { imageUrl, storagePath: uploaded.storagePath },
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (asset?.batch_id) await recomputeBatchStatus(asset.batch_id);
      completed += 1;
    } catch (e) {
      await supabase
        .from('site00_generation_jobs')
        .update({ status: 'FAILED', error: e instanceof Error ? e.message : String(e), completed_at: new Date().toISOString() })
        .eq('id', job.id);
    }
  }
  return completed;
}

export async function queueRegeneration(
  assetId: string,
  input: { categories: string[]; note?: string },
): Promise<{ versionId: string; jobId: string }> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');
  const batchRow = asset.batch_id
    ? await getSupabaseAdmin().from('site00_batches').select('batch_key, manifest').eq('id', asset.batch_id).single()
    : null;
  const batchKey = batchRow?.data?.batch_key ?? 'BATCH-ASSTS-ENV-001';
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error('Manifest missing');

  const manifestAsset = manifest.assets.find((a) => a.assetKey === asset.asset_key);
  if (!manifestAsset) throw new Error('Asset not in manifest');

  const correctionBlock = [
    input.categories.length ? `Correction categories: ${input.categories.join(', ')}.` : '',
    input.note ? `Note: ${input.note}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const fullPrompt = `${manifest.masterPrompt}\n\n${manifestAsset.compositionPrompt}\n\nREGENERATION CORRECTION:\n${correctionBlock}`;

  await getSupabaseAdmin().from('site00_logical_assets').update({ status: 'REGENERATING' }).eq('id', asset.id);

  const result = await createVersionAndQueueGeneration(asset, {
    batchKey,
    prompt: fullPrompt,
    promptVersion: manifest.promptVersion,
    model: manifest.model,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    parentVersionId: asset.current_version_id,
    correctionNote: input.note,
    correctionCategories: input.categories,
  });

  await recordReviewEvent({
    assetId: asset.id,
    assetVersionId: result.versionId,
    batchId: asset.batch_id,
    action: 'REGENERATE',
    note: input.note ?? null,
    correctionCategories: input.categories,
  });

  return result;
}

export { publicUrlForStoragePath, enrichAsset };
