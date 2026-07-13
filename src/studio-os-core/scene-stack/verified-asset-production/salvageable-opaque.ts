import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';
import { getIsolatedLayerContract, isIsolatedObjectLayer } from '../isolated-layer-contract';
import type { SceneStackLayerId } from '../types';

/**
 * Opaque provider plates within isolated-object coverage bounds may be salvageable via
 * governed background removal — defer hard rejection until after extraction attempt.
 */
export function isSalvageableOpaqueStudioPlate(input: {
  layerId: SceneStackLayerId;
  metrics: Pick<
    IsolatedLayerImageMetrics,
    | 'alphaChannelPresent'
    | 'frameCoverage'
    | 'transparentSides'
    | 'fullWidthEdgeContact'
    | 'fullHeightEdgeContact'
    | 'bakedCheckerboardSuspect'
  >;
  fullSceneLikelihood: number;
  shellSimilarity?: number | null;
}): boolean {
  if (!isIsolatedObjectLayer(input.layerId)) return false;
  if (input.metrics.alphaChannelPresent) return false;
  if (input.metrics.bakedCheckerboardSuspect) return false;

  const contract = getIsolatedLayerContract(input.layerId);
  const { metrics, fullSceneLikelihood, shellSimilarity = null } = input;

  if (fullSceneLikelihood >= 0.72) return false;
  if (shellSimilarity !== null && shellSimilarity > 0.82) return false;
  if (metrics.frameCoverage > contract.maximumFrameCoverage) return false;
  if (metrics.frameCoverage < 0.1) return false;

  if (metrics.fullWidthEdgeContact && metrics.fullHeightEdgeContact && metrics.transparentSides < 2) {
    return false;
  }

  return true;
}
