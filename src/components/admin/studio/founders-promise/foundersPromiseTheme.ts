import type { CSSProperties } from 'react';

export const FP = {
  accent: '#0F172A',
  amber: '#92400E',
  warm: '#FEF3C7',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  promiseBg: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
} as const;

export const fpPanel: CSSProperties = {
  background: FP.panelBg,
  border: `1px solid ${FP.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const fpDarkHeader: CSSProperties = {
  background: FP.accent,
  border: `1px solid ${FP.accent}`,
  color: '#F8FAFC',
};

export const fpSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: FP.accent,
  margin: '0 0 8px 0',
};

export const fpLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: FP.gray,
  lineHeight: 1.45,
};

export const fpValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: FP.amber,
};

export const fpLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: FP.amber,
  display: 'inline-block',
  marginRight: 6,
  animation: 'fp-compass 3.5s ease-in-out infinite',
};

export function alignmentColor(score: number): string {
  if (score >= 90) return FP.green;
  if (score >= 75) return FP.amber;
  return FP.red;
}

export function statusColor(status: string): string {
  if (status === 'aligned') return FP.green;
  if (status === 'review') return FP.amber;
  return FP.red;
}

export const FOUNDERS_PROMISE_STYLES = `
  .founders-promise-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes fp-compass {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .fp-promise-text {
    white-space: pre-wrap;
    font-family: "Covered By Your Grace", sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #92400E;
    padding: 12px;
    background: linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%);
    border-left: 3px solid #92400E;
  }
`;
