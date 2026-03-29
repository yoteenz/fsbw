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

/** One product column: quarter of strip, matches home/shop UNITS flex basis. */
export const marbleStripCellOuter: CSSProperties = {
  flex: '0 0 25%',
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
    paddingBottom: is3D ? '10px' : 0,
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

/** Flex row: arrows + strip. overflow visible so nav arrows are not clipped. */
export const marbleStripNavRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  overflow: 'visible',
};

/** Viewport column between nav arrows — minWidth 0 prevents the 200%-wide strip from forcing the row wider than the container. */
export const marbleStripNavMiddleColStyle: CSSProperties = {
  flex: '1',
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
};

/** Similar / recently carousel arrows — flexShrink 0 so the strip never squeezes them to zero width. */
export function marbleStripNavArrowStyle(side: 'left' | 'right', is3D: boolean): CSSProperties {
  const y = is3D ? '-26px' : '-10px';
  const x = side === 'left' ? '10px' : '-10px';
  return {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50px',
    flexShrink: 0,
    minWidth: '28px',
    position: 'relative',
    zIndex: 3,
    transform: `translateX(${x}) translateY(${y})`,
  };
}
