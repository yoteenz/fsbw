import type { RegistrySupabase } from '../assetRegistry/types.js';
import type { LearningSignalInput } from './types.js';

export async function recordLearningSignal(
  supabase: RegistrySupabase,
  input: LearningSignalInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('studio_creative_intelligence_learning_signals')
    .insert({
      org_id: input.org_id,
      decision_id: input.decision_id ?? null,
      asset_id: input.asset_id ?? null,
      action: input.action,
      context: input.context ?? {},
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

export function genomeLearningHint(action: LearningSignalInput['action']): string {
  switch (action) {
    case 'approve':
      return 'Reinforces Company Genome™ preferences for similar future requests.';
    case 'reject':
      return 'Signals drift — future recommendations will deprioritize similar outputs.';
    case 'reuse':
      return 'Strengthens reuse-first recommendations for this category.';
    case 'favorite':
      return 'Elevates asset visibility in reuse recommendations.';
    case 'purchase':
      return 'Marketplace purchase updates genome acquisition signals.';
    case 'archive':
      return 'Archived assets excluded from active reuse pool.';
    default:
      return 'Learning signal recorded for future decision refinement.';
  }
}
