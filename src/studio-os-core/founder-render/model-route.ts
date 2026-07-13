import { SCENE_STACK_SHELL_FAL_MODEL } from '../creative-production/model-registry/routes';

export const FOUNDER_RENDER_ROUTE_ID = 'nano-banana-pro-founder-full-room';
export const FOUNDER_RENDER_MODEL = SCENE_STACK_SHELL_FAL_MODEL;

export type FounderRenderModelRoute = {
  routeId: typeof FOUNDER_RENDER_ROUTE_ID;
  provider: 'fal';
  providerModel: string;
  generationMode: 'image-to-image';
  aspectRatio: '16:9' | '21:9';
  outputFormat: 'png';
  outputResolution: '4K';
  referencePolicy: 'brand-material-references-only';
  artifactIntent: 'founder-full-room-preview';
};

export function resolveFounderRenderModelRoute(aspectRatio: '16:9' | '21:9' = '16:9'): FounderRenderModelRoute {
  return {
    routeId: FOUNDER_RENDER_ROUTE_ID,
    provider: 'fal',
    providerModel: FOUNDER_RENDER_MODEL,
    generationMode: 'image-to-image',
    aspectRatio,
    outputFormat: 'png',
    outputResolution: '4K',
    referencePolicy: 'brand-material-references-only',
    artifactIntent: 'founder-full-room-preview',
  };
}
