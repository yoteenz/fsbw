import type { CSSProperties } from 'react';

export const ODE = {
  accent: '#0F172A',
  violet: '#7C3AED',
  purple: '#9333EA',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  missionBg: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
} as const;

export const odePanel: CSSProperties = {
  background: ODE.panelBg,
  border: `1px solid ${ODE.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const odeDarkHeader: CSSProperties = {
  background: ODE.accent,
  border: `1px solid ${ODE.accent}`,
  color: '#F8FAFC',
};

export const odeSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: ODE.accent,
  margin: '0 0 8px 0',
};

export const odeLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: ODE.gray,
  lineHeight: 1.45,
};

export const odeValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: ODE.violet,
};

export const odeLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: ODE.violet,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ode-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return ODE.green;
  if (score >= 75) return ODE.violet;
  return ODE.red;
}

export function priorityColor(priority: string): string {
  if (priority === 'high') return ODE.red;
  if (priority === 'medium') return ODE.amber;
  return ODE.gray;
}

export function statusColor(status: string): string {
  if (status === 'complete' || status === 'active') return ODE.green;
  if (status === 'in-progress' || status === 'planning' || status === 'review' || status === 'pending') return ODE.amber;
  if (status === 'paused') return ODE.red;
  return ODE.gray;
}

export const ORGANIZATIONAL_DELEGATION_ENGINE_STYLES = `
  .organizational-delegation-engine-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ode-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .ode-outcome {
    padding: 8px;
    background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
    border-left: 3px solid #7C3AED;
    font-size: 8px;
    color: #6D28D9;
    line-height: 1.5;
  }
`;
