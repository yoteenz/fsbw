/**
 * CIE enforcement on material-generation paths (Phase 1 stub).
 * CIE proposes gates — Production Authorization is the manufacturing contract.
 */

import type { AssetIntent, GovernedGenerationRequest } from './types';

export type CieEnforcementResult = { ok: true } | { ok: false; code: string; error: string };

export function enforceCieOnMaterialPath(request: GovernedGenerationRequest): CieEnforcementResult {
  const outputClass = request.assetIntent.outputClass;
  if (outputClass !== 'material') {
    return { ok: true };
  }
  if (request.skipCie) {
    return {
      ok: false,
      code: 'CIE_SKIP_FORBIDDEN',
      error: 'skipCie is forbidden on material generation paths',
    };
  }
  if (request.forceGenerate) {
    return {
      ok: false,
      code: 'CIE_FORCE_FORBIDDEN',
      error: 'forceGenerate is forbidden on material generation paths',
    };
  }
  return { ok: true };
}

export function classifyOutputClass(intent: Pick<AssetIntent, 'outputClass'>): AssetIntent['outputClass'] {
  return intent.outputClass;
}

export function isMaterialOutputClass(outputClass: AssetIntent['outputClass']): boolean {
  return outputClass === 'material';
}
