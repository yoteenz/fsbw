import type { CSSProperties } from 'react';

export const DE = {
  accent: '#0F172A',
  violet: '#7C3AED',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const dePanel: CSSProperties = {
  background: DE.panelBg,
  border: `1px solid ${DE.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const deDarkHeader: CSSProperties = {
  background: DE.accent,
  border: `1px solid ${DE.accent}`,
  color: '#F8FAFC',
};

export const deSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: DE.accent,
  margin: '0 0 8px 0',
};

export const deLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: DE.gray,
  lineHeight: 1.45,
};

export const deValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: DE.violet,
};

export const deLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: DE.violet,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return DE.green;
  if (pct >= 70) return DE.violet;
  if (pct >= 55) return DE.slate;
  return DE.red;
}

export const DISTRIBUTION_ENGINE_STYLES = `
  .distribution-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
