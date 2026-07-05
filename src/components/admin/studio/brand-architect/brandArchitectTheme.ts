import type { CSSProperties } from 'react';

export const BA = {
  accent: '#0F172A',
  rose: '#BE185D',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const baPanel: CSSProperties = {
  background: BA.panelBg,
  border: `1px solid ${BA.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const baDarkHeader: CSSProperties = {
  background: BA.accent,
  border: `1px solid ${BA.accent}`,
  color: '#F8FAFC',
};

export const baSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: BA.accent,
  margin: '0 0 8px 0',
};

export const baLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: BA.gray,
  lineHeight: 1.45,
};

export const baValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: BA.rose,
};

export const baLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: BA.rose,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return BA.green;
  if (pct >= 70) return BA.rose;
  if (pct >= 55) return BA.slate;
  return BA.red;
}

export const BRAND_ARCHITECT_STYLES = `
  .brand-architect-root { font-family: "Futura PT Book", sans-serif; }
`;
