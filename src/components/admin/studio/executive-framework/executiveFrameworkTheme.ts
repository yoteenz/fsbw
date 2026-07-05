import type { CSSProperties } from 'react';

export const EF = {
  accent: '#0F172A',
  slate: '#334155',
  steel: '#64748B',
  blue: '#1E40AF',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  execBg: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
} as const;

export const efPanel: CSSProperties = {
  background: EF.panelBg,
  border: `1px solid ${EF.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const efDarkHeader: CSSProperties = {
  background: EF.accent,
  border: `1px solid ${EF.accent}`,
  color: '#F8FAFC',
};

export const efSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: EF.accent,
  margin: '0 0 8px 0',
};

export const efLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: EF.gray,
  lineHeight: 1.45,
};

export const efValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: EF.slate,
};

export const efLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EF.slate,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ef-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return EF.green;
  if (score >= 75) return EF.slate;
  return EF.red;
}

export function statusColor(status: string): string {
  if (status === 'active') return EF.blue;
  if (status === 'resolved') return EF.green;
  if (status === 'inherited') return EF.green;
  return EF.gray;
}

export function trendIcon(trend: string): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export const EXECUTIVE_FRAMEWORK_STYLES = `
  .executive-framework-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ef-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .ef-leadership-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  .ef-exec-card {
    border: 1px solid rgba(0,0,0,0.10);
    padding: 8px;
    background: rgba(248,250,252,0.8);
  }
`;
