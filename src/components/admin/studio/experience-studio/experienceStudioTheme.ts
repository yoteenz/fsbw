/** Experience Studio™ — premium builder visual language · marble · glass · crystal. */
import type { CSSProperties } from 'react';

export const ES = {
  red: '#EB1C24',
  gray: '#808080',
  black: '#1A1A1A',
  glass: 'rgba(255,255,255,0.82)',
  glassDeep: 'rgba(255,255,255,0.62)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderSubtle: '1px solid rgba(0,0,0,0.06)',
  shadow: '0 16px 48px rgba(0,0,0,0.06), 0 0 40px rgba(235,28,36,0.03)',
  innerGlow: 'inset 0 1px 0 rgba(255,255,255,0.95)',
} as const;

export const EXPERIENCE_STUDIO_STYLES = `
@keyframes es-fade-in {
  from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes es-scale-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes es-orb-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(235,28,36,0.15); }
  50% { box-shadow: 0 0 24px 4px rgba(235,28,36,0.12); }
}
.es-root {
  font-family: "Futura PT Book", sans-serif;
  position: relative;
  min-height: min(72vh, 640px);
}
.es-enter { animation: es-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.es-canvas-enter { animation: es-scale-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
.es-motion-calm * { transition: opacity 0.45s ease, transform 0.45s ease; }
.es-motion-expressive * { transition: opacity 0.32s ease, transform 0.32s ease; }
.es-orb-mark {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(235,28,36,0.08));
  border: 1px solid rgba(235,28,36,0.2);
  animation: es-orb-pulse 4s ease-in-out infinite;
}
.es-slide-panel {
  animation: es-fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;

export const esGlass: CSSProperties = {
  background: ES.glass,
  backdropFilter: 'blur(20px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.15)',
  border: ES.border,
  boxShadow: `${ES.shadow}, ${ES.innerGlow}`,
  borderRadius: '14px',
};

export const esMeta: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: ES.gray,
};

export const esHeadline: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '24px',
  lineHeight: 1.15,
  color: ES.black,
  margin: 0,
};

export const esSubhead: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  lineHeight: 1.55,
  color: ES.gray,
  letterSpacing: '0.04em',
};

export const esChoiceChip: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '7px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '10px 14px',
  border: ES.borderSubtle,
  background: 'rgba(255,255,255,0.72)',
  cursor: 'pointer',
  transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.35s ease',
};

export function healthColor(score: number): string {
  if (score >= 85) return '#16A34A';
  if (score >= 72) return '#6366F1';
  if (score >= 60) return '#92704A';
  return ES.red;
}
