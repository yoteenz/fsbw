import type { CSSProperties } from 'react';

export const LMF = {
  accent: '#312E81',
  indigo: '#4338CA',
  violet: '#6366F1',
  steel: '#64748B',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  manifestoBg: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
} as const;

export const lmfPanel: CSSProperties = {
  background: LMF.panelBg,
  border: `1px solid ${LMF.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const lmfDarkHeader: CSSProperties = {
  background: LMF.accent,
  border: `1px solid ${LMF.accent}`,
  color: '#EEF2FF',
};

export const lmfSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: LMF.accent,
  margin: '0 0 8px 0',
};

export const lmfLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: LMF.gray,
  lineHeight: 1.45,
};

export const lmfValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: LMF.indigo,
};

export const lmfLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: LMF.indigo,
  display: 'inline-block',
  marginRight: 6,
  animation: 'lmf-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return LMF.green;
  if (score >= 75) return LMF.indigo;
  return LMF.red;
}

export function readinessColor(readiness: string): string {
  if (readiness === 'active') return LMF.green;
  if (readiness === 'architecture-ready') return LMF.indigo;
  if (readiness === 'planned') return LMF.violet;
  return LMF.gray;
}

export function statusColor(status: string): string {
  if (status === 'active') return LMF.green;
  if (status === 'growing') return LMF.indigo;
  return LMF.gray;
}

export const LEADERSHIP_MANIFESTO_FRAMEWORK_STYLES = `
  .leadership-manifesto-framework-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes lmf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
