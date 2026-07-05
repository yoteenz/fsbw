import type { CSSProperties } from 'react';

export const CTO = {
  accent: '#0F172A',
  blue: '#2563EB',
  sky: '#93C5FD',
  red: '#EB1C24',
  green: '#16A34A',
  amber: '#D97706',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  opsBg: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
} as const;

export const ctoPanel: CSSProperties = {
  background: CTO.panelBg,
  border: `1px solid ${CTO.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const ctoDarkHeader: CSSProperties = {
  background: CTO.accent,
  border: `1px solid ${CTO.accent}`,
  color: '#F8FAFC',
};

export const ctoSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CTO.accent,
  margin: '0 0 8px 0',
};

export const ctoLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CTO.gray,
  lineHeight: 1.45,
};

export const ctoValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CTO.blue,
};

export const ctoLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CTO.blue,
  display: 'inline-block',
  marginRight: 6,
  animation: 'cto-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return CTO.green;
  if (score >= 75) return CTO.blue;
  return CTO.red;
}

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'governed') return CTO.green;
  if (status === 'pending' || status === 'revision' || status === 'review' || status === 'planned') return CTO.amber;
  if (status === 'blocked') return CTO.red;
  return CTO.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'high') return CTO.red;
  if (severity === 'medium') return CTO.amber;
  return CTO.gray;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const CHIEF_TECHNOLOGY_OFFICER_STYLES = `
  .chief-technology-officer-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes cto-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .cto-compass {
    padding: 10px;
    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    border-left: 3px solid #2563EB;
    font-style: italic;
    font-size: 8px;
    color: #2563EB;
    line-height: 1.5;
  }
`;
