import type { CSSProperties } from 'react';

export const CEO = {
  accent: '#0F172A',
  cyan: '#0891B2',
  sky: '#E0F2FE',
  red: '#EB1C24',
  green: '#16A34A',
  amber: '#D97706',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  labBg: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
} as const;

export const ceoPanel: CSSProperties = {
  background: CEO.panelBg,
  border: `1px solid ${CEO.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const ceoDarkHeader: CSSProperties = {
  background: CEO.accent,
  border: `1px solid ${CEO.accent}`,
  color: '#F8FAFC',
};

export const ceoSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CEO.accent,
  margin: '0 0 8px 0',
};

export const ceoLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CEO.gray,
  lineHeight: 1.45,
};

export const ceoValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CEO.cyan,
};

export const ceoLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CEO.cyan,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ceo-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return CEO.green;
  if (score >= 75) return CEO.cyan;
  return CEO.red;
}

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'strong') return CEO.green;
  if (status === 'pending' || status === 'watch' || status === 'revision') return CEO.amber;
  if (status === 'blocked' || status === 'friction' || status === 'risk') return CEO.red;
  return CEO.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'high') return CEO.red;
  if (severity === 'medium') return CEO.amber;
  return CEO.gray;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const CHIEF_EXPERIENCE_OFFICER_STYLES = `
  .chief-experience-officer-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ceo-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .ceo-compass {
    padding: 10px;
    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
    border-left: 3px solid #0891B2;
    font-style: italic;
    font-size: 8px;
    color: #0891B2;
    line-height: 1.5;
  }
`;
