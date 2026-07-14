import type { StudioWorldIconState } from './StudioWorldIconState';
import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';

export type ResolvedIconState = {
  state: StudioWorldIconState;
  assetPath: string | null;
  provider: string;
};

export function resolveIconState(
  icon: StudioWorldIconDefinition,
  state: StudioWorldIconState = 'default'
): ResolvedIconState {
  const stateAsset = icon.stateAssets[state];
  if (stateAsset?.pngPath || stateAsset?.svgPath) {
    return {
      state,
      assetPath: stateAsset.pngPath ?? stateAsset.svgPath ?? null,
      provider: stateAsset.provider ?? icon.provider,
    };
  }

  const fallback =
    state === 'disabled' ? icon.disabledAsset
    : state === 'active' || state === 'selected' ? icon.activeAsset ?? icon.defaultAsset
    : state === 'hover' || state === 'focused' ? icon.hoverAsset ?? icon.defaultAsset
    : icon.defaultAsset ?? icon.pngPath ?? icon.svgPath;

  return {
    state,
    assetPath: fallback,
    provider: icon.provider,
  };
}
