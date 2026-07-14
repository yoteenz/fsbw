import type { StudioWorldIconProviderKind } from './StudioWorldIconDefinition';
import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';

export type IconLoadRequest = {
  icon: StudioWorldIconDefinition;
  assetPath: string | null;
  provider: StudioWorldIconProviderKind | string;
  sizePx?: number;
};

export type IconLoadResult = {
  src: string | null;
  provider: string;
  cached: boolean;
};

export type StudioWorldIconLoaderBackend = (request: IconLoadRequest) => IconLoadResult | Promise<IconLoadResult>;

let loaderBackend: StudioWorldIconLoaderBackend | null = null;

export function setStudioWorldIconLoaderBackend(backend: StudioWorldIconLoaderBackend): void {
  loaderBackend = backend;
}

export async function loadIconAsset(request: IconLoadRequest): Promise<IconLoadResult> {
  if (!loaderBackend) {
    return { src: request.assetPath, provider: request.provider, cached: false };
  }
  const result = loaderBackend(request);
  return result instanceof Promise ? result : Promise.resolve(result);
}
