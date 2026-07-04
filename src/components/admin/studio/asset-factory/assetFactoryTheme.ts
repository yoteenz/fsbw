import type { CSSProperties } from 'react';

export const AF_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.84)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  pass: '#16A34A',
  warn: '#CA8A04',
  blue: '#2563EB',
  glow: 'rgba(235,28,36,0.15)',
} as const;

export const afPanelStyle: CSSProperties = {
  background: AF_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: AF_VISUAL.border,
};

export const afActiveDept: CSSProperties = {
  ...afPanelStyle,
  background: AF_VISUAL.glow,
  border: `2px solid ${AF_VISUAL.red}`,
  boxShadow: '0 0 12px rgba(235,28,36,0.2)',
};

export const afSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: AF_VISUAL.black,
  letterSpacing: '0.06em',
  margin: '0 0 8px 0',
};

export const afCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: AF_VISUAL.gray,
  lineHeight: 1.5,
};

export const afGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
  color: AF_VISUAL.black,
};

export const afActionBtn: CSSProperties = {
  border: AF_VISUAL.borderStrong,
  color: AF_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '8px',
  textTransform: 'uppercase',
  padding: '5px 10px',
  cursor: 'pointer',
};

export const ASSET_FACTORY_STYLES = `
@keyframes afPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(235,28,36,0.15); }
  50% { box-shadow: 0 0 18px rgba(235,28,36,0.35); }
}
@keyframes afProgress {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.af-dept-active { animation: afPulse 2.5s ease-in-out infinite; }
.af-tour-line { animation: afProgress 1.8s ease-in-out infinite; }
`;
