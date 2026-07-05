import type { CSSProperties } from 'react';

export const NR = {
  accent: '#DC2626',
  indigo: '#6366F1',
  green: '#16A34A',
  gold: '#CA8A04',
  red: '#EB1C24',
  gray: '#808080',
  black: '#0F172A',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const nrPanel: CSSProperties = {
  background: NR.panelBg,
  border: `1px solid ${NR.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const nrDarkHeader: CSSProperties = {
  background: NR.black,
  border: `1px solid ${NR.black}`,
  color: '#F8FAFC',
};

export const nrSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: NR.black,
  margin: '0 0 8px 0',
};

export const nrLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: NR.gray,
  lineHeight: 1.45,
};

export const nrValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: NR.accent,
};

export const nrLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: NR.green,
  display: 'inline-block',
  marginRight: 4,
  animation: 'nrPulse 2s ease-in-out infinite',
};

export const NDXBOOK_NEWSROOM_STYLES = `
@keyframes nrPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;

export function healthColor(health: string): string {
  if (health === 'on-track' || health === 'complete') return NR.green;
  if (health === 'at-risk') return NR.gold;
  if (health === 'blocked') return NR.red;
  return NR.gray;
}

export function priorityColor(priority: string): string {
  if (priority === 'critical') return NR.red;
  if (priority === 'high') return NR.accent;
  return NR.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'critical') return NR.red;
  if (severity === 'warning') return NR.gold;
  return NR.indigo;
}
