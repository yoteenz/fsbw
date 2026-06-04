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

export const LOUNGE_TV_GLASS_NAV_FONT = loungeTvGlassCqw(2.85, 7, 11);
export const LOUNGE_TV_GLASS_SIDEBAR_FONT = loungeTvGlassCqw(2.85, 7, 11);
export const LOUNGE_TV_GLASS_THUMB_FONT = loungeTvGlassCqw(2.55, 7, 10);
export const LOUNGE_TV_GLASS_SIDEBAR_WIDTH = '23.5cqw';
export const LOUNGE_TV_GLASS_PADDING_X = '5.5cqw';
export const LOUNGE_TV_GLASS_PADDING_Y = '3.5cqw';
export const LOUNGE_TV_GLASS_CLOSE_SIZE = loungeTvGlassCqw(5.5, 18, 26);
export const LOUNGE_TV_GLASS_CLOSE_ICON_SIZE = loungeTvGlassCqw(3.2, 10, 14);
