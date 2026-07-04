/** Production Builder visual tokens — matches Asset Director / Frontal Slayer workspace. */
import type { CSSProperties } from 'react';

export const PB_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.72)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  divider: '1px solid #e5e7eb',
  marble: 'url(/assets/marble-half.png)',
} as const;

export const pbPanelStyle: CSSProperties = {
  background: PB_VISUAL.glass,
  backdropFilter: 'blur(8px)',
  border: PB_VISUAL.border,
};

export const pbActionBtnStyle: CSSProperties = {
  border: PB_VISUAL.borderStrong,
  color: PB_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '9px',
  textTransform: 'uppercase',
  padding: '6px 8px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const pbSectionTitleStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: PB_VISUAL.black,
  margin: '0 0 6px 0',
  letterSpacing: '0.04em',
};

export const pbCaptionStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: PB_VISUAL.gray,
  lineHeight: 1.45,
};

export const pbLabelStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  color: PB_VISUAL.gray,
  textTransform: 'uppercase',
};

export const pbValueStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: PB_VISUAL.black,
};
