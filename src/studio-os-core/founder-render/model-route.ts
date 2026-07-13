import { resolveModelRoutingDecision } from '../creative-production/model-routing-engine';
import { FOUNDER_RENDER_ARTIFACT_INTENT } from './contract';

export const FOUNDER_RENDER_ROUTE_ID = 'nano-banana-pro-founder-full-room';

export type FounderRenderModelRoute = {
  routeId: typeof FOUNDER_RENDER_ROUTE_ID;
  provider: 'fal';
  providerModel: string;
  generationMode: 'image-to-image';
  aspectRatio: '16:9' | '21:9';
  outputFormat: 'png';
  outputResolution: '4K';
  referencePolicy: 'brand-material-references-only';
  artifactIntent: typeof FOUNDER_RENDER_ARTIFACT_INTENT;
  promptVersion: string;
  promptBuilderId: string;
};

/** Derived from ModelRoutingEngine™ — not hardcoded. */
export function resolveFounderRenderModel(aspectRatio: '16:9' | '21:9' = '16:9'): string {
  void aspectRatio;
  return resolveFounderRenderModelRoute(aspectRatio).providerModel;
}

/** @deprecated Use resolveFounderRenderModelRoute().providerModel — kept for test compatibility. */
export const FOUNDER_RENDER_MODEL = resolveFounderRenderModel();

export function resolveFounderRenderModelRoute(aspectRatio: '16:9' | '21:9' = '16:9'): FounderRenderModelRoute {
  const decision = resolveModelRoutingDecision({
    artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    surface: 'founder-render',
  });

  return {
    routeId: FOUNDER_RENDER_ROUTE_ID,
    provider: 'fal',
    providerModel: decision.providerModel,
    generationMode: 'image-to-image',
    aspectRatio,
    outputFormat: 'png',
    outputResolution: '4K',
    referencePolicy: 'brand-material-references-only',
    artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    promptVersion: decision.promptVersion,
    promptBuilderId: decision.promptBuilderId,
  };
}
