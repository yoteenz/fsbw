import type { CSSProperties } from 'react';

export const RE = {
  accent: '#0F172A',
  emerald: '#059669',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const rePanel: CSSProperties = {
  background: RE.panelBg,
  border: `1px solid ${RE.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const reDarkHeader: CSSProperties = {
  background: RE.accent,
  border: `1px solid ${RE.accent}`,
  color: '#F8FAFC',
};

export const reSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: RE.accent,
  margin: '0 0 8px 0',
};

export const reLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: RE.gray,
  lineHeight: 1.45,
};

export const reValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: RE.emerald,
};

export const reLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: RE.emerald,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return RE.green;
  if (pct >= 70) return RE.emerald;
  if (pct >= 55) return RE.slate;
  return RE.red;
}

export const RELATIONSHIP_ENGINE_STYLES = `
  .relationship-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
