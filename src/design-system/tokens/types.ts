/** Frontal Slayer Design System (FDS) — shared types */

import type { CSSProperties, ReactNode } from 'react';

export type FdsSpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export type FdsRadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type FdsShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'panel' | 'glass' | 'elevated';

export type FdsGlassVariant =
  | 'card'
  | 'panel'
  | 'window'
  | 'drawer'
  | 'navigation'
  | 'modal'
  | 'sidebar'
  | 'tooltip'
  | 'badge'
  | 'chip';

export type FdsGlassElevation = 'flat' | 'raised' | 'floating' | 'modal';

export type FdsTypographyPreset =
  | 'display-xl'
  | 'display-large'
  | 'hero'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'body-large'
  | 'body'
  | 'caption'
  | 'label'
  | 'button'
  | 'navigation'
  | 'legal';

export type FdsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'glass'
  | 'luxury'
  | 'icon'
  | 'floating';

export type FdsCardVariant =
  | 'standard'
  | 'luxury'
  | 'glass'
  | 'product'
  | 'campaign'
  | 'analytics'
  | 'feature'
  | 'dashboard';

export type FdsPanelVariant =
  | 'floating-acrylic'
  | 'desktop'
  | 'lobby'
  | 'dashboard'
  | 'luxury-modal'
  | 'drawer'
  | 'info'
  | 'notification'
  | 'content';

export type FdsLayoutVariant =
  | 'desktop'
  | 'mobile'
  | 'full-screen'
  | 'split'
  | 'dashboard'
  | 'marketing'
  | 'landing'
  | 'immersive';

export type FdsBreakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'ultra-wide';

export type FdsBaseProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type FdsInteractiveProps = FdsBaseProps & {
  disabled?: boolean;
  loading?: boolean;
};
