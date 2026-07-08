import { randomUUID } from 'crypto';
import type { RegistrySupabase } from '../assetRegistry/types.js';
import { evaluateGenomeAlignment } from './genome-evaluator.js';
import { discoverReusableAssets } from './reuse-evaluator.js';
import { computeCostIntelligence, identifyMissingAssets } from './cost-intelligence.js';
import {
  buildLayeredGenerationOrder,
  selectProviderAndModel,
} from './providers.js';
import {
  qualityLabel,
  qualityRequiresApproval,
  resolveConceptCount,
  resolveQualityTier,
} from './quality-intelligence.js';
import type {
  ApprovalGate,
  CreativeIntelligenceDecision,
  FounderIntentInput,
  RecommendedStrategy,
  RiskLevel,
} from './types.js';

function deriveStrategy(input: {
  intent: FounderIntentInput;
  reusable_assets: import('./types.js').ReusableAssetMatch[];
  missing_count: number;
  quality: import('./types.js').QualityIntent;
  concept_count: number;
}): RecommendedStrategy {
  const { intent, reusable_assets, missing_count, quality, concept_count } = input;
  const top = reusable_assets[0];
  const preferReuse = intent.prefer_reuse !== false;

  if (intent.layered || intent.raw_intent.toLowerCase().includes('layer')) {
    return 'layered_generation';
  }
  if (concept_count >= 2 || quality === 'concept') {
    return 'multi_concept';
  }
  if (top && top.compatibility_score >= 0.85 && missing_count === 0 && preferReuse) {
    return 'reuse_existing';
  }
  if (top && top.compatibility_score >= 0.6 && missing_count <= 1) {
    return top.match_type === 'exact' ? 'reuse_and_modify' : 'generate_variation';
  }
  if (top && top.compatibility_score >= 0.45 && preferReuse) {
    return 'generate_variation';
  }
  return 'generate_new';
}

function deriveRisk(input: {
  cost: import('./types.js').CostIntelligence;
  genome_score: number;
  strategy: RecommendedStrategy;
  missing_count: number;
}): RiskLevel {
  if (input.cost.estimated_total_project_cost > 1.5 || input.missing_count >= 4) return 'high';
  if (input.genome_score < 55 || input.strategy === 'generate_new') return 'medium';
  return 'low';
}

function buildApprovalGates(
  quality: import('./types.js').QualityIntent,
  strategy: RecommendedStrategy,
  cost: import('./types.js').CostIntelligence
): ApprovalGate[] {
  const gates: ApprovalGate[] = [];

  if (qualityRequiresApproval(quality)) {
    gates.push({
      gate_id: 'pre-generation',
      label: 'Pre-Generation Review',
      reason: `${qualityLabel(quality)} requires founder awareness before tokens are spent.`,
      required: true,
    });
  }

  if (cost.estimated_total_project_cost > 0.5) {
    gates.push({
      gate_id: 'cost-threshold',
      label: 'Cost Threshold',
      reason: `Estimated project cost $${cost.estimated_total_project_cost.toFixed(2)} exceeds comfort threshold.`,
      required: true,
    });
  }

  if (strategy === 'layered_generation') {
    gates.push({
      gate_id: 'layer-approval',
      label: 'Per-Layer Approval',
      reason: 'Layered scenes require approval between major layers.',
      required: true,
    });
  }

  if (strategy === 'multi_concept') {
    gates.push({
      gate_id: 'concept-selection',
      label: 'Concept Selection',
      reason: 'Founder must select a winning concept before production assembly.',
      required: true,
    });
  }

  return gates;
}

function buildFounderMessages(input: {
  strategy: RecommendedStrategy;
  reusable_count: number;
  cost: import('./types.js').CostIntelligence;
  genome_summary: string;
  concept_count: number;
  layered: boolean;
}): string[] {
  const messages: string[] = [];

  if (input.reusable_count > 0) {
    messages.push(
      `I found ${input.reusable_count} similar environment${input.reusable_count > 1 ? 's' : ''} you've already approved.`
    );
  }
  if (input.cost.reuse_savings > 0.05) {
    const pct = Math.round((input.cost.reuse_savings / Math.max(0.01, input.cost.estimated_provider_cost)) * 100);
    messages.push(`Reusing these assets will save approximately ${Math.min(95, pct)}%.`);
  }
  messages.push(input.genome_summary);
  if (input.layered) {
    messages.push('This scene is better generated as layered assets.');
  }
  if (input.concept_count > 1) {
    messages.push(`I recommend generating ${input.concept_count} concepts before proceeding.`);
  }
  if (input.strategy === 'reuse_existing') {
    messages.push('No new generation required — your existing assets cover this request.');
  }

  return messages;
}

export async function evaluateCreativeDecision(
  supabase: RegistrySupabase,
  intent: FounderIntentInput
): Promise<CreativeIntelligenceDecision> {
  if (!intent.org_id?.trim()) throw new Error('org_id required');
  if (!intent.raw_intent?.trim()) throw new Error('raw_intent required');

  const quality = resolveQualityTier(intent);
  const asset_type = intent.asset_type ?? (intent.raw_intent.toLowerCase().includes('video') ? 'video' : 'image');
  const concept_count = resolveConceptCount(intent, quality);
  const layered = Boolean(intent.layered || intent.raw_intent.toLowerCase().includes('layer'));

  const reusable_assets = await discoverReusableAssets(supabase, intent);
  const assets_missing = identifyMissingAssets({ intent, reusable_assets, layered });
  const genome_alignment = evaluateGenomeAlignment(intent);

  const { provider, model } = selectProviderAndModel({
    asset_type,
    quality_tier: quality,
    category: intent.category,
  });

  const step_count = layered ? 6 : Math.max(1, assets_missing.length || 1);
  const cost_intelligence = computeCostIntelligence({
    intent,
    quality,
    provider,
    model,
    reusable_assets,
    missing_count: assets_missing.length,
    step_count,
    concept_count,
    asset_type,
  });

  const recommended_strategy = deriveStrategy({
    intent,
    reusable_assets,
    missing_count: assets_missing.length,
    quality,
    concept_count,
  });

  const reuseByCategory = new Map<string, string>();
  for (const asset of reusable_assets) {
    if (asset.compatibility_score >= 0.7 && !reuseByCategory.has(asset.category)) {
      reuseByCategory.set(asset.category, asset.asset_id);
    }
  }

  const generation_order = layered
    ? buildLayeredGenerationOrder(reuseByCategory)
    : assets_missing.map((m, idx) => ({
        order: idx + 1,
        step_id: m.layer_id ?? m.category,
        label: m.category,
        category: m.category,
        action: 'generate' as const,
        requires_approval: qualityRequiresApproval(quality),
      }));

  const risk_level = deriveRisk({
    cost: cost_intelligence,
    genome_score: genome_alignment.score,
    strategy: recommended_strategy,
    missing_count: assets_missing.length,
  });

  const approval_gates = buildApprovalGates(quality, recommended_strategy, cost_intelligence);

  const should_generate =
    recommended_strategy !== 'reuse_existing' ||
    assets_missing.length > 0;

  const founder_messages = buildFounderMessages({
    strategy: recommended_strategy,
    reusable_count: reusable_assets.filter((a) => a.compatibility_score >= 0.55).length,
    cost: cost_intelligence,
    genome_summary: genome_alignment.summary,
    concept_count,
    layered,
  });

  const reasoning_parts = [
    `Strategy: ${recommended_strategy.replace(/_/g, ' ')}.`,
    `Quality: ${qualityLabel(quality)}.`,
    `Provider: ${provider.label} / ${model.label}.`,
    `${reusable_assets.length} reusable candidates, ${assets_missing.length} gaps.`,
    genome_alignment.summary,
  ];

  return {
    id: randomUUID(),
    org_id: intent.org_id,
    intent,
    recommended_strategy,
    confidence_score: Math.round(
      Math.min(
        98,
        genome_alignment.score * 0.35 +
          (reusable_assets[0]?.compatibility_score ?? 0) * 35 +
          (should_generate ? 15 : 30) +
          (provider.available ? 10 : 0)
      )
    ),
    cost_intelligence,
    reusable_assets,
    assets_missing,
    recommended_provider: provider.id,
    recommended_model: model.id,
    generation_order,
    approval_gates,
    risk_level,
    quality_tier: quality,
    genome_alignment,
    founder_messages,
    reasoning_summary: reasoning_parts.join(' '),
    should_generate,
    concept_count,
    created_at: new Date().toISOString(),
  };
}

export async function persistCreativeDecision(
  supabase: RegistrySupabase,
  decision: CreativeIntelligenceDecision
): Promise<void> {
  const { error } = await supabase.from('studio_creative_intelligence_decisions').insert({
    id: decision.id,
    org_id: decision.org_id,
    recommended_strategy: decision.recommended_strategy,
    confidence_score: decision.confidence_score,
    risk_level: decision.risk_level,
    should_generate: decision.should_generate,
    intent: decision.intent,
    decision_payload: decision,
    created_at: decision.created_at,
  });
  if (error) throw new Error(error.message);
}

export async function getPersistedDecision(
  supabase: RegistrySupabase,
  orgId: string,
  decisionId: string
): Promise<CreativeIntelligenceDecision | null> {
  const { data, error } = await supabase
    .from('studio_creative_intelligence_decisions')
    .select('decision_payload')
    .eq('id', decisionId)
    .eq('org_id', orgId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.decision_payload as CreativeIntelligenceDecision | null) ?? null;
}
