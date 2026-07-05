import type { CSSProperties } from 'react';

export const OSI = {
  accent: '#0F172A',
  emerald: '#10B981',
  teal: '#0D9488',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  missionBg: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)',
} as const;

export const osiPanel: CSSProperties = {
  background: OSI.panelBg,
  border: `1px solid ${OSI.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const osiDarkHeader: CSSProperties = {
  background: OSI.accent,
  border: `1px solid ${OSI.accent}`,
  color: '#F8FAFC',
};

export const osiSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: OSI.accent,
  margin: '0 0 8px 0',
};

export const osiLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: OSI.gray,
  lineHeight: 1.45,
};

export const osiValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: OSI.emerald,
};

export const osiLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OSI.emerald,
  display: 'inline-block',
  marginRight: 6,
  animation: 'osi-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return OSI.green;
  if (score >= 75) return OSI.emerald;
  return OSI.red;
}

export function domainStatusColor(status: string): string {
  if (status === 'strong') return OSI.green;
  if (status === 'developing') return OSI.emerald;
  if (status === 'attention') return OSI.amber;
  if (status === 'critical') return OSI.red;
  return OSI.gray;
}

export function statusColor(status: string): string {
  if (status === 'complete' || status === 'active' || status === 'running' || status === 'strong') return OSI.green;
  if (status === 'recommended' || status === 'proposed' || status === 'developing' || status === 'monitoring' || status === 'rising') return OSI.emerald;
  if (status === 'deferred' || status === 'attention' || status === 'stable') return OSI.amber;
  if (status === 'failed' || status === 'critical' || status === 'declining' || status === 'paused') return OSI.red;
  return OSI.gray;
}

export const ORGANIZATIONAL_SELF_IMPROVEMENT_STYLES = `
  .organizational-self-improvement-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes osi-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .osi-improvement {
    padding: 8px;
    background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
    border-left: 3px solid #10B981;
    font-size: 8px;
    color: #047857;
    line-height: 1.5;
  }
`;
