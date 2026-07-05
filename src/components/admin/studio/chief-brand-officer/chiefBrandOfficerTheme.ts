import type { CSSProperties } from 'react';

export const CBO = {
  accent: '#0F172A',
  violet: '#7C3AED',
  lavender: '#EDE9FE',
  red: '#EB1C24',
  green: '#16A34A',
  amber: '#D97706',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  atelierBg: 'linear-gradient(180deg, #FAF5FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
} as const;

export const cboPanel: CSSProperties = {
  background: CBO.panelBg,
  border: `1px solid ${CBO.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const cboDarkHeader: CSSProperties = {
  background: CBO.accent,
  border: `1px solid ${CBO.accent}`,
  color: '#F8FAFC',
};

export const cboSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CBO.accent,
  margin: '0 0 8px 0',
};

export const cboLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CBO.gray,
  lineHeight: 1.45,
};

export const cboValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CBO.violet,
};

export const cboLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CBO.violet,
  display: 'inline-block',
  marginRight: 6,
  animation: 'cbo-guard 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return CBO.green;
  if (score >= 75) return CBO.violet;
  return CBO.red;
}

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'strong') return CBO.green;
  if (status === 'pending' || status === 'watch' || status === 'revision') return CBO.amber;
  if (status === 'blocked' || status === 'risk') return CBO.red;
  return CBO.gray;
}

export function severityColor(severity: string): string {
  if (severity === 'high') return CBO.red;
  if (severity === 'medium') return CBO.amber;
  return CBO.gray;
}

export const CHIEF_BRAND_OFFICER_STYLES = `
  .chief-brand-officer-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes cbo-guard {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .cbo-compass {
    padding: 10px;
    background: linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%);
    border-left: 3px solid #7C3AED;
    font-style: italic;
    font-size: 8px;
    color: #7C3AED;
    line-height: 1.5;
  }
`;
