/** Studio World Icon System — icon lifecycle states (architecture; artwork optional per state). */
export const STUDIO_WORLD_ICON_STATES = [
  'default',
  'hover',
  'active',
  'focused',
  'selected',
  'pressed',
  'disabled',
  'loading',
  'generating',
  'approved',
  'rejected',
  'archived',
  'locked',
  'premium',
  'ai',
  'future',
] as const;

export type StudioWorldIconState = (typeof STUDIO_WORLD_ICON_STATES)[number];

export type StudioWorldIconStateAssets = Partial<
  Record<StudioWorldIconState, { svgPath?: string | null; pngPath?: string | null; provider?: string }>
>;
