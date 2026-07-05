import type { CSSProperties } from 'react';

export const CME = {
  accent: '#0F172A',
  sky: '#0369A1',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const cmePanel: CSSProperties = {
  background: CME.panelBg,
  border: `1px solid ${CME.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const cmeDarkHeader: CSSProperties = {
  background: CME.accent,
  border: `1px solid ${CME.accent}`,
  color: '#F8FAFC',
};

export const cmeSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CME.accent,
  margin: '0 0 8px 0',
};

export const cmeLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CME.gray,
  lineHeight: 1.45,
};

export const cmeValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CME.sky,
};

export const cmeLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CME.sky,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return CME.green;
  if (pct >= 70) return CME.sky;
  if (pct >= 55) return CME.slate;
  return CME.red;
}

export const COMPANY_MATURITY_ENGINE_STYLES = `
  .company-maturity-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
