import type { CSSProperties } from 'react';

export const MC_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.82)',
  glassBreath: 'rgba(255,255,255,0.78)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  pass: '#16A34A',
  warn: '#CA8A04',
  blue: '#2563EB',
} as const;

export const mcPanelStyle: CSSProperties = {
  background: MC_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: MC_VISUAL.border,
};

export const mcBreathingPanel: CSSProperties = {
  ...mcPanelStyle,
  animation: 'mcBreath 6s ease-in-out infinite',
};

export const mcSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: MC_VISUAL.black,
  letterSpacing: '0.06em',
  margin: '0 0 8px 0',
};

export const mcCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: MC_VISUAL.gray,
  lineHeight: 1.5,
};

export const mcGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
  color: MC_VISUAL.black,
};

export const mcActionBtn: CSSProperties = {
  border: MC_VISUAL.borderStrong,
  color: MC_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '8px',
  textTransform: 'uppercase',
  padding: '5px 8px',
  cursor: 'pointer',
};

export const mcLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: MC_VISUAL.pass,
  display: 'inline-block',
  marginRight: 6,
  animation: 'mcPulse 2.5s ease-in-out infinite',
};

export const MISSION_CONTROL_STYLES = `
@keyframes mcBreath {
  0%, 100% { background: rgba(255,255,255,0.82); }
  50% { background: rgba(255,255,255,0.72); }
}
@keyframes mcPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.85); }
}
`;
