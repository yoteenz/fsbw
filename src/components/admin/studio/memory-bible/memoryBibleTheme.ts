import type { CSSProperties } from 'react';

/** Memory Bible — shared admin styling (matches Knowledge Hub / Photography Bible). */
export const MB_VISUAL = {
  red: '#EB1C24',
  black: '#111111',
  gray: '#808080',
  pass: '#16A34A',
  border: '1.3px solid #000000',
} as const;

export const mbCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: MB_VISUAL.gray,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase',
};

export const mbSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: MB_VISUAL.black,
  margin: '0 0 6px',
  letterSpacing: '0.04em',
};

export const mbPanelStyle: CSSProperties = {
  border: MB_VISUAL.border,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(8px)',
};

export const mbActionBtn: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  border: MB_VISUAL.border,
  background: '#fff',
  padding: '6px 10px',
  cursor: 'pointer',
  textTransform: 'uppercase',
};
