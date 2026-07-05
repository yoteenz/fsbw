import type { CSSProperties } from 'react';

export const LDNA = {
  accent: '#0F172A',
  gold: '#CA8A04',
  red: '#EB1C24',
  green: '#16A34A',
  indigo: '#6366F1',
  purple: '#7C3AED',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.9)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const ldnaPanel: CSSProperties = {
  background: LDNA.panelBg,
  border: `1px solid ${LDNA.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const ldnaDarkHeader: CSSProperties = {
  background: LDNA.accent,
  border: `1px solid ${LDNA.accent}`,
  color: '#F8FAFC',
};

export const ldnaSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: LDNA.accent,
  margin: '0 0 8px 0',
};

export const ldnaLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: LDNA.gray,
  lineHeight: 1.45,
};

export const ldnaValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: LDNA.purple,
};

export const ldnaLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: LDNA.green,
  display: 'inline-block',
  marginRight: 4,
  animation: 'ldnaPulse 2s ease-in-out infinite',
};

export const LEADERSHIP_DNA_STYLES = `
@keyframes ldnaPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;

export function confidenceColor(pct: number): string {
  if (pct >= 85) return LDNA.green;
  if (pct >= 70) return LDNA.gold;
  return LDNA.red;
}

export function delegationColor(level: string): string {
  if (level.includes('fully')) return LDNA.green;
  if (level.includes('soft')) return LDNA.indigo;
  if (level.includes('chief')) return LDNA.gold;
  return LDNA.red;
}
