import type { CSSProperties } from 'react';

/** Inner horizontal row for similar / recently viewed (4 cells in 200% width). */
export function marbleStripScrollRowStyle(scrollPx: number): CSSProperties {
  return {
    display: 'flex',
    gap: 0,
    alignItems: 'stretch',
    transform: `translateX(${scrollPx}px)`,
    transition: 'none',
    width: '200%',
    overflow: 'visible',
  };
}

/**
 * One product column: exactly 1/4 of the 200%-wide row (= half the viewport per cell when two show).
 * Use flex-grow distribution (`1 1 0`) instead of `0 0 25%` so % flex-basis does not resolve too small
 * against a %%-width row on mobile WebKit (cells stayed narrow; center line correct but sides inset).
 */
export const marbleStripCellOuter: CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
  overflow: 'visible',
};

/** Inner band: same padding/centering as `products/page.tsx` UNITS cells. 2D: shift thumb + copy + stars up together. */
const marbleStripCellBandBase: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
  padding: '5px 12px 4px 12px',
};

export function marbleStripCellBand(is3D: boolean): CSSProperties {
  if (is3D) return { ...marbleStripCellBandBase, overflow: 'visible' };
  return { ...marbleStripCellBandBase, transform: 'translateY(-10px)' };
}

/** Title + price + stars column. 3D: extra space under the stars via column padding only (2D uses star row marginBottom). */
export function marbleStripTextColStrip(is3D: boolean): CSSProperties {
  return {
    ...marbleStripTextCol,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    flexShrink: 0,
    overflow: 'visible',
    paddingBottom: is3D ? '15px' : 0,
  };
}

/** Star row under price — 2D: marginBottom 5px below stars. 3D: spacing comes from marbleStripTextColStrip paddingBottom; keep this row flush. */
export function marbleStripStarsRowStyle(is3D: boolean): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2px',
    marginTop: '2px',
    boxSizing: 'border-box',
    flexShrink: 0,
    ...(is3D
      ? { paddingBottom: 0, marginBottom: 0, paddingTop: 0 }
      : { marginBottom: '5px', paddingBottom: 0, paddingTop: 0 }),
  };
}

/** Horizontal clip only: `overflow-x: hidden` forces `overflow-y` to clip too, eating star-row padding in 3D. */
export const marbleStripViewportStyle: CSSProperties = {
  overflowX: 'clip',
  overflowY: 'visible',
  width: '100%',
  position: 'relative',
  maxWidth: '100%',
};

/** Fixed-height box in 3D so mixed JPG/PNG assets align; 2D uses natural thumb height. */
export function marbleStripThumbWrap(is3D: boolean): CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
    minHeight: is3D ? 136 : undefined,
  };
}

/** 2D: same relative width as home/shop mannequin. 3D: uniform max box + contain. */
export function marbleStripThumbImg(is3D: boolean): CSSProperties {
  return is3D
    ? {
        display: 'block',
        margin: 0,
        maxWidth: '90%',
        maxHeight: '136px',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
      }
    : {
        display: 'block',
        margin: 0,
        width: '79.2%',
        height: 'auto',
        maxWidth: '100%',
      };
}

export const marbleStripTextCol: CSSProperties = {
  width: '100%',
  textAlign: 'center',
  boxSizing: 'border-box',
};

/** Class for similar / recently viewed black price — +2px top in index.css (beats inline margin shorthand). */
export const MARBLE_STRIP_PRODUCT_PRICE_CLASS = 'marble-strip-product-price';

/** Default black price line styles for marble strips (margin top applied via class). */
export function marbleStripProductPriceStyle(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
    fontSize: '12px',
    color: 'black',
    textTransform: 'uppercase',
    margin: '0 0 5px 0',
    fontWeight: '500',
    lineHeight: '0.84',
    ...extra,
  };
}

/**
 * Nav row: full width of the backdrop card. Side arrows are `position: absolute` (see
 * `marbleStripNavArrowStyle`) so they do not steal main-axis space — the middle column
 * spans edge-to-edge like the blue-outline reference.
 */
export const marbleStripNavRowStyle: CSSProperties = {
  display: 'flex',
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: 0,
  overflow: 'visible',
};

/** Viewport column — sole in-flow flex child; fills 100% when arrows are out of flow. */
export const marbleStripNavMiddleColStyle: CSSProperties = {
  flex: '1 1 0',
  width: '100%',
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
};

/** Carousel arrows overlaid on the left/right edges of the nav row (above strip content). */
export function marbleStripNavArrowStyle(side: 'left' | 'right', is3D: boolean): CSSProperties {
  const vertUp = is3D ? 26 : 10;
  const x = side === 'left' ? 10 : -10;
  return {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50px',
    minWidth: '28px',
    position: 'absolute',
    top: '50%',
    left: side === 'left' ? 0 : undefined,
    right: side === 'right' ? 0 : undefined,
    zIndex: 4,
    transform: `translateX(${x}px) translateY(calc(-50% - ${vertUp}px))`,
  };
}
