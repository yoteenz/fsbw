import type { CSSProperties } from 'react';

export const OI = {
  accent: '#0F172A',
  indigo: '#4F46E5',
  violet: '#6366F1',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  mindBg: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
} as const;

export const oiPanel: CSSProperties = {
  background: OI.panelBg,
  border: `1px solid ${OI.panelBorder}`,
  backdropFilter: 'blur(10px)',
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
  animation: 'oi-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return OI.green;
  if (score >= 75) return OI.indigo;
  return OI.red;
}

export function priorityColor(priority: string): string {
  if (priority === 'high') return OI.red;
  if (priority === 'medium') return OI.amber;
  return OI.gray;
}

export function wisdomLevelColor(level: string): string {
  if (level === 'wisdom') return OI.green;
  if (level === 'understanding') return OI.indigo;
  if (level === 'knowledge') return OI.violet;
  return OI.gray;
}

export function periodColor(period: string): string {
  if (period === 'annual') return OI.green;
  if (period === 'quarterly') return OI.indigo;
  if (period === 'monthly') return OI.violet;
  return OI.amber;
}

export const ORGANIZATIONAL_INTELLIGENCE_STYLES = `
  .organizational-intelligence-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes oi-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`;
