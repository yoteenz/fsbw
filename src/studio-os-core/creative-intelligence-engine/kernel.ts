import type { CreativeIntelligenceDecision, FounderIntentInput, KernelStage } from './types';

/** Canonical Studio OS kernel pipeline — CIE is stage 2. */
export const CREATIVE_INTELLIGENCE_KERNEL_STAGES: KernelStage[] = [
  { id: 'founder-intent', label: 'Founder Intent™', order: 1 },
  { id: 'creative-intelligence', label: 'Creative Intelligence Engine™', order: 2 },
  { id: 'company-genome', label: 'Company Genome™', order: 3 },
  { id: 'prompt-composer', label: 'Prompt Composer™', order: 4 },
  { id: 'scene-planner', label: 'Scene Planner™', order: 5 },
  { id: 'asset-registry', label: 'Asset Registry™', order: 6 },
  { id: 'provider-optimizer', label: 'Provider Optimizer™', order: 7 },
  { id: 'generation-manager', label: 'Generation Manager™', order: 8 },
  { id: 'approval-queue', label: 'Approval Queue™', order: 9 },
  { id: 'scene-assembly', label: 'Scene Assembly™', order: 10 },
  { id: 'workspace-runtime', label: 'Workspace Runtime™', order: 11 },
];

export type CreativeIntelligenceGateResult =
  | { ok: true; proceed: true; decision: CreativeIntelligenceDecision }
  | { ok: true; proceed: false; decision: CreativeIntelligenceDecision; reason: string }
  | { ok: false; error: string; code?: string };

export function shouldProceedToGeneration(
  decision: CreativeIntelligenceDecision,
  options?: { forceGenerate?: boolean; cieDecisionId?: string }
): boolean {
  if (options?.forceGenerate) return true;
  if (options?.cieDecisionId && options.cieDecisionId === decision.id) return decision.should_generate;
  if (!decision.should_generate) return false;
  if (decision.recommended_strategy === 'reuse_existing' && decision.assets_missing.length === 0) {
    return false;
  }
  return true;
}

export function formatDecisionForFounder(decision: CreativeIntelligenceDecision): string {
  const lines = [...decision.founder_messages];
  lines.push(
    `Estimated cost: $${decision.cost_intelligence.estimated_total_project_cost.toFixed(2)} · ~${Math.ceil(decision.cost_intelligence.estimated_duration_seconds / 60)} min`
  );
  return lines.join('\n');
}

/**
 * Client-side kernel gate — calls server CIE before generation.
 * Returns decision + whether downstream generation should proceed.
 */
export async function runCreativeIntelligenceGate(
  intent: FounderIntentInput,
  evaluateFn: (intent: FounderIntentInput) => Promise<{ ok: boolean; decision?: CreativeIntelligenceDecision; error?: string; code?: string }>,
  options?: { forceGenerate?: boolean; cieDecisionId?: string }
): Promise<CreativeIntelligenceGateResult> {
  const result = await evaluateFn(intent);
  if (!result.ok || !result.decision) {
    return { ok: false, error: result.error ?? 'Creative Intelligence evaluation failed', code: result.code };
  }

  const decision = result.decision;
  const proceed = shouldProceedToGeneration(decision, options);

  if (!proceed) {
    return {
      ok: true,
      proceed: false,
      decision,
      reason:
        decision.recommended_strategy === 'reuse_existing'
          ? 'Existing approved assets cover this request — no tokens required.'
          : 'Creative Intelligence recommends review before generation.',
    };
  }

  return { ok: true, proceed: true, decision };
}
