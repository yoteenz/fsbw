import type { SupabaseClient } from '@supabase/supabase-js';

export type RegistryAssetRow = {
  id: string;
  org_id: string;
  name: string;
  category: string;
  department_id: string | null;
  workspace_scene_id: string | null;
  scene_id: string | null;
  generation_pack_id: string | null;
  tags: string[];
  materials: string[];
  lighting_profile: string | null;
  camera_profile: string | null;
  resolution: string | null;
  aspect_ratio: string | null;
  generation_cost: number;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  blueprint_version: string | null;
  created_by_type: string;
  created_by_id: string | null;
  usage_count: number;
  marketplace_eligible: boolean;
  favorite: boolean;
  archived: boolean;
  artifact_url: string | null;
  reuse_category: string | null;
  similarity_traits: Record<string, unknown>;
  similarity_embedding_ref: string | null;
  metadata: Record<string, unknown>;
  current_version: number;
  created_at: string;
  updated_at: string;
};

export type RegistryVersionRow = {
  id: string;
  asset_id: string;
  org_id: string;
  version_number: number;
  change_summary: string;
  snapshot: Record<string, unknown>;
  generation_cost: number | null;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  approved_by: string | null;
  is_current: boolean;
  created_at: string;
};

export type RegistryRelationshipRow = {
  id: string;
  org_id: string;
  from_asset_id: string;
  to_asset_id: string | null;
  relation_type: string;
  target_kind: 'asset' | 'department' | 'scene' | 'generation_pack' | 'workspace';
  target_ref: string | null;
  weight: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type RegistryUsageRow = {
  id: string;
  asset_id: string;
  org_id: string;
  event_type: string;
  context: Record<string, unknown>;
  created_at: string;
};

export type CreateRegistryAssetInput = {
  org_id: string;
  name: string;
  category: string;
  department_id?: string | null;
  workspace_scene_id?: string | null;
  scene_id?: string | null;
  generation_pack_id?: string | null;
  tags?: string[];
  materials?: string[];
  lighting_profile?: string | null;
  camera_profile?: string | null;
  resolution?: string | null;
  aspect_ratio?: string | null;
  generation_cost?: number;
  generation_provider?: string | null;
  generation_model?: string | null;
  prompt_version?: string | null;
  blueprint_version?: string | null;
  created_by_type?: string;
  created_by_id?: string | null;
  marketplace_eligible?: boolean;
  favorite?: boolean;
  artifact_url?: string | null;
  reuse_category?: string | null;
  similarity_traits?: Record<string, unknown>;
  similarity_embedding_ref?: string | null;
  metadata?: Record<string, unknown>;
  relationships?: CreateRelationshipInput[];
};

export type UpdateRegistryAssetInput = Partial<
  Omit<CreateRegistryAssetInput, 'org_id' | 'relationships'>
> & {
  archived?: boolean;
  change_summary?: string;
};

export type CreateRelationshipInput = {
  relation_type: string;
  target_kind: RegistryRelationshipRow['target_kind'];
  to_asset_id?: string | null;
  target_ref?: string | null;
  weight?: number;
  metadata?: Record<string, unknown>;
};

export type AssetSearchFilters = {
  org_id: string;
  q?: string;
  tags?: string[];
  category?: string;
  department_id?: string;
  workspace_scene_id?: string;
  scene_id?: string;
  generation_pack_id?: string;
  include_archived?: boolean;
  limit?: number;
  offset?: number;
};

export type SimilarityQuery = {
  org_id: string;
  asset_id?: string;
  category?: string;
  reuse_category?: string;
  materials?: string[];
  tags?: string[];
  lighting_profile?: string;
  limit?: number;
};

export type ReuseRecommendation = {
  asset_id: string;
  name: string;
  category: string;
  compatibility_score: number;
  match_type: 'exact' | 'close' | 'partial';
  estimated_savings: number;
  usage_count: number;
  reason: string;
};

export type RegistrySupabase = SupabaseClient;
