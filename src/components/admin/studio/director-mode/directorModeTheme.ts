/** Director Mode visual tokens — luxury broadcast control room. */
import type { CSSProperties } from 'react';

export const DM_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.78)',
  glassDark: 'rgba(0,0,0,0.04)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  divider: '1px solid #e5e7eb',
} as const;

export const dmPanelStyle: CSSProperties = {
  background: DM_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: DM_VISUAL.border,
};

export const dmActionBtnStyle: CSSProperties = {
  border: DM_VISUAL.borderStrong,
  color: DM_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '9px',
  textTransform: 'uppercase',
  padding: '6px 10px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const dmSectionTitleStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: DM_VISUAL.black,
  margin: '0 0 6px 0',
  letterSpacing: '0.06em',
};

export const dmCaptionStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: DM_VISUAL.gray,
  lineHeight: 1.45,
};

export const dmScriptStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: DM_VISUAL.black,
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
};
