import type { CSSProperties } from 'react';

export const COS = {
  accent: '#0F172A',
  gold: '#CA8A04',
  red: '#EB1C24',
  green: '#16A34A',
  indigo: '#6366F1',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.9)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const cosPanel: CSSProperties = {
  background: COS.panelBg,
  border: `1px solid ${COS.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const cosDarkHeader: CSSProperties = {
  background: COS.accent,
  border: `1px solid ${COS.accent}`,
  color: '#F8FAFC',
};

export const cosSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: COS.accent,
  margin: '0 0 8px 0',
};

export const cosLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: COS.gray,
  lineHeight: 1.45,
};

export const cosValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: COS.indigo,
};

export const cosLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: COS.green,
  display: 'inline-block',
  marginRight: 4,
  animation: 'cosPulse 2s ease-in-out infinite',
};

export const CHIEF_OF_STAFF_STYLES = `
@keyframes cosPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;

export function statusColor(status: string): string {
  if (status.includes('approved')) return COS.green;
  if (status.includes('escalated') || status.includes('rejected')) return COS.red;
  if (status.includes('revision')) return COS.gold;
  return COS.gray;
}

export function riskColor(risk: string): string {
  if (risk === 'critical' || risk === 'high') return COS.red;
  if (risk === 'medium') return COS.gold;
  return COS.green;
}
