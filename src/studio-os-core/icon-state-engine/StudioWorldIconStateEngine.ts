import type { IconStateRenderInput, IconStateRenderOutput } from './types';
import { renderIconState } from './StudioWorldIconRenderer';
import { STUDIO_WORLD_ICON_STATES } from '../studio-world-icon-system/StudioWorldIconState';
import { STUDIO_WORLD_ICON_THEMES } from '../studio-world-icon-system/StudioWorldIconTheme';
import { ICON_STATE_DEVICES, ICON_ANIMATION_PRESETS } from './types';

export const ICON_STATE_ENGINE_VERSION = 'studio-world-icon-state-engine.v1' as const;

export type IconStateMatrixCell = {
  iconId: string;
  state: string;
  theme: string;
  sizePx: number;
  render: IconStateRenderOutput | null;
};

export type IconStateMatrix = {
  version: typeof ICON_STATE_ENGINE_VERSION;
  iconIds: string[];
  states: readonly string[];
  themes: readonly string[];
  sizes: number[];
  cells: IconStateMatrixCell[];
};

/** Orchestrates procedural multi-state rendering from one certified icon. */
export class StudioWorldIconStateEngine {
  readonly version = ICON_STATE_ENGINE_VERSION;

  render(input: IconStateRenderInput): IconStateRenderOutput | null {
    return renderIconState(input);
  }

  buildStateMatrix(
    iconIds: string[],
    options?: {
      states?: readonly string[];
      themes?: readonly string[];
      sizes?: number[];
      device?: IconStateRenderInput['device'];
      animated?: boolean;
    }
  ): IconStateMatrix {
    const states = options?.states ?? STUDIO_WORLD_ICON_STATES;
    const themes = options?.themes ?? STUDIO_WORLD_ICON_THEMES;
    const sizes = options?.sizes ?? [16, 24, 32];
    const cells: IconStateMatrixCell[] = [];

    for (const iconId of iconIds) {
      for (const state of states) {
        for (const theme of themes) {
          for (const sizePx of sizes) {
            const render = this.render({
              iconId,
              state: state as IconStateRenderInput['state'],
              theme: theme as IconStateRenderInput['theme'],
              sizePx,
              device: options?.device,
              animated: options?.animated ?? false,
            });
            cells.push({ iconId, state, theme, sizePx, render });
          }
        }
      }
    }

    return {
      version: ICON_STATE_ENGINE_VERSION,
      iconIds,
      states,
      themes,
      sizes,
      cells,
    };
  }
}

export const studioWorldIconStateEngine = new StudioWorldIconStateEngine();

export { STUDIO_WORLD_ICON_STATES, STUDIO_WORLD_ICON_THEMES, ICON_STATE_DEVICES, ICON_ANIMATION_PRESETS };
