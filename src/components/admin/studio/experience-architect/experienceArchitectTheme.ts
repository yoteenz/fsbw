import type { CSSProperties } from 'react';

export const EA = {
  accent: '#0F172A',
  cyan: '#0891B2',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const eaPanel: CSSProperties = {
  background: EA.panelBg,
  border: `1px solid ${EA.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const eaDarkHeader: CSSProperties = {
  background: EA.accent,
  border: `1px solid ${EA.accent}`,
  color: '#F8FAFC',
};

export const eaSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: EA.accent,
  margin: '0 0 8px 0',
};

export const eaLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: EA.gray,
  lineHeight: 1.45,
};

export const eaValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: EA.cyan,
};

export const eaLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EA.cyan,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return EA.green;
  if (pct >= 70) return EA.cyan;
  if (pct >= 55) return EA.slate;
  return EA.red;
}

export function frictionColor(score: number): string {
  if (score <= 20) return EA.green;
  if (score <= 35) return EA.cyan;
  if (score <= 45) return EA.slate;
  return EA.red;
}

export const EXPERIENCE_ARCHITECT_STYLES = `
  .experience-architect-root { font-family: "Futura PT Book", sans-serif; }
`;
