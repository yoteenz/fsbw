import type { CSSProperties } from 'react';

export const EAD_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.78)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  divider: '1px solid #e5e7eb',
  pass: '#16A34A',
  warn: '#D97706',
} as const;

export const eadPanelStyle: CSSProperties = {
  background: EAD_VISUAL.glass,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: EAD_VISUAL.border,
};

export const eadSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: EAD_VISUAL.black,
  letterSpacing: '0.06em',
  margin: '0 0 8px 0',
};

export const eadCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: EAD_VISUAL.gray,
  lineHeight: 1.5,
};

export const eadSourceTag = (source: string): CSSProperties => ({
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  color: source === 'estimate' ? EAD_VISUAL.warn : EAD_VISUAL.gray,
  textTransform: 'uppercase',
});

export const eadActionBtn: CSSProperties = {
  border: EAD_VISUAL.borderStrong,
  color: EAD_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '9px',
  textTransform: 'uppercase',
  padding: '6px 10px',
  cursor: 'pointer',
};
