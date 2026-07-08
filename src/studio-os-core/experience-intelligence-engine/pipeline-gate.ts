import type { ExperienceIntelligenceGateContext, ExperienceIntelligenceGateResult } from './types';
import { runExperienceIntelligenceGate } from './evaluator';

/** After Architecture Auditor™ — before Quality Inspector™ */
export async function gateAfterArchitectureAudit(
  context: Omit<ExperienceIntelligenceGateContext, 'kind'>
): Promise<ExperienceIntelligenceGateResult> {
  return runExperienceIntelligenceGate({ ...context, kind: 'scene' });
}

export function gateDestinationExperience(
  context: Omit<ExperienceIntelligenceGateContext, 'kind'> & { route: string }
): ExperienceIntelligenceGateResult {
  return runExperienceIntelligenceGate({ ...context, kind: 'destination' });
}
