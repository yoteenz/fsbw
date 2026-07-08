import type {
  AssetSearchFilters,
  CreateRegistryAssetInput,
  CreateRelationshipInput,
  RegistryAssetRow,
  RegistryRelationshipRow,
  RegistrySupabase,
  RegistryUsageRow,
  RegistryVersionRow,
  UpdateRegistryAssetInput,
} from './types.js';

const ASSET_TABLE = 'studio_asset_registry_assets';
const VERSION_TABLE = 'studio_asset_registry_versions';
const RELATIONSHIP_TABLE = 'studio_asset_registry_relationships';
const USAGE_TABLE = 'studio_asset_registry_usage_events';
const SIMILARITY_TABLE = 'studio_asset_registry_similarity_hooks';

function assetSnapshot(row: RegistryAssetRow): Record<string, unknown> {
  return {
    name: row.name,
    category: row.category,
    department_id: row.department_id,
    workspace_scene_id: row.workspace_scene_id,
    scene_id: row.scene_id,
    generation_pack_id: row.generation_pack_id,
    tags: row.tags,
    materials: row.materials,
    lighting_profile: row.lighting_profile,
    camera_profile: row.camera_profile,
    resolution: row.resolution,
    aspect_ratio: row.aspect_ratio,
    generation_cost: row.generation_cost,
    generation_provider: row.generation_provider,
    generation_model: row.generation_model,
    prompt_version: row.prompt_version,
    blueprint_version: row.blueprint_version,
    artifact_url: row.artifact_url,
    reuse_category: row.reuse_category,
    similarity_traits: row.similarity_traits,
    metadata: row.metadata,
    current_version: row.current_version,
  };
}

async function upsertSimilarityHook(
  supabase: RegistrySupabase,
  assetId: string,
  orgId: string,
  traits: Record<string, unknown>,
  embeddingRef: string | null
): Promise<void> {
  const { error } = await supabase.from(SIMILARITY_TABLE).upsert(
    {
      asset_id: assetId,
      org_id: orgId,
      hook_type: embeddingRef ? 'embedding' : 'traits',
      embedding_ref: embeddingRef,
      traits,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'asset_id' }
  );
  if (error) throw new Error(error.message);
}

async function insertRelationships(
  supabase: RegistrySupabase,
  orgId: string,
  fromAssetId: string,
  relationships: CreateRelationshipInput[]
): Promise<RegistryRelationshipRow[]> {
  if (!relationships.length) return [];

  const rows = relationships.map((rel) => ({
    org_id: orgId,
    from_asset_id: fromAssetId,
    to_asset_id: rel.target_kind === 'asset' ? rel.to_asset_id ?? null : null,
    relation_type: rel.relation_type,
    target_kind: rel.target_kind,
    target_ref: rel.target_kind === 'asset' ? null : rel.target_ref ?? null,
    weight: rel.weight ?? 1,
    metadata: rel.metadata ?? {},
  }));

  const { data, error } = await supabase.from(RELATIONSHIP_TABLE).insert(rows).select();
  if (error) throw new Error(error.message);
  return (data ?? []) as RegistryRelationshipRow[];
}

export async function createRegistryAsset(
  supabase: RegistrySupabase,
  input: CreateRegistryAssetInput
): Promise<RegistryAssetRow> {
  const now = new Date().toISOString();
  const row = {
    org_id: input.org_id,
    name: input.name,
    category: input.category,
    department_id: input.department_id ?? null,
    workspace_scene_id: input.workspace_scene_id ?? null,
    scene_id: input.scene_id ?? null,
    generation_pack_id: input.generation_pack_id ?? null,
    tags: input.tags ?? [],
    materials: input.materials ?? [],
    lighting_profile: input.lighting_profile ?? null,
    camera_profile: input.camera_profile ?? null,
    resolution: input.resolution ?? null,
    aspect_ratio: input.aspect_ratio ?? null,
    generation_cost: input.generation_cost ?? 0,
    generation_provider: input.generation_provider ?? null,
    generation_model: input.generation_model ?? null,
    prompt_version: input.prompt_version ?? null,
    blueprint_version: input.blueprint_version ?? null,
    created_by_type: input.created_by_type ?? 'pipeline',
    created_by_id: input.created_by_id ?? null,
    marketplace_eligible: input.marketplace_eligible ?? false,
    favorite: input.favorite ?? false,
    artifact_url: input.artifact_url ?? null,
    reuse_category: input.reuse_category ?? null,
    similarity_traits: input.similarity_traits ?? {},
    similarity_embedding_ref: input.similarity_embedding_ref ?? null,
    metadata: input.metadata ?? {},
    current_version: 1,
    updated_at: now,
  };

  const { data, error } = await supabase.from(ASSET_TABLE).insert(row).select().single();
  if (error) throw new Error(error.message);
  const asset = data as RegistryAssetRow;

  const { error: versionError } = await supabase.from(VERSION_TABLE).insert({
    asset_id: asset.id,
    org_id: input.org_id,
    version_number: 1,
    change_summary: 'Initial registration',
    snapshot: assetSnapshot(asset),
    generation_cost: asset.generation_cost,
    generation_provider: asset.generation_provider,
    generation_model: asset.generation_model,
    prompt_version: asset.prompt_version,
    is_current: true,
  });
  if (versionError) throw new Error(versionError.message);

  await upsertSimilarityHook(
    supabase,
    asset.id,
    input.org_id,
    input.similarity_traits ?? {},
    input.similarity_embedding_ref ?? null
  );

  if (input.relationships?.length) {
    await insertRelationships(supabase, input.org_id, asset.id, input.relationships);
  }

  return asset;
}

export async function getRegistryAsset(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string
): Promise<RegistryAssetRow | null> {
  const { data, error } = await supabase
    .from(ASSET_TABLE)
    .select('*')
    .eq('id', assetId)
    .eq('org_id', orgId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as RegistryAssetRow | null) ?? null;
}

export async function updateRegistryAsset(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string,
  input: UpdateRegistryAssetInput
): Promise<RegistryAssetRow> {
  const existing = await getRegistryAsset(supabase, orgId, assetId);
  if (!existing) throw new Error('Asset not found');

  const nextVersion = existing.current_version + 1;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const fields: (keyof UpdateRegistryAssetInput)[] = [
    'name',
    'category',
    'department_id',
    'workspace_scene_id',
    'scene_id',
    'generation_pack_id',
    'tags',
    'materials',
    'lighting_profile',
    'camera_profile',
    'resolution',
    'aspect_ratio',
    'generation_cost',
    'generation_provider',
    'generation_model',
    'prompt_version',
    'blueprint_version',
    'marketplace_eligible',
    'favorite',
    'archived',
    'artifact_url',
    'reuse_category',
    'similarity_traits',
    'similarity_embedding_ref',
    'metadata',
  ];

  for (const field of fields) {
    if (input[field] !== undefined) patch[field] = input[field];
  }
  patch.current_version = nextVersion;

  const { data, error } = await supabase
    .from(ASSET_TABLE)
    .update(patch)
    .eq('id', assetId)
    .eq('org_id', orgId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  const updated = data as RegistryAssetRow;

  await supabase
    .from(VERSION_TABLE)
    .update({ is_current: false })
    .eq('asset_id', assetId)
    .eq('is_current', true);

  const { error: versionError } = await supabase.from(VERSION_TABLE).insert({
    asset_id: assetId,
    org_id: orgId,
    version_number: nextVersion,
    change_summary: input.change_summary ?? 'Updated asset',
    snapshot: assetSnapshot(updated),
    generation_cost: updated.generation_cost,
    generation_provider: updated.generation_provider,
    generation_model: updated.generation_model,
    prompt_version: updated.prompt_version,
    is_current: true,
  });
  if (versionError) throw new Error(versionError.message);

  if (input.similarity_traits !== undefined || input.similarity_embedding_ref !== undefined) {
    await upsertSimilarityHook(
      supabase,
      assetId,
      orgId,
      updated.similarity_traits,
      updated.similarity_embedding_ref
    );
  }

  return updated;
}

export async function archiveRegistryAsset(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string
): Promise<RegistryAssetRow> {
  return updateRegistryAsset(supabase, orgId, assetId, {
    archived: true,
    change_summary: 'Archived asset',
  });
}

export async function searchRegistryAssets(
  supabase: RegistrySupabase,
  filters: AssetSearchFilters
): Promise<{ assets: RegistryAssetRow[]; total: number }> {
  const limit = Math.min(filters.limit ?? 50, 200);
  const offset = filters.offset ?? 0;

  let query = supabase
    .from(ASSET_TABLE)
    .select('*', { count: 'exact' })
    .eq('org_id', filters.org_id);

  if (!filters.include_archived) query = query.eq('archived', false);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.workspace_scene_id) query = query.eq('workspace_scene_id', filters.workspace_scene_id);
  if (filters.scene_id) query = query.eq('scene_id', filters.scene_id);
  if (filters.generation_pack_id) query = query.eq('generation_pack_id', filters.generation_pack_id);
  if (filters.tags?.length) query = query.contains('tags', filters.tags);
  if (filters.q?.trim()) {
    const term = filters.q.trim().replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean).join(' & ');
    if (term) query = query.textSearch('search_document', term);
  }

  query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { assets: (data ?? []) as RegistryAssetRow[], total: count ?? 0 };
}

export async function searchRegistryByTags(
  supabase: RegistrySupabase,
  orgId: string,
  tags: string[],
  limit = 50
): Promise<RegistryAssetRow[]> {
  const { assets } = await searchRegistryAssets(supabase, {
    org_id: orgId,
    tags,
    limit,
  });
  return assets;
}

export async function getRegistryVersions(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string
): Promise<RegistryVersionRow[]> {
  const { data, error } = await supabase
    .from(VERSION_TABLE)
    .select('*')
    .eq('asset_id', assetId)
    .eq('org_id', orgId)
    .order('version_number', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RegistryVersionRow[];
}

export async function recordRegistryUsage(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string,
  eventType = 'reuse',
  context: Record<string, unknown> = {}
): Promise<{ event: RegistryUsageRow; asset: RegistryAssetRow }> {
  const asset = await getRegistryAsset(supabase, orgId, assetId);
  if (!asset) throw new Error('Asset not found');

  const { data: event, error: usageError } = await supabase
    .from(USAGE_TABLE)
    .insert({
      asset_id: assetId,
      org_id: orgId,
      event_type: eventType,
      context,
    })
    .select()
    .single();
  if (usageError) throw new Error(usageError.message);

  const { data: updated, error: countError } = await supabase
    .from(ASSET_TABLE)
    .update({
      usage_count: asset.usage_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId)
    .eq('org_id', orgId)
    .select()
    .single();
  if (countError) throw new Error(countError.message);

  return { event: event as RegistryUsageRow, asset: updated as RegistryAssetRow };
}

export async function getRegistryUsage(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string,
  limit = 50
): Promise<RegistryUsageRow[]> {
  const { data, error } = await supabase
    .from(USAGE_TABLE)
    .select('*')
    .eq('asset_id', assetId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as RegistryUsageRow[];
}

export async function getRegistryRelationships(
  supabase: RegistrySupabase,
  orgId: string,
  assetId: string
): Promise<{
  outgoing: RegistryRelationshipRow[];
  incoming: RegistryRelationshipRow[];
  linked_assets: RegistryAssetRow[];
}> {
  const [outRes, inRes] = await Promise.all([
    supabase
      .from(RELATIONSHIP_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('from_asset_id', assetId),
    supabase
      .from(RELATIONSHIP_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('to_asset_id', assetId),
  ]);

  if (outRes.error) throw new Error(outRes.error.message);
  if (inRes.error) throw new Error(inRes.error.message);

  const outgoing = (outRes.data ?? []) as RegistryRelationshipRow[];
  const incoming = (inRes.data ?? []) as RegistryRelationshipRow[];

  const linkedIds = new Set<string>();
  for (const rel of outgoing) {
    if (rel.to_asset_id) linkedIds.add(rel.to_asset_id);
  }
  for (const rel of incoming) {
    linkedIds.add(rel.from_asset_id);
  }
  linkedIds.delete(assetId);

  let linked_assets: RegistryAssetRow[] = [];
  if (linkedIds.size > 0) {
    const { data, error } = await supabase
      .from(ASSET_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .in('id', [...linkedIds]);
    if (error) throw new Error(error.message);
    linked_assets = (data ?? []) as RegistryAssetRow[];
  }

  return { outgoing, incoming, linked_assets };
}

export async function addRegistryRelationship(
  supabase: RegistrySupabase,
  orgId: string,
  fromAssetId: string,
  input: CreateRelationshipInput
): Promise<RegistryRelationshipRow> {
  const asset = await getRegistryAsset(supabase, orgId, fromAssetId);
  if (!asset) throw new Error('Asset not found');

  const rows = await insertRelationships(supabase, orgId, fromAssetId, [input]);
  return rows[0];
}
