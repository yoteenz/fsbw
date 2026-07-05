import type { CSSProperties } from 'react';

export const OAF = {
  accent: '#0F172A',
  teal: '#0D9488',
  slate: '#64748B',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  trustBg: 'linear-gradient(180deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%)',
} as const;

export const oafPanel: CSSProperties = {
  background: OAF.panelBg,
  border: `1px solid ${OAF.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const oafDarkHeader: CSSProperties = {
  background: OAF.accent,
  border: `1px solid ${OAF.accent}`,
  color: '#F8FAFC',
};

export const oafSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: OAF.accent,
  margin: '0 0 8px 0',
};

export const oafLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: OAF.gray,
  lineHeight: 1.45,
};

export const oafValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: OAF.teal,
};

export const oafLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OAF.teal,
  display: 'inline-block',
  marginRight: 6,
  animation: 'oaf-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return OAF.green;
  if (score >= 75) return OAF.teal;
  return OAF.red;
}

export function levelColor(level: number): string {
  if (level >= 4) return OAF.green;
  if (level >= 2) return OAF.teal;
  return OAF.slate;
}

export function riskColor(risk: string): string {
  if (risk === 'high') return OAF.red;
  if (risk === 'medium') return OAF.amber;
  return OAF.green;
}

export function statusColor(status: string): string {
  if (status === 'permitted' || status === 'active') return OAF.green;
  if (status === 'pending-approval' || status === 'pending') return OAF.amber;
  if (status === 'blocked' || status === 'paused') return OAF.red;
  return OAF.gray;
}

export function permissionModeColor(mode: string): string {
  if (mode === 'automatic') return OAF.green;
  if (mode === 'ask-above-threshold') return OAF.teal;
  if (mode === 'always-ask') return OAF.amber;
  return OAF.red;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STYLES = `
  .organizational-autonomy-framework-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes oaf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`;
