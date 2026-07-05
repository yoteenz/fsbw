import type { CSSProperties } from 'react';

export const WO = {
  accent: '#0F172A',
  cyan: '#0891B2',
  green: '#16A34A',
  gold: '#CA8A04',
  red: '#EB1C24',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const woPanel: CSSProperties = {
  background: WO.panelBg,
  border: `1px solid ${WO.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const woDarkHeader: CSSProperties = {
  background: WO.accent,
  border: `1px solid ${WO.accent}`,
  color: '#F8FAFC',
};

export const woSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: WO.accent,
  margin: '0 0 8px 0',
};

export const woLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: WO.gray,
  lineHeight: 1.45,
};

export const woValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: WO.cyan,
};

export const woLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: WO.cyan,
  display: 'inline-block',
  marginRight: 6,
};

export function healthColor(pct: number): string {
  if (pct >= 85) return WO.green;
  if (pct >= 70) return WO.cyan;
  if (pct >= 55) return WO.gold;
  return WO.red;
}

export const WORK_ORCHESTRATION_STYLES = `
  .work-orchestration-root { font-family: "Futura PT Book", sans-serif; }
`;
