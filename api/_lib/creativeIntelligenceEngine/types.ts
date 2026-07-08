/** Creative Intelligence Engine™ — decision object types. */

export type QualityIntent =
  | 'draft'
  | 'concept'
  | 'production'
  | 'marketplace'
  | 'archival'
  | 'system_reusable';

export type AssetType = 'image' | 'video' | 'layer' | 'scene' | 'audio';

export type RecommendedStrategy =
  | 'reuse_existing'
  | 'reuse_and_modify'
  | 'generate_variation'
  | 'generate_new'
  | 'layered_generation'
  | 'multi_concept';

export type RiskLevel = 'low' | 'medium' | 'high';

export type GenomeSnapshotInput = {
  company_name?: string;
  material_language?: string;
  editorial_direction?: string;
  lighting_style?: string;
  photography_direction?: string;
  brand_dna?: string;
  creative_dna_confidence?: number;
  visual_dna_confidence?: number;
};

export type FounderIntentInput = {
  org_id: string;
  raw_intent: string;
  category?: string;
  department_id?: string;
  workspace_id?: string;
  scene_id?: string;
  generation_pack_id?: string;
  quality_intent?: QualityIntent;
  asset_type?: AssetType;
  tags?: string[];
  materials?: string[];
  lighting_profile?: string;
  reuse_category?: string;
  prefer_reuse?: boolean;
  concept_count?: number;
  layered?: boolean;
  genome_snapshot?: GenomeSnapshotInput;
  metadata?: Record<string, unknown>;
};

export type ReusableAssetMatch = {
  asset_id: string;
  name: string;
  category: string;
  source: 'registry' | 'golden_build' | 'marketplace' | 'department' | 'workspace';
  compatibility_score: number;
  match_type: 'exact' | 'close' | 'partial';
  generation_cost: number;
  usage_count: number;
  reason: string;
};

export type MissingAssetSpec = {
  category: string;
  layer_id?: string;
  reason: string;
  estimated_cost: number;
};

export type GenerationOrderStep = {
  order: number;
  step_id: string;
  label: string;
  category: string;
  action: 'reuse' | 'modify' | 'generate';
  asset_id?: string;
  requires_approval: boolean;
};

export type ApprovalGate = {
  gate_id: string;
  label: string;
  reason: string;
  required: boolean;
};

export type CostIntelligence = {
  estimated_provider_cost: number;
  estimated_total_project_cost: number;
  reuse_savings: number;
  marketplace_savings: number;
  previous_asset_savings: number;
  projected_tokens: number;
  estimated_duration_seconds: number;
};

export type GenomeAlignment = {
  score: number;
  aligned_traits: string[];
  misaligned_traits: string[];
  summary: string;
};

export type CreativeIntelligenceDecision = {
  id: string;
  org_id: string;
  intent: FounderIntentInput;
  recommended_strategy: RecommendedStrategy;
  confidence_score: number;
  cost_intelligence: CostIntelligence;
  reusable_assets: ReusableAssetMatch[];
  assets_missing: MissingAssetSpec[];
  recommended_provider: string;
  recommended_model: string;
  generation_order: GenerationOrderStep[];
  approval_gates: ApprovalGate[];
  risk_level: RiskLevel;
  quality_tier: QualityIntent;
  genome_alignment: GenomeAlignment;
  founder_messages: string[];
  reasoning_summary: string;
  should_generate: boolean;
  concept_count: number;
  created_at: string;
};

export type LearningSignalAction =
  | 'approve'
  | 'reject'
  | 'regenerate'
  | 'reuse'
  | 'duplicate'
  | 'favorite'
  | 'purchase'
  | 'archive'
  | 'modify';

export type LearningSignalInput = {
  org_id: string;
  decision_id?: string;
  asset_id?: string;
  action: LearningSignalAction;
  context?: Record<string, unknown>;
};
