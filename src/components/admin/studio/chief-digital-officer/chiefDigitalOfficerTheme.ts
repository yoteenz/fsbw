import type { CSSProperties } from 'react';

export const CDO = {
  accent: '#0F172A',
  indigo: '#6366F1',
  violet: '#818CF8',
  red: '#EB1C24',
  green: '#16A34A',
  amber: '#D97706',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  labBg: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
} as const;

export const cdoPanel: CSSProperties = {
  background: CDO.panelBg,
  border: `1px solid ${CDO.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const cdoDarkHeader: CSSProperties = {
  background: CDO.accent,
  border: `1px solid ${CDO.accent}`,
  color: '#F8FAFC',
};

export const cdoSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CDO.accent,
  margin: '0 0 8px 0',
};

export const cdoLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CDO.gray,
  lineHeight: 1.45,
};

export const cdoValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CDO.indigo,
};

export const cdoLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CDO.indigo,
  display: 'inline-block',
  marginRight: 6,
  animation: 'cdo-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return CDO.green;
  if (score >= 75) return CDO.indigo;
  return CDO.red;
}

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'reviewed' || status === 'recommended') return CDO.green;
  if (status === 'pending' || status === 'revision' || status === 'in-progress' || status === 'evaluating') return CDO.amber;
  if (status === 'blocked') return CDO.red;
  return CDO.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'high') return CDO.red;
  if (severity === 'medium') return CDO.amber;
  return CDO.gray;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const CHIEF_DIGITAL_OFFICER_STYLES = `
  .chief-digital-officer-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes cdo-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .cdo-compass {
    padding: 10px;
    background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
    border-left: 3px solid #6366F1;
    font-style: italic;
    font-size: 8px;
    color: #6366F1;
    line-height: 1.5;
  }
`;
