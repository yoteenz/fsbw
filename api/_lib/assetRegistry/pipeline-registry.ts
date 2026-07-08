import type { CreateRegistryAssetInput, RegistryAssetRow, RegistrySupabase, UpdateRegistryAssetInput } from './types.js';
import { createRegistryAsset, updateRegistryAsset } from './service.js';

export type PipelineRegistryUpsertInput = {
  org_id: string;
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
  tags?: string[];
};

const PIPELINE_CREATED_BY = 'scene-stack-pipeline';

export async function getPipelineRegistryAssetByBuilderKey(
  supabase: RegistrySupabase,
  orgId: string,
  departmentId: string,
  projectId: string,
  builderAssetId: string
): Promise<RegistryAssetRow | null> {
  const { data, error } = await supabase
    .from('studio_asset_registry_assets')
    .select('*')
    .eq('org_id', orgId)
    .eq('department_id', departmentId)
    .eq('created_by_type', PIPELINE_CREATED_BY)
    .filter('metadata->>project_id', 'eq', projectId)
    .filter('metadata->>studio_builder_asset_id', 'eq', builderAssetId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as RegistryAssetRow | null) ?? null;
}

export async function upsertPipelineRegistryAsset(
  supabase: RegistrySupabase,
  input: PipelineRegistryUpsertInput
): Promise<RegistryAssetRow> {
  const metadata = {
    project_id: input.project_id,
    package_id: input.package_id,
    studio_builder_asset_id: input.builder_asset_id,
    production_group_id: input.production_group_id,
    storage_path: input.storage_path ?? null,
    station_id: input.station_id ?? null,
    layer_id: input.layer_id ?? null,
  };

  const existing = await getPipelineRegistryAssetByBuilderKey(
    supabase,
    input.org_id,
    input.department_id,
    input.project_id,
    input.builder_asset_id
  );

  if (existing) {
    const patch: UpdateRegistryAssetInput = {
      name: input.name,
      category: input.category,
      workspace_scene_id: input.station_id ?? existing.workspace_scene_id,
      scene_id: input.layer_id ?? existing.scene_id,
      generation_pack_id: input.package_id,
      artifact_url: input.artifact_url,
      generation_model: input.generation_model ?? existing.generation_model,
      prompt_version: input.prompt_version ?? existing.prompt_version,
      tags: input.tags ?? existing.tags,
      metadata: { ...existing.metadata, ...metadata },
      change_summary: 'Scene Stack pipeline regeneration',
    };
    return updateRegistryAsset(supabase, input.org_id, existing.id, patch);
  }

  const createInput: CreateRegistryAssetInput = {
    org_id: input.org_id,
    name: input.name,
    category: input.category,
    department_id: input.department_id,
    workspace_scene_id: input.station_id ?? null,
    scene_id: input.layer_id ?? null,
    generation_pack_id: input.package_id,
    tags: input.tags ?? ['scene-stack-layer', 'studio-builder', input.department_id],
    artifact_url: input.artifact_url,
    generation_provider: 'fal',
    generation_model: input.generation_model ?? 'fal-ai/nano-banana-pro/edit',
    prompt_version: input.prompt_version ?? null,
    created_by_type: PIPELINE_CREATED_BY,
    created_by_id: input.builder_asset_id,
    reuse_category: 'scene-stack-layer',
    metadata,
  };

  return createRegistryAsset(supabase, createInput);
}

export async function listPipelineRegistryAssets(
  supabase: RegistrySupabase,
  orgId: string,
  departmentId: string,
  projectId: string,
  limit = 200
): Promise<RegistryAssetRow[]> {
  const { data, error } = await supabase
    .from('studio_asset_registry_assets')
    .select('*')
    .eq('org_id', orgId)
    .eq('department_id', departmentId)
    .eq('created_by_type', PIPELINE_CREATED_BY)
    .filter('metadata->>project_id', 'eq', projectId)
    .eq('archived', false)
    .order('updated_at', { ascending: false })
    .limit(Math.min(limit, 200));
  if (error) throw new Error(error.message);
  return (data ?? []) as RegistryAssetRow[];
}
