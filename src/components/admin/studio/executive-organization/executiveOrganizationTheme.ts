import type { CSSProperties } from 'react';

export const EO = {
  accent: '#0F172A',
  teal: '#0D9488',
  green: '#16A34A',
  gold: '#CA8A04',
  red: '#EB1C24',
  indigo: '#6366F1',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const eoPanel: CSSProperties = {
  background: EO.panelBg,
  border: `1px solid ${EO.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const eoDarkHeader: CSSProperties = {
  background: EO.accent,
  border: `1px solid ${EO.accent}`,
  color: '#F8FAFC',
};

export const eoSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: EO.accent,
  margin: '0 0 8px 0',
};

export const eoLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: EO.gray,
  lineHeight: 1.45,
};

export const eoValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: EO.teal,
};

export const eoLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EO.green,
  display: 'inline-block',
  marginRight: 4,
  animation: 'eoPulse 2s ease-in-out infinite',
};

export const EXECUTIVE_ORGANIZATION_STYLES = `
@keyframes eoPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;

export function scoreColor(pct: number): string {
  if (pct >= 85) return EO.green;
  if (pct >= 70) return EO.gold;
  return EO.red;
}
