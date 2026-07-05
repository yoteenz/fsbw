import type { CSSProperties } from 'react';

export const CG = {
  accent: '#0F172A',
  violet: '#9333EA',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const cgPanel: CSSProperties = {
  background: CG.panelBg,
  border: `1px solid ${CG.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const cgDarkHeader: CSSProperties = {
  background: CG.accent,
  border: `1px solid ${CG.accent}`,
  color: '#F8FAFC',
};

export const cgSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CG.accent,
  margin: '0 0 8px 0',
};

export const cgLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CG.gray,
  lineHeight: 1.45,
};

export const cgValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CG.violet,
};

export const cgLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CG.violet,
  display: 'inline-block',
  marginRight: 6,
  animation: 'cg-pulse 2s ease-in-out infinite',
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return CG.green;
  if (pct >= 70) return CG.violet;
  if (pct >= 55) return CG.slate;
  return CG.red;
}

export function trendColor(trend: string): string {
  if (trend === 'rising') return CG.green;
  if (trend === 'declining') return CG.red;
  return CG.gray;
}

export const COMPANY_GENOME_STYLES = `
  .company-genome-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes cg-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
`;
