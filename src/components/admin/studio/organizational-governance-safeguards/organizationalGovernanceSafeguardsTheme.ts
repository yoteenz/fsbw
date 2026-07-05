import type { CSSProperties } from 'react';

export const OGS = {
  accent: '#0F172A',
  slate: '#475569',
  stone: '#78716C',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  missionBg: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
} as const;

export const ogsPanel: CSSProperties = {
  background: OGS.panelBg,
  border: `1px solid ${OGS.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const ogsDarkHeader: CSSProperties = {
  background: OGS.accent,
  border: `1px solid ${OGS.accent}`,
  color: '#F8FAFC',
};

export const ogsSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: OGS.accent,
  margin: '0 0 8px 0',
};

export const ogsLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: OGS.gray,
  lineHeight: 1.45,
};

export const ogsValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: OGS.slate,
};

export const ogsLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OGS.slate,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ogs-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return OGS.green;
  if (score >= 75) return OGS.slate;
  return OGS.red;
}

export function riskColor(level: string): string {
  if (level === 'low') return OGS.green;
  if (level === 'medium') return OGS.amber;
  if (level === 'high' || level === 'critical') return OGS.red;
  return OGS.gray;
}

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'active' || status === 'foundational') return OGS.green;
  if (status === 'pending' || status === 'draft' || status === 'evolving' || status === 'review') return OGS.amber;
  if (status === 'escalated' || status === 'blocked') return OGS.red;
  return OGS.gray;
}

export const ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STYLES = `
  .organizational-governance-safeguards-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ogs-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .ogs-constitution {
    padding: 8px;
    background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
    border-left: 3px solid #475569;
    font-size: 8px;
    color: #334155;
    line-height: 1.5;
  }
`;
