import type { CSSProperties } from 'react';

export const OWF = {
  accent: '#0F172A',
  sky: '#0EA5E9',
  cyan: '#0891B2',
  amber: '#D97706',
  red: '#EB1C24',
  green: '#16A34A',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  missionBg: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
} as const;

export const owfPanel: CSSProperties = {
  background: OWF.panelBg,
  border: `1px solid ${OWF.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const owfDarkHeader: CSSProperties = {
  background: OWF.accent,
  border: `1px solid ${OWF.accent}`,
  color: '#F8FAFC',
};

export const owfSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: OWF.accent,
  margin: '0 0 8px 0',
};

export const owfLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: OWF.gray,
  lineHeight: 1.45,
};

export const owfValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: OWF.sky,
};

export const owfLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OWF.sky,
  display: 'inline-block',
  marginRight: 6,
  animation: 'owf-pulse 3s ease-in-out infinite',
};

export function scoreColor(score: number): string {
  if (score >= 90) return OWF.green;
  if (score >= 75) return OWF.sky;
  return OWF.red;
}

export function statusColor(status: string): string {
  if (status === 'complete' || status === 'active') return OWF.green;
  if (status === 'adapting' || status === 'planning' || status === 'monitoring' || status === 'pending') return OWF.amber;
  if (status === 'paused' || status === 'failed') return OWF.red;
  return OWF.gray;
}

export const ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STYLES = `
  .organizational-workflow-orchestration-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes owf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .owf-workflow {
    padding: 8px;
    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
    border-left: 3px solid #0EA5E9;
    font-size: 8px;
    color: #0369A1;
    line-height: 1.5;
  }
`;
