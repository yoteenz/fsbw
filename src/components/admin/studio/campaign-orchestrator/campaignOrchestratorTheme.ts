import type { CSSProperties } from 'react';

export const CO_VISUAL = {
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

export const coPanelStyle: CSSProperties = {
  background: CO_VISUAL.glass,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: CO_VISUAL.border,
};

export const coSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: CO_VISUAL.black,
  letterSpacing: '0.06em',
  margin: '0 0 8px 0',
};

export const coCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: CO_VISUAL.gray,
  lineHeight: 1.5,
};

export const coActionBtn: CSSProperties = {
  border: CO_VISUAL.borderStrong,
  color: CO_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '9px',
  textTransform: 'uppercase',
  padding: '6px 10px',
  cursor: 'pointer',
};

export const coInputStyle: CSSProperties = {
  borderWidth: '1.3px',
  borderColor: CO_VISUAL.black,
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  padding: '6px 8px',
  width: '100%',
};
