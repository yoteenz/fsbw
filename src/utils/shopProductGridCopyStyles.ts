import type { CSSProperties } from 'react';

/** Text column under product thumb — matches `/shop/units` (`products/units/page.tsx`). */
export const shopProductGridTextColStyle: CSSProperties = {
  width: '100%',
  textAlign: 'center',
  boxSizing: 'border-box',
};

/** Home/shop marble cell inner band (UNITS + BCF) — keeps thumb-to-copy rhythm identical. */
export const shopProductGridCellBandStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
  padding: '5px 12px 4px 12px',
  transform: 'translateY(-14px)',
};

/** Thumb row above product copy on home/shop grids. */
export const shopProductGridThumbWrapStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '5px',
};

/** Product name (Covered By Your Grace). */
export function shopProductGridNameStyle(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
    fontSize: '18px',
    color: 'black',
    textTransform: 'uppercase',
    margin: 0,
    fontWeight: '500',
    lineHeight: 1.05,
    minHeight: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...extra,
  };
}

/** Red RAW / subtitle line (Futura PT Medium). */
export function shopProductGridRedLineStyle(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: '"Futura PT Medium"',
    fontSize: '10px',
    color: '#EB1C24',
    textTransform: 'uppercase',
    margin: '2px 0 5px 0',
    fontWeight: '500',
    lineHeight: '0.84',
    minHeight: '12px',
    transform: 'translateY(1px)',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box',
    ...extra,
  };
}

/** Black price line under red subtitle. */
export function shopProductGridPriceStyle(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: '"Futura PT Medium"',
    fontSize: '12px',
    color: 'black',
    textTransform: 'uppercase',
    margin: '0 0 5px 0',
    fontWeight: '500',
    lineHeight: '0.84',
    transform: 'translateY(1px)',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
    ...extra,
  };
}

/** Cap-size row (units grids). */
export const shopProductGridCapSizeRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '14px',
  marginTop: '2px',
  transform: 'translateY(1px)',
  width: '100%',
};
