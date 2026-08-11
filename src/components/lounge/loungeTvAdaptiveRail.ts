import { loungeTvGlassCqw } from './loungeTvResponsive';

export type LoungeTvRailDisplayMode = 'auto' | 'feature' | 'pair' | 'rail';

export type LoungeTvRailLayoutMode = 'feature' | 'pair' | 'rail';

export function resolveRailLayoutMode(
  itemCount: number,
  displayMode: LoungeTvRailDisplayMode = 'auto',
): LoungeTvRailLayoutMode {
  if (displayMode === 'feature') return 'feature';
  if (displayMode === 'pair') return 'pair';
  if (displayMode === 'rail') return 'rail';
  if (itemCount <= 1) return 'feature';
  if (itemCount === 2) return 'pair';
  return 'rail';
}

/** Standard horizontal rail card — ~2.5–3 visible at narrow TV width. */
export const LOUNGE_TV_RAIL_CARD_WIDTH = loungeTvGlassCqw(38, 88, 128);

/** Single feature card — uses most of the rail width. */
export const LOUNGE_TV_FEATURE_CARD_WIDTH = '100%';

/** Pair layout — two large cards side by side. */
export const LOUNGE_TV_PAIR_CARD_WIDTH = loungeTvGlassCqw(46, 92, 140);

/** Portrait short-form rail — ~2 cards + partial peek at narrow TV width. */
export const LOUNGE_TV_PORTRAIT_RAIL_CARD_WIDTH = loungeTvGlassCqw(42, 46, 52);

/** Single portrait feature — art column in sparse short-form layout. */
export const LOUNGE_TV_PORTRAIT_FEATURE_ART_WIDTH = loungeTvGlassCqw(36, 42, 48);

/** Care lesson horizontal rail — ~2 landscape cards at narrow TV width. */
export const LOUNGE_TV_CARE_RAIL_CARD_WIDTH = LOUNGE_TV_PAIR_CARD_WIDTH;
