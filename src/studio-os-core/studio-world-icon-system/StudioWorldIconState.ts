/** Studio World Icon System — icon lifecycle states (procedural rendering; one certified asset). */
export const STUDIO_WORLD_ICON_STATES = [
  'default',
  'hover',
  'active',
  'focused',
  'pressed',
  'selected',
  'disabled',
  'locked',
  'generating',
  'loading',
  'success',
  'warning',
  'error',
  'approved',
  'rejected',
  'premium',
  'new',
  'favorite',
  'pinned',
  'ai',
  'live',
  'syncing',
  'offline',
  'archived',
  'beta',
  'experimental',
  'future',
] as const;

export type StudioWorldIconState = (typeof STUDIO_WORLD_ICON_STATES)[number];

export type StudioWorldIconStateAssets = Partial<
  Record<StudioWorldIconState, { svgPath?: string | null; pngPath?: string | null; provider?: string }>
>;
