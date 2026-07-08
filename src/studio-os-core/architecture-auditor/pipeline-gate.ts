import type { ArchitectureAuditorGateContext, ArchitectureAuditorGateResult } from './types';
import { runArchitectureAuditorGate } from './auditor';

/**
 * Pipeline position: after Scene Assembly™, before Quality Inspector™.
 * Blocks generation deploy when critical architectural violations exist.
 */
export async function gateAfterSceneAssembly(
  context: Omit<ArchitectureAuditorGateContext, 'kind'>
): Promise<ArchitectureAuditorGateResult> {
  return runArchitectureAuditorGate({ ...context, kind: 'scene' });
}

export async function gateBeforeDeploy(
  context: Omit<ArchitectureAuditorGateContext, 'kind'>
): Promise<ArchitectureAuditorGateResult> {
  return runArchitectureAuditorGate({ ...context, kind: 'generation' });
}

export function gateRouteRegistration(
  context: Omit<ArchitectureAuditorGateContext, 'kind'> & { route: string }
): ArchitectureAuditorGateResult {
  return runArchitectureAuditorGate({ ...context, kind: 'route' });
}
