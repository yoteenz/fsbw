import type { CSSProperties } from 'react';

export const MC = {
  accent: '#6366F1',
  red: '#EB1C24',
  green: '#16A34A',
  warn: '#CA8A04',
  gray: '#808080',
  black: '#000000',
  panelBg: 'rgba(255,255,255,0.88)',
  panelBorder: 'rgba(0,0,0,0.12)',
  darkPanel: 'rgba(15,23,42,0.92)',
} as const;

export const mcPanel: CSSProperties = {
  background: MC.panelBg,
  border: `1px solid ${MC.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const mcDarkPanel: CSSProperties = {
  background: MC.darkPanel,
  border: `1px solid rgba(99,102,241,0.35)`,
  color: '#E2E8F0',
};

export const mcSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: MC.black,
  margin: '0 0 8px 0',
};

export const mcLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: MC.gray,
  lineHeight: 1.45,
};

export const mcValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: MC.accent,
  lineHeight: 1.1,
};

export const mcLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: MC.green,
  display: 'inline-block',
  marginRight: 4,
  animation: 'mcPulse 2s ease-in-out infinite',
};

export const mcProgressBar = (pct: number, color: string = MC.accent): CSSProperties => ({
  height: 4,
  width: `${Math.min(100, Math.max(0, pct))}%`,
  background: `linear-gradient(90deg, ${color}, ${MC.red})`,
  transition: 'width 0.6s ease',
  animation: 'mcShimmer 3s ease-in-out infinite',
});

export const NDXBOOK_MC_STYLES = `
@keyframes mcPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
@keyframes mcShimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}
@keyframes mcCountdown {
  0%, 100% { color: #6366F1; }
  50% { color: #EB1C24; }
}
.ndxbook-mc-live { animation: mcPulse 2.5s ease-in-out infinite; }
.ndxbook-mc-countdown { animation: mcCountdown 2s ease-in-out infinite; font-family: "Covered By Your Grace", sans-serif; font-size: 18px; }
`;

export function trendArrow(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export function trendColor(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return MC.green;
  if (trend === 'down') return MC.red;
  return MC.gray;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
