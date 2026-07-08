import type { StudioAssetRegistryEntry } from '../../../studio-os-core/studio-builder/types';
import { upsertLocalRegistryEntry } from '../../../studio-os-core/studio-builder/registry-store';
import {
  dispatchSceneStackHydrated,
  hydrateSceneStackFromBuilderRegistry,
} from '../../../studio-os-core/scene-stack/warehouse-bridge';
import type { RegistryAsset } from './api';
import { registryFetch } from './api';

export const PIPELINE_REGISTRY_SYNCED_EVENT = 'studio-os-pipeline-registry-synced';

const DEFAULT_ORG_ID = 'frontal-slayer';

export type PipelineRegistryUpsertPayload = {
  org_id?: string;
  department_id: string;
  project_id: string;
  package_id: string;
  builder_asset_id: string;
  production_group_id: string;
  station_id?: string | null;
  layer_id?: string | null;
  category: string;
  name: string;
  artifact_url: string;
  storage_path?: string | null;
  generation_model?: string | null;
  prompt_version?: string | null;
};

function dispatchPipelineRegistrySynced(detail?: { merged: number }): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PIPELINE_REGISTRY_SYNCED_EVENT, { detail }));
}

function entryFromSupabaseRow(row: RegistryAsset): Omit<StudioAssetRegistryEntry, 'id' | 'registeredAt'> {
  const meta = row.metadata ?? {};
  const builderAssetId =
    typeof meta.studio_builder_asset_id === 'string'
      ? meta.studio_builder_asset_id
      : row.id;
  const storagePath = typeof meta.storage_path === 'string' ? meta.storage_path : '';
  const productionGroupId =
    typeof meta.production_group_id === 'string' ? meta.production_group_id : `scene-stack-${row.id}`;
  const packageId = typeof meta.package_id === 'string' ? meta.package_id : row.generation_pack_id ?? '';
  const projectId = typeof meta.project_id === 'string' ? meta.project_id : '';

  return {
    departmentId: row.department_id ?? 'creative-direction',
    projectId,
    packageId,
    assetId: builderAssetId,
    productionGroupId,
    category: row.category,
    publicUrl: row.artifact_url ?? '',
    storagePath,
    model: row.generation_model ?? 'fal-ai/nano-banana-pro/edit',
    promptVersion: row.prompt_version ?? 'scene-stack.v1',
    status: 'validated',
    stationId: row.workspace_scene_id ?? (typeof meta.station_id === 'string' ? meta.station_id : undefined),
    layerId: row.scene_id ?? (typeof meta.layer_id === 'string' ? meta.layer_id : undefined),
    supabaseAssetId: row.id,
  };
}

export function payloadFromStudioRegistryEntry(
  entry: StudioAssetRegistryEntry,
  orgId = DEFAULT_ORG_ID
): PipelineRegistryUpsertPayload {
  return {
    org_id: orgId,
    department_id: entry.departmentId,
    project_id: entry.projectId,
    package_id: entry.packageId,
    builder_asset_id: entry.assetId,
    production_group_id: entry.productionGroupId,
    station_id: entry.stationId ?? null,
    layer_id: entry.layerId ?? null,
    category: entry.category,
    name: entry.assetId.replace(/scene-stack-|[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    artifact_url: entry.publicUrl,
    storage_path: entry.storagePath || null,
    generation_model: entry.model,
    prompt_version: entry.promptVersion,
  };
}

/** Fire-and-forget sync of a pipeline asset to Supabase Studio Asset Registry™. */
export function schedulePipelineAssetSync(
  entry: StudioAssetRegistryEntry,
  orgId = DEFAULT_ORG_ID
): void {
  if (!entry.publicUrl?.startsWith('http')) return;

  void (async () => {
    const result = await registryFetch<{ ok: true; asset: RegistryAsset }>(
      '/api/admin/studio-asset-registry',
      {
        method: 'POST',
        body: { action: 'upsert_pipeline', ...payloadFromStudioRegistryEntry(entry, orgId) },
      }
    );
    if (!('ok' in result) || result.ok !== true || !result.asset) return;

    upsertLocalRegistryEntry({
      ...entry,
      supabaseAssetId: result.asset.id,
      publicUrl: result.asset.artifact_url ?? entry.publicUrl,
      storagePath:
        typeof result.asset.metadata?.storage_path === 'string'
          ? result.asset.metadata.storage_path
          : entry.storagePath,
    });
    dispatchPipelineRegistrySynced();
  })();
}

export async function fetchPipelineRegistryAssets(
  departmentId: string,
  projectId: string,
  orgId = DEFAULT_ORG_ID
): Promise<RegistryAsset[]> {
  const qs = new URLSearchParams({
    action: 'list_pipeline',
    org_id: orgId,
    department_id: departmentId,
    project_id: projectId,
    limit: '200',
  });
  const result = await registryFetch<{ ok: true; assets: RegistryAsset[] }>(
    `/api/admin/studio-asset-registry?${qs.toString()}`
  );
  if (!('ok' in result) || result.ok !== true || !Array.isArray(result.assets)) return [];
  return result.assets;
}

/** Pull Supabase pipeline assets into local builder registry + Scene Stack. */
export async function hydratePipelineRegistryFromSupabase(
  departmentId: string,
  projectId: string,
  orgId = DEFAULT_ORG_ID
): Promise<number> {
  const remote = await fetchPipelineRegistryAssets(departmentId, projectId, orgId);
  let merged = 0;
  for (const row of remote) {
    if (!row.artifact_url?.startsWith('http')) continue;
    const mapped = entryFromSupabaseRow(row);
    if (!mapped.projectId || mapped.projectId !== projectId) continue;
    upsertLocalRegistryEntry(mapped);
    merged += 1;
  }

  if (merged > 0) {
    const mounted = hydrateSceneStackFromBuilderRegistry(departmentId, projectId);
    dispatchPipelineRegistrySynced({ merged });
    if (mounted > 0) dispatchSceneStackHydrated();
  }

  return merged;
}
