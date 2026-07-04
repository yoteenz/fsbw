import type { CSSProperties } from 'react';

/** Shared visual tokens for Asset Director (Milestone 14). */
export const AD_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.72)',
  glassBlur: 'backdrop-blur-sm',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  divider: '1px solid #e5e7eb',
} as const;

export const adActionBtnStyle: CSSProperties = {
  border: AD_VISUAL.borderStrong,
  color: AD_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '9px',
  textTransform: 'uppercase',
  padding: '6px 8px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const adSectionTitleStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  color: AD_VISUAL.black,
  margin: '0 0 8px 0',
};

export const adCaptionStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: AD_VISUAL.gray,
  lineHeight: 1.45,
};
