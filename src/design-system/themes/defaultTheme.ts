import { FDS_ANIMATION_CSS_VARS } from '../animations/tokens';
import { FDS_CSS_VARS } from '../colors/css-variables';
import { FDS_GLASS_CSS_VARS } from '../glass/tokens';
import { FDS_RADIUS_CSS_VARS } from '../radius/scale';
import { FDS_SHADOW_CSS_VARS } from '../shadows/scale';
import { FDS_SPACING_CSS_VARS } from '../spacing/scale';
import { FDS_TYPOGRAPHY_CSS_VARS } from '../typography/presets';

export const FDS_ALL_CSS_VARS = {
  ...FDS_CSS_VARS,
  ...FDS_SPACING_CSS_VARS,
  ...FDS_RADIUS_CSS_VARS,
  ...FDS_SHADOW_CSS_VARS,
  ...FDS_GLASS_CSS_VARS,
  ...FDS_ANIMATION_CSS_VARS,
  ...FDS_TYPOGRAPHY_CSS_VARS,
} as const;

export const FDS_BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  'ultra-wide': 1536,
} as const;

export type FdsTheme = {
  id: 'default';
  cssVars: typeof FDS_ALL_CSS_VARS;
  breakpoints: typeof FDS_BREAKPOINTS;
};

export const FDS_DEFAULT_THEME: FdsTheme = {
  id: 'default',
  cssVars: FDS_ALL_CSS_VARS,
  breakpoints: FDS_BREAKPOINTS,
};
