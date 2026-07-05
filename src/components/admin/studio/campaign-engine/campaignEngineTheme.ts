import type { CSSProperties } from 'react';

export const CE = {
  accent: '#0F172A',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const cePanel: CSSProperties = {
  background: CE.panelBg,
  border: `1px solid ${CE.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const ceDarkHeader: CSSProperties = {
  background: CE.accent,
  border: `1px solid ${CE.accent}`,
  color: '#F8FAFC',
};

export const ceSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CE.accent,
  margin: '0 0 8px 0',
};

export const ceLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CE.gray,
  lineHeight: 1.45,
};

export const ceValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CE.amber,
};

export const ceLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CE.amber,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return CE.green;
  if (pct >= 70) return CE.amber;
  if (pct >= 55) return CE.slate;
  return CE.red;
}

export const CAMPAIGN_ENGINE_STYLES = `
  .campaign-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
