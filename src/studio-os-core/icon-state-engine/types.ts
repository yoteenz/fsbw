import type { StudioWorldIconState } from '../studio-world-icon-system/StudioWorldIconState';
import type { StudioWorldIconTheme } from '../studio-world-icon-system/StudioWorldIconTheme';

/** Procedural states — one certified asset, runtime interpretation. */
export type StudioWorldIconProceduralState = StudioWorldIconState;

export const ICON_STATE_DEVICES = ['desktop', 'tablet', 'mobile', 'tv', 'visionos'] as const;
export type IconStateDevice = (typeof ICON_STATE_DEVICES)[number];

export const ICON_ANIMATION_PRESETS = [
  'none',
  'fade',
  'pulse',
  'breathe',
  'energy-flow',
  'edge-trace',
  'sparkle',
  'illuminate',
  'material-shift',
  'soft-scale',
  'magnetic-snap',
] as const;
export type IconAnimationPreset = (typeof ICON_ANIMATION_PRESETS)[number];

export type IconMaterialId =
  | 'chrome'
  | 'glass'
  | 'glow'
  | 'reflection'
  | 'bloom'
  | 'shadow'
  | 'edge'
  | 'opacity'
  | 'refraction'
  | 'hologram'
  | 'crystal'
  | 'carbon';

export type IconInteractionContext = {
  hovered?: boolean;
  pressed?: boolean;
  focused?: boolean;
  selected?: boolean;
  keyboardFocus?: boolean;
};

export type IconStateRenderInput = {
  iconId: string;
  state?: StudioWorldIconProceduralState;
  theme?: StudioWorldIconTheme | 'dark' | 'light';
  device?: IconStateDevice;
  sizePx?: number;
  animated?: boolean;
  interaction?: IconInteractionContext;
  reducedMotion?: boolean;
  highContrast?: boolean;
};

export type IconStateCssVariables = Record<string, string | number>;

export type IconStateRenderOutput = {
  iconId: string;
  state: StudioWorldIconProceduralState;
  theme: StudioWorldIconTheme;
  device: IconStateDevice;
  sizePx: number;
  assetPath: string | null;
  provider: string;
  cssVariables: IconStateCssVariables;
  classNames: string[];
  animation: IconAnimationPreset;
  materials: IconMaterialId[];
  aria: {
    role?: string;
    label?: string;
    busy?: boolean;
    disabled?: boolean;
    hidden?: boolean;
  };
  dataAttributes: Record<string, string>;
  performance: {
    gpuAccelerated: boolean;
    willChange: string | null;
    repaintSafe: boolean;
  };
};
