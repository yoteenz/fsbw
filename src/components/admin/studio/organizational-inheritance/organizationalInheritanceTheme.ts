import type { CSSProperties } from 'react';

export const OI = {
  accent: '#0F172A',
  indigo: '#6366F1',
  violet: '#7C3AED',
  green: '#16A34A',
  gold: '#CA8A04',
  red: '#EB1C24',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const oiPanel: CSSProperties = {
  background: OI.panelBg,
  border: `1px solid ${OI.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const oiDarkHeader: CSSProperties = {
  background: OI.accent,
  border: `1px solid ${OI.accent}`,
  color: '#F8FAFC',
};

export const oiSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: OI.accent,
  margin: '0 0 8px 0',
};

export const oiLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: OI.gray,
  lineHeight: 1.45,
};

export const oiValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: OI.indigo,
};

export const oiLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OI.indigo,
  display: 'inline-block',
  marginRight: 6,
};

export function confidenceColor(pct: number): string {
  if (pct >= 90) return OI.green;
  if (pct >= 75) return OI.indigo;
  if (pct >= 60) return OI.gold;
  return OI.red;
}

export const ORGANIZATIONAL_INHERITANCE_STYLES = `
  .organizational-inheritance-root { font-family: "Futura PT Book", sans-serif; }
`;
