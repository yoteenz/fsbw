import type { CSSProperties } from 'react';

export const SE = {
  accent: '#0F172A',
  slate: '#334155',
  blue: '#1E40AF',
  green: '#16A34A',
  gold: '#CA8A04',
  red: '#EB1C24',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const sePanel: CSSProperties = {
  background: SE.panelBg,
  border: `1px solid ${SE.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const seDarkHeader: CSSProperties = {
  background: SE.accent,
  border: `1px solid ${SE.accent}`,
  color: '#F8FAFC',
};

export const seSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: SE.accent,
  margin: '0 0 8px 0',
};

export const seLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: SE.gray,
  lineHeight: 1.45,
};

export const seValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: SE.slate,
};

export const seLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: SE.slate,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return SE.green;
  if (pct >= 70) return SE.slate;
  if (pct >= 55) return SE.gold;
  return SE.red;
}

export const STRATEGY_ENGINE_STYLES = `
  .strategy-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
