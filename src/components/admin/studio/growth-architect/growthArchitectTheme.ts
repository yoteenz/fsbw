import type { CSSProperties } from 'react';

export const GA = {
  accent: '#0F172A',
  emerald: '#059669',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const gaPanel: CSSProperties = {
  background: GA.panelBg,
  border: `1px solid ${GA.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const gaDarkHeader: CSSProperties = {
  background: GA.accent,
  border: `1px solid ${GA.accent}`,
  color: '#F8FAFC',
};

export const gaSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: GA.accent,
  margin: '0 0 8px 0',
};

export const gaLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: GA.gray,
  lineHeight: 1.45,
};

export const gaValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: GA.emerald,
};

export const gaLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: GA.emerald,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return GA.green;
  if (pct >= 70) return GA.emerald;
  if (pct >= 55) return GA.slate;
  return GA.red;
}

export const GROWTH_ARCHITECT_STYLES = `
  .growth-architect-root { font-family: "Futura PT Book", sans-serif; }
`;
