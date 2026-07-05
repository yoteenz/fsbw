/** Screening Room — private cinema · dark · glass · ambient. */
import type { CSSProperties } from 'react';

export const SR_VISUAL = {
  bg: '#0a0a0c',
  bgSoft: '#12121a',
  vignette: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(30,30,40,0.4) 0%, rgba(0,0,0,0.92) 100%)',
  screenGlow: 'radial-gradient(ellipse 80% 50% at 50% 35%, rgba(201,169,98,0.08) 0%, transparent 70%)',
  ambient: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(201,169,98,0.06) 0%, transparent 50%)',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: '1px solid rgba(255,255,255,0.12)',
  glassStrong: 'rgba(255,255,255,0.1)',
  champagne: '#C9A962',
  champagneSoft: 'rgba(201,169,98,0.15)',
  text: 'rgba(255,255,255,0.92)',
  textMuted: 'rgba(255,255,255,0.45)',
  textDim: 'rgba(255,255,255,0.28)',
  success: '#34D399',
} as const;

export const srGlassPanel: CSSProperties = {
  background: SR_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: SR_VISUAL.glassBorder,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
};

export const srLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.1em',
  color: SR_VISUAL.textMuted,
  textTransform: 'uppercase',
};

export const srValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: SR_VISUAL.text,
  lineHeight: 1.5,
};

export const srGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '16px',
  color: SR_VISUAL.champagne,
  lineHeight: 1.2,
};

export const SR_CINEMA_CSS = `
@keyframes sr-screen-glow {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}
@keyframes sr-ambient-breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
@keyframes sr-seat-glow {
  0%, 100% { box-shadow: 0 -20px 60px rgba(201,169,98,0.03); }
  50% { box-shadow: 0 -24px 80px rgba(201,169,98,0.06); }
}
.sr-screen-glow { animation: sr-screen-glow 8s ease-in-out infinite; }
.sr-ambient { animation: sr-ambient-breathe 10s ease-in-out infinite; }
.sr-seating { animation: sr-seat-glow 6s ease-in-out infinite; }
`;

export function formatRuntime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
