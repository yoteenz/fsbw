import type { CSSProperties } from 'react';

export const CM = {
  accent: '#0F172A',
  blue: '#2563EB',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const cmPanel: CSSProperties = {
  background: CM.panelBg,
  border: `1px solid ${CM.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const cmDarkHeader: CSSProperties = {
  background: CM.accent,
  border: `1px solid ${CM.accent}`,
  color: '#F8FAFC',
};

export const cmSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CM.accent,
  margin: '0 0 8px 0',
};

export const cmLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CM.gray,
  lineHeight: 1.45,
};

export const cmValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CM.blue,
};

export const cmLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CM.blue,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return CM.green;
  if (pct >= 70) return CM.blue;
  if (pct >= 55) return CM.slate;
  return CM.red;
}

export const CREATOR_MARKETPLACE_STYLES = `
  .creator-marketplace-root { font-family: "Futura PT Book", sans-serif; }
`;
