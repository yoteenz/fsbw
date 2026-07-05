import type { CSSProperties } from 'react';

export const RG = {
  accent: '#0F172A',
  sage: '#6B9080',
  moss: '#A4C3B2',
  cream: '#F6F4EF',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  gardenBg: 'linear-gradient(180deg, #F6F4EF 0%, #E8F0EC 50%, #D4E4DC 100%)',
} as const;

export const rgPanel: CSSProperties = {
  background: RG.panelBg,
  border: `1px solid ${RG.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const rgDarkHeader: CSSProperties = {
  background: RG.accent,
  border: `1px solid ${RG.accent}`,
  color: '#F8FAFC',
};

export const rgSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: RG.accent,
  margin: '0 0 8px 0',
};

export const rgLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: RG.gray,
  lineHeight: 1.45,
};

export const rgValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: RG.sage,
};

export const rgLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: RG.sage,
  display: 'inline-block',
  marginRight: 6,
  animation: 'rg-bloom 4s ease-in-out infinite',
};

export function priorityColor(priority: string): string {
  if (priority === 'high') return RG.sage;
  if (priority === 'medium') return RG.slate;
  return RG.gray;
}

export function privacyColor(level: string): string {
  if (level === 'private') return RG.slate;
  if (level === 'family') return RG.sage;
  if (level === 'public') return RG.green;
  return RG.gray;
}

export const REMEMBRANCE_GARDEN_STYLES = `
  .remembrance-garden-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes rg-bloom {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.9); }
  }
  .rg-garden-path {
    border-left: 2px solid #6B9080;
    margin-left: 8px;
    padding-left: 12px;
  }
  .rg-dedication {
    position: relative;
    padding-bottom: 8px;
  }
  .rg-dedication::before {
    content: '';
    position: absolute;
    left: -17px;
    top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #A4C3B2;
    border: 2px solid white;
  }
`;
