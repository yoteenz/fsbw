import type { CSSProperties } from 'react';

export const FW = {
  accent: '#0F172A',
  stone: '#78716C',
  marble: '#F5F5F4',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  pathBg: 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 50%, #E7E5E4 100%)',
} as const;

export const fwPanel: CSSProperties = {
  background: FW.panelBg,
  border: `1px solid ${FW.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const fwDarkHeader: CSSProperties = {
  background: FW.accent,
  border: `1px solid ${FW.accent}`,
  color: '#F8FAFC',
};

export const fwSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: FW.accent,
  margin: '0 0 8px 0',
};

export const fwLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: FW.gray,
  lineHeight: 1.45,
};

export const fwValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: FW.stone,
};

export const fwLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: FW.stone,
  display: 'inline-block',
  marginRight: 6,
  animation: 'fw-path 3s ease-in-out infinite',
};

export function priorityColor(priority: string): string {
  if (priority === 'high') return FW.stone;
  if (priority === 'medium') return FW.slate;
  return FW.gray;
}

export const FOUNDER_WALK_STYLES = `
  .founder-walk-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes fw-path {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .fw-pathway {
    border-left: 2px solid #78716C;
    margin-left: 8px;
    padding-left: 12px;
  }
  .fw-path-step {
    position: relative;
    padding-bottom: 8px;
  }
  .fw-path-step::before {
    content: '';
    position: absolute;
    left: -17px;
    top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #78716C;
    border: 2px solid white;
  }
`;
