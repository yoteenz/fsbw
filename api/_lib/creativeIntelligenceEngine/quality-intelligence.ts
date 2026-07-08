import type { FounderIntentInput, QualityIntent } from './types.js';

const QUALITY_SETTINGS: Record<
  QualityIntent,
  { token_multiplier: number; approval_required: boolean; concept_default: number; label: string }
> = {
  draft: { token_multiplier: 0.5, approval_required: false, concept_default: 1, label: 'Draft exploration' },
  concept: { token_multiplier: 0.75, approval_required: true, concept_default: 3, label: 'Concept exploration' },
  production: { token_multiplier: 1.0, approval_required: true, concept_default: 1, label: 'Production-quality asset' },
  marketplace: { token_multiplier: 1.25, approval_required: true, concept_default: 2, label: 'Marketplace-ready asset' },
  archival: { token_multiplier: 0.6, approval_required: false, concept_default: 1, label: 'Archival reference' },
  system_reusable: { token_multiplier: 1.1, approval_required: true, concept_default: 1, label: 'Reusable system asset' },
};

export function resolveQualityTier(intent: FounderIntentInput): QualityIntent {
  if (intent.quality_intent) return intent.quality_intent;
  const text = intent.raw_intent.toLowerCase();
  if (text.includes('marketplace') || text.includes('sell')) return 'marketplace';
  if (text.includes('draft') || text.includes('sketch') || text.includes('rough')) return 'draft';
  if (text.includes('concept') || text.includes('explore') || text.includes('options')) return 'concept';
  if (text.includes('archive') || text.includes('reference only')) return 'archival';
  if (text.includes('reusable') || text.includes('system') || text.includes('layer')) return 'system_reusable';
  return 'production';
}

export function resolveConceptCount(intent: FounderIntentInput, quality: QualityIntent): number {
  if (intent.concept_count && intent.concept_count > 0) return Math.min(intent.concept_count, 6);
  return QUALITY_SETTINGS[quality].concept_default;
}

export function qualityRequiresApproval(quality: QualityIntent): boolean {
  return QUALITY_SETTINGS[quality].approval_required;
}

export function qualityTokenMultiplier(quality: QualityIntent): number {
  return QUALITY_SETTINGS[quality].token_multiplier;
}

export function qualityLabel(quality: QualityIntent): string {
  return QUALITY_SETTINGS[quality].label;
}
