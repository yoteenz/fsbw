import type { CSSProperties } from 'react';

export const CE = {
  accent: '#0F172A',
  teal: '#0D9488',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  timelineBg: 'linear-gradient(180deg, #F0FDFA 0%, #FAFAF9 100%)',
} as const;

export const cePanel: CSSProperties = {
  background: CE.panelBg,
  border: `1px solid ${CE.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const ceDarkHeader: CSSProperties = {
  background: CE.accent,
  border: `1px solid ${CE.accent}`,
  color: '#F8FAFC',
};

export const ceSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: CE.accent,
  margin: '0 0 8px 0',
};

export const ceLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CE.gray,
  lineHeight: 1.45,
};

export const ceValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: CE.teal,
};

export const ceLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CE.teal,
  display: 'inline-block',
  marginRight: 6,
  animation: 'ce-grow 2.5s ease-in-out infinite',
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return CE.green;
  if (pct >= 70) return CE.teal;
  if (pct >= 55) return CE.slate;
  return CE.red;
}

export function priorityColor(priority: string): string {
  if (priority === 'critical') return CE.red;
  if (priority === 'high') return CE.teal;
  if (priority === 'medium') return CE.slate;
  return CE.gray;
}

export function spaceStatusColor(status: string): string {
  if (status === 'active') return CE.green;
  if (status === 'under-construction') return CE.teal;
  return CE.gray;
}

export const CAMPUS_EVOLUTION_STYLES = `
  .campus-evolution-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes ce-grow {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
  .ce-stage-track {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ce-stage-step {
    border-left: 3px solid #0D9488;
    padding-left: 8px;
  }
`;
