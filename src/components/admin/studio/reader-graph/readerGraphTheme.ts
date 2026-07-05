import type { CSSProperties } from 'react';

export const RG = {
  accent: '#0F172A',
  rose: '#E11D48',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const rgPanel: CSSProperties = {
  background: RG.panelBg,
  border: `1px solid ${RG.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const rgDarkHeader: CSSProperties = {
  background: RG.accent,
  border: `1px solid ${RG.accent}`,
  color: '#F8FAFC',
};

export const rgSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: RG.accent,
  margin: '0 0 8px 0',
};

export const rgLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: RG.gray,
  lineHeight: 1.45,
};

export const rgValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: RG.rose,
};

export const rgLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: RG.rose,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return RG.green;
  if (pct >= 70) return RG.rose;
  if (pct >= 55) return RG.slate;
  return RG.red;
}

export const READER_GRAPH_STYLES = `
  .reader-graph-root { font-family: "Futura PT Book", sans-serif; }
`;
