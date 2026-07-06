import type { CSSProperties } from 'react';

/** Spacing and rhythm tokens — executive IA layer (no visual rebrand). */
export const EIA = {
  sectionGap: 20,
  sectionGapLarge: 28,
  cardPadding: 14,
  cardPaddingLarge: 18,
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.82)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  pass: '#16A34A',
  warn: '#CA8A04',
} as const;

export const eiaPanel: CSSProperties = {
  background: EIA.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: EIA.border,
};

export const eiaPanelLight: CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

export const eiaSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: EIA.black,
  letterSpacing: '0.06em',
  margin: '0 0 10px 0',
};

export const eiaCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: EIA.gray,
  lineHeight: 1.5,
};

export const eiaGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
  color: EIA.black,
};

export const eiaActionBtn: CSSProperties = {
  border: EIA.borderStrong,
  color: EIA.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '8px',
  textTransform: 'uppercase',
  padding: '5px 8px',
  cursor: 'pointer',
};

export const eiaPageRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: EIA.sectionGap,
};
