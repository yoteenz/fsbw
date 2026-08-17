import { getSupabaseAdmin } from '../supabase.js';
import type { AssetStatus, BatchStatus } from './types.js';
import { BATCH_ASSTS_ENV_001, getBatchManifestByKey } from './manifests.js';

export type DbBatch = {
  id: string;
  batch_key: string;
  display_name: string;
  description: string | null;
  category: string | null;
  status: BatchStatus;
  total_assets: number;
  required_assets: number;
  manifest: unknown;
  created_at: string;
  completed_at: string | null;
  locked_at: string | null;
};

export type DbAsset = {
  id: string;
  asset_key: string;
  display_name: string;
  asset_type: string;
  category: string | null;
  batch_id: string | null;
  semantic_slot_key: string | null;
  current_version_id: string | null;
  approved_version_id: string | null;
  production_version_id: string | null;
  status: AssetStatus;
  required: boolean;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
};

export type DbVersion = {
  id: string;
  asset_id: string;
  version_number: number;
  file_path: string | null;
  thumbnail_path: string | null;
  preview_path: string | null;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  prompt_snapshot: string | null;
  status: AssetStatus;
  created_at: string;
};

function supabase() {
  return getSupabaseAdmin();
}

export async function ensureBootstrapBatch(batchKey = BATCH_ASSTS_ENV_001.batchKey): Promise<DbBatch> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error(`Unknown batch manifest: ${batchKey}`);

  const { data: existing } = await supabase()
    .from('site00_batches')
    .select('*')
    .eq('batch_key', batchKey)
    .maybeSingle();

  if (existing) return existing as DbBatch;

  const { data: batch, error: batchErr } = await supabase()
    .from('site00_batches')
    .insert({
      batch_key: manifest.batchKey,
      display_name: manifest.displayName,
      description: manifest.description ?? null,
      category: manifest.category,
      status: 'DRAFT',
      total_assets: manifest.assets.length,
      required_assets: manifest.assets.filter((a) => a.required).length,
      manifest,
    })
    .select('*')
    .single();
  if (batchErr) throw new Error(batchErr.message);

  for (const asset of manifest.assets) {
    const { data: existingAsset } = await supabase()
      .from('site00_logical_assets')
      .select('id')
      .eq('asset_key', asset.assetKey)
      .maybeSingle();
    if (existingAsset) continue;

    await supabase().from('site00_logical_assets').insert({
      asset_key: asset.assetKey,
      display_name: asset.displayName,
      asset_type: 'environment',
      category: manifest.category,
      batch_id: batch.id,
      semantic_slot_key: asset.semanticSlotKey,
      status: 'QUEUED',
      required: asset.required,
    });
  }

  return batch as DbBatch;
}

export async function getBatchByKey(batchKey: string): Promise<DbBatch | null> {
  const { data } = await supabase().from('site00_batches').select('*').eq('batch_key', batchKey).maybeSingle();
  return (data as DbBatch) ?? null;
}

export async function getBatchById(batchId: string): Promise<DbBatch | null> {
  const { data } = await supabase().from('site00_batches').select('*').eq('id', batchId).maybeSingle();
  return (data as DbBatch) ?? null;
}

export async function listAssetsForBatch(batchId: string): Promise<DbAsset[]> {
  const { data, error } = await supabase()
    .from('site00_logical_assets')
    .select('*')
    .eq('batch_id', batchId)
    .order('asset_key');
  if (error) throw new Error(error.message);
  return (data ?? []) as DbAsset[];
}

export async function getAssetById(assetId: string): Promise<DbAsset | null> {
  const { data } = await supabase().from('site00_logical_assets').select('*').eq('id', assetId).maybeSingle();
  return (data as DbAsset) ?? null;
}

export async function getAssetByKey(assetKey: string): Promise<DbAsset | null> {
  const { data } = await supabase().from('site00_logical_assets').select('*').eq('asset_key', assetKey).maybeSingle();
  return (data as DbAsset) ?? null;
}

export async function getVersionById(versionId: string): Promise<DbVersion | null> {
  const { data } = await supabase().from('site00_asset_versions').select('*').eq('id', versionId).maybeSingle();
  return (data as DbVersion) ?? null;
}

export async function getVersionsForAsset(assetId: string): Promise<DbVersion[]> {
  const { data, error } = await supabase()
    .from('site00_asset_versions')
    .select('*')
    .eq('asset_id', assetId)
    .order('version_number', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbVersion[];
}

export async function getCurrentVersionForAsset(asset: DbAsset): Promise<DbVersion | null> {
  if (!asset.current_version_id) return null;
  return getVersionById(asset.current_version_id);
}

export async function listReviewEvents(assetId: string) {
  const { data } = await supabase()
    .from('site00_review_events')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function recordReviewEvent(input: {
  assetId: string;
  assetVersionId?: string | null;
  batchId?: string | null;
  action: string;
  note?: string | null;
  correctionCategories?: string[] | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase().from('site00_review_events').insert({
    asset_id: input.assetId,
    asset_version_id: input.assetVersionId ?? null,
    batch_id: input.batchId ?? null,
    action: input.action,
    note: input.note ?? null,
    correction_categories: input.correctionCategories ?? null,
    metadata: input.metadata ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function getLibrarySummary() {
  const { data: assets } = await supabase().from('site00_logical_assets').select('id, status, required');
  const rows = assets ?? [];
  const { data: batches } = await supabase().from('site00_batches').select('*').order('created_at', { ascending: false });

  const needsReview = rows.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const approved = rows.filter((a) => a.status === 'APPROVED' || a.status === 'LOCKED').length;
  const locked = rows.filter((a) => a.status === 'LOCKED').length;

  return {
    totalAssets: rows.length,
    batches: batches?.length ?? 0,
    needsReview,
    approved,
    locked,
    batchesList: batches ?? [],
  };
}

export async function recomputeBatchStatus(batchId: string): Promise<BatchStatus> {
  const assets = await listAssetsForBatch(batchId);
  const batch = await getBatchById(batchId);
  if (!batch) throw new Error('Batch not found');

  if (batch.status === 'LOCKED') return 'LOCKED';

  const required = assets.filter((a) => a.required);
  const anyGenerating = assets.some((a) => a.status === 'GENERATING' || a.status === 'REGENERATING');
  const anyFailed = required.some((a) => a.status === 'FAILED');
  const anyNeedsReview = assets.some((a) => a.status === 'NEEDS_REVIEW');
  const allRequiredApproved = required.every((a) => a.approved_version_id != null);

  const blocking = required.some((a) =>
    ['REJECTED', 'REGENERATING', 'NEEDS_REVIEW', 'FAILED', 'GENERATING', 'QUEUED'].includes(a.status),
  );

  let status: BatchStatus = batch.status;
  if (anyFailed) status = 'FAILED';
  else if (anyGenerating) status = 'GENERATING';
  else if (allRequiredApproved && !blocking) status = 'READY_TO_LOCK';
  else if (anyNeedsReview) status = 'IN_REVIEW';
  else if (required.some((a) => a.approved_version_id)) status = 'PARTIALLY_APPROVED';
  else status = 'DRAFT';

  await supabase().from('site00_batches').update({ status }).eq('id', batchId);
  return status;
}

export async function getNextNeedsReviewAssetInBatch(batchId: string, afterAssetId?: string): Promise<DbAsset | null> {
  const assets = await listAssetsForBatch(batchId);
  const needs = assets.filter((a) => a.status === 'NEEDS_REVIEW');
  if (!needs.length) return null;
  if (!afterAssetId) return needs[0];
  const idx = needs.findIndex((a) => a.id === afterAssetId);
  return needs[idx + 1] ?? null;
}

export async function listAllAssetsWithVersions() {
  const { data: assets, error } = await supabase().from('site00_logical_assets').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  const enriched = [];
  for (const asset of assets ?? []) {
    const versions = await getVersionsForAsset(asset.id);
    enriched.push({ ...asset, versions });
  }
  return enriched;
}

export function publicUrlForStoragePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview').getPublicUrl(path);
  return data.publicUrl;
}

export async function enrichAsset(asset: DbAsset) {
  const versions = await getVersionsForAsset(asset.id);
  const current = asset.current_version_id
    ? versions.find((v) => v.id === asset.current_version_id) ?? null
    : versions[versions.length - 1] ?? null;
  const approved = asset.approved_version_id
    ? versions.find((v) => v.id === asset.approved_version_id) ?? null
    : null;
  return {
    ...asset,
    versions: versions.map((v) => ({
      ...v,
      previewUrl: publicUrlForStoragePath(v.preview_path ?? v.thumbnail_path ?? v.file_path),
      fileUrl: publicUrlForStoragePath(v.file_path),
    })),
    currentVersion: current
      ? {
          ...current,
          previewUrl: publicUrlForStoragePath(current.preview_path ?? current.thumbnail_path ?? current.file_path),
          fileUrl: publicUrlForStoragePath(current.file_path),
        }
      : null,
    approvedVersion: approved
      ? {
          ...approved,
          previewUrl: publicUrlForStoragePath(approved.preview_path ?? approved.thumbnail_path ?? approved.file_path),
          fileUrl: publicUrlForStoragePath(approved.file_path),
        }
      : null,
  };
}

export async function enrichBatch(batch: DbBatch) {
  const assets = await listAssetsForBatch(batch.id);
  const enrichedAssets = await Promise.all(assets.map((a) => enrichAsset(a)));
  const approvedCount = enrichedAssets.filter((a) => a.approved_version_id).length;
  const needsReviewCount = enrichedAssets.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const regeneratingCount = enrichedAssets.filter((a) => a.status === 'REGENERATING' || a.status === 'GENERATING').length;
  const rejectedCount = enrichedAssets.filter((a) => a.status === 'REJECTED').length;
  return {
    ...batch,
    assets: enrichedAssets,
    counts: {
      total: enrichedAssets.length,
      approved: approvedCount,
      needsReview: needsReviewCount,
      regenerating: regeneratingCount,
      rejected: rejectedCount,
    },
  };
}
