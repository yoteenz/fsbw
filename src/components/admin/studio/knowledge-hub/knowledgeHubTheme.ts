import type { CSSProperties } from 'react';

export const KH_VISUAL = {
  red: '#EB1C24',
  black: '#111111',
  gray: '#808080',
  pass: '#16A34A',
  warn: '#CA8A04',
  border: '1.3px solid #000000',
} as const;

export const khCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: KH_VISUAL.gray,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase',
};

export const khSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: KH_VISUAL.black,
  margin: '0 0 6px',
  letterSpacing: '0.04em',
};

export const khPanelStyle: CSSProperties = {
  border: KH_VISUAL.border,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(8px)',
};

export const khActionBtn: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  border: KH_VISUAL.border,
  background: '#fff',
  padding: '6px 10px',
  cursor: 'pointer',
  textTransform: 'uppercase',
};
