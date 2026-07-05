/** Production Studio — luxury marble · glass · cinematic lighting. */
import type { CSSProperties } from 'react';

export const PS_VISUAL = {
  accent: '#B8860B',
  accentSoft: 'rgba(184,134,11,0.12)',
  champagne: '#C9A962',
  glass: 'rgba(255,255,255,0.78)',
  glassDeep: 'rgba(255,255,255,0.92)',
  border: '1.3px solid rgba(0,0,0,0.1)',
  borderStrong: '1.3px solid rgba(0,0,0,0.18)',
  cinematicGlow: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,248,235,0.9) 0%, rgba(255,255,255,0) 70%)',
  marble: 'url(/assets/marble-half.png)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  stageReady: '#059669',
  stageActive: '#B8860B',
  stagePending: '#94A3B8',
} as const;

export const psPanelStyle: CSSProperties = {
  background: PS_VISUAL.glass,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: PS_VISUAL.border,
  boxShadow: '0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
};

export const psCanvasStyle: CSSProperties = {
  ...psPanelStyle,
  background: PS_VISUAL.glassDeep,
  boxShadow: '0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
};

export const psSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  letterSpacing: '0.08em',
  color: PS_VISUAL.black,
  margin: '0 0 8px 0',
  textTransform: 'uppercase',
};

export const psLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  color: PS_VISUAL.gray,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export const psValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: PS_VISUAL.black,
  lineHeight: 1.45,
};

export const psGraceAccent: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: PS_VISUAL.accent,
  lineHeight: 1.1,
};

export const psQueueBtn = (active: boolean): CSSProperties => ({
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  textTransform: 'uppercase',
  padding: '4px 6px',
  border: active ? `1.3px solid ${PS_VISUAL.accent}` : PS_VISUAL.border,
  background: active ? PS_VISUAL.accentSoft : 'rgba(255,255,255,0.6)',
  color: active ? PS_VISUAL.accent : PS_VISUAL.gray,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const psOverrideInput: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  width: '100%',
  padding: '4px 6px',
  border: PS_VISUAL.border,
  background: 'rgba(255,255,255,0.9)',
  color: PS_VISUAL.black,
};
