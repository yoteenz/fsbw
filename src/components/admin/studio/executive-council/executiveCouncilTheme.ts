import type { CSSProperties } from 'react';

export const EC = {
  accent: '#0F172A',
  slate: '#475569',
  gold: '#B45309',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  chamberBg: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
} as const;

export const ecPanel: CSSProperties = {
  background: EC.panelBg,
  border: `1px solid ${EC.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const ecDarkHeader: CSSProperties = {
  background: EC.accent,
  border: `1px solid ${EC.accent}`,
  color: '#F8FAFC',
};

export const ecSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: EC.accent,
  margin: '0 0 8px 0',
};

export const ecLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: EC.gray,
  lineHeight: 1.45,
};

export const ecValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: EC.gold,
};

export const ecLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EC.gold,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ec-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return EC.green;
  if (score >= 75) return EC.gold;
  return EC.red;
}

export function statusColor(status: string): string {
  if (status === 'decided' || status === 'complete') return EC.green;
  if (status === 'in-session' || status === 'in-progress' || status === 'pending') return EC.amber;
  if (status === 'deferred' || status === 'scheduled') return EC.slate;
  return EC.gray;
}

export function stanceColor(stance: string): string {
  if (stance === 'support') return EC.green;
  if (stance === 'caution') return EC.amber;
  if (stance === 'oppose') return EC.red;
  return EC.slate;
}

export function priorityColor(priority: string): string {
  if (priority === 'high') return EC.red;
  if (priority === 'medium') return EC.amber;
  return EC.gray;
}

export const EXECUTIVE_COUNCIL_STYLES = `
  .executive-council-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ec-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .ec-oath {
    padding: 10px;
    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
    border-left: 3px solid #B45309;
    font-style: italic;
    font-size: 7px;
    color: #92400E;
    line-height: 1.55;
  }
`;
