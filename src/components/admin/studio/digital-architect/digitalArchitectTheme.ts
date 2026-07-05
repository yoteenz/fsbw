import type { CSSProperties } from 'react';

export const DA = {
  accent: '#0F172A',
  indigo: '#6366F1',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const daPanel: CSSProperties = {
  background: DA.panelBg,
  border: `1px solid ${DA.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const daDarkHeader: CSSProperties = {
  background: DA.accent,
  border: `1px solid ${DA.accent}`,
  color: '#F8FAFC',
};

export const daSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: DA.accent,
  margin: '0 0 8px 0',
};

export const daLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: DA.gray,
  lineHeight: 1.45,
};

export const daValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: DA.indigo,
};

export const daLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: DA.indigo,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return DA.green;
  if (pct >= 70) return DA.indigo;
  if (pct >= 55) return DA.slate;
  return DA.red;
}

export const DIGITAL_ARCHITECT_STYLES = `
  .digital-architect-root { font-family: "Futura PT Book", sans-serif; }
`;
