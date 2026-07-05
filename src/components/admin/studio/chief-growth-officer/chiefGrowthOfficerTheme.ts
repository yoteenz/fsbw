import type { CSSProperties } from 'react';

export const CGO = {
  accent: '#0F172A',
  emerald: '#059669',
  green: '#10B981',
  red: '#EB1C24',
  brightGreen: '#16A34A',
  amber: '#D97706',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  labBg: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)',
} as const;

export const cgoPanel: CSSProperties = {
  background: CGO.panelBg,
  border: `1px solid ${CGO.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const cgoDarkHeader: CSSProperties = {
  background: CGO.accent,
  border: `1px solid ${CGO.accent}`,
  color: '#F8FAFC',
};

export const cgoSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CGO.accent,
  margin: '0 0 8px 0',
};

export const cgoLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CGO.gray,
  lineHeight: 1.45,
};

export const cgoValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CGO.emerald,
};

export const cgoLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CGO.emerald,
  display: 'inline-block',
  marginRight: 6,
  animation: 'cgo-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return CGO.brightGreen;
  if (score >= 75) return CGO.emerald;
  return CGO.red;
}

export function statusColor(status: string): string {
  if (status === 'approved') return CGO.brightGreen;
  if (status === 'pending' || status === 'revision') return CGO.amber;
  if (status === 'blocked') return CGO.red;
  return CGO.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'high') return CGO.red;
  if (severity === 'medium') return CGO.amber;
  return CGO.gray;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const CHIEF_GROWTH_OFFICER_STYLES = `
  .chief-growth-officer-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes cgo-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .cgo-compass {
    padding: 10px;
    background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
    border-left: 3px solid #059669;
    font-style: italic;
    font-size: 8px;
    color: #059669;
    line-height: 1.5;
  }
`;
