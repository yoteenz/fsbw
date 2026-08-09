import type React from 'react';

/** Scene-locked TV glass — typography and chrome scale with the mapped screen box. */
export const LOUNGE_TV_GLASS_CONTAINER_STYLE: React.CSSProperties = {
  containerType: 'size',
  containerName: 'loungeTvGlass',
};

/** Fluid type/icon size inside {@link LOUNGE_TV_GLASS_CONTAINER_STYLE}. */
export function loungeTvGlassCqw(cqw: number, minPx: number, maxPx: number): string {
  return `clamp(${minPx}px, ${cqw}cqw, ${maxPx}px)`;
}

export const LOUNGE_TV_GLASS_NAV_FONT = loungeTvGlassCqw(3.2, 8.5, 13);
export const LOUNGE_TV_GLASS_SIDEBAR_FONT = loungeTvGlassCqw(3, 8, 12);
export const LOUNGE_TV_GLASS_THUMB_FONT = loungeTvGlassCqw(2.8, 7.5, 11);
export const LOUNGE_TV_GLASS_SIDEBAR_WIDTH = '23.5cqw';
export const LOUNGE_TV_GLASS_PADDING_X = '4.5cqw';
export const LOUNGE_TV_GLASS_PADDING_Y = '3cqw';
export const LOUNGE_TV_GLASS_CLOSE_SIZE = loungeTvGlassCqw(5.5, 18, 26);
export const LOUNGE_TV_GLASS_CLOSE_ICON_SIZE = loungeTvGlassCqw(3.2, 10, 14);

/** Landscape rail card width — ~3 cards visible at TV scale. */
export const LOUNGE_TV_RAIL_CARD_WIDTH = loungeTvGlassCqw(32, 72, 115);
