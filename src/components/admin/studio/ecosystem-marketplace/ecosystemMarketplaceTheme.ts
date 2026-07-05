import type { CSSProperties } from 'react';

export const EM = {
  accent: '#0F172A',
  indigo: '#4F46E5',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const emPanel: CSSProperties = {
  background: EM.panelBg,
  border: `1px solid ${EM.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const emDarkHeader: CSSProperties = {
  background: EM.accent,
  border: `1px solid ${EM.accent}`,
  color: '#F8FAFC',
};

export const emSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: EM.accent,
  margin: '0 0 8px 0',
};

export const emLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: EM.gray,
  lineHeight: 1.45,
};

export const emValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: EM.indigo,
};

export const emLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EM.indigo,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return EM.green;
  if (pct >= 70) return EM.indigo;
  if (pct >= 55) return EM.slate;
  return EM.red;
}

export const ECOSYSTEM_MARKETPLACE_STYLES = `
  .ecosystem-marketplace-root { font-family: "Futura PT Book", sans-serif; }
`;
