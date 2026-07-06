/** Headquarters Experience™ V2 — bright executive environment · marble · glass · crystal. */
import type { CSSProperties } from 'react';

export const HQ = {
  red: '#EB1C24',
  gray: '#808080',
  black: '#1A1A1A',
  gold: '#92704A',
  accent: '#6366F1',
  glass: 'rgba(255,255,255,0.78)',
  glassDeep: 'rgba(255,255,255,0.55)',
  chrome: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(255,255,255,0.72)',
  borderSubtle: '1px solid rgba(0,0,0,0.08)',
  shadow: '0 12px 40px rgba(0,0,0,0.08), 0 0 32px rgba(235,28,36,0.04)',
  innerGlow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 12px rgba(235,28,36,0.04)',
  wingGap: 40,
  zonePadding: 20,
} as const;

export const HQ_STYLES = `
@keyframes hq-ambient-float {
  0%, 100% { transform: translateY(0); opacity: 0.35; }
  50% { transform: translateY(-6px); opacity: 0.55; }
}
@keyframes hq-crystal-pulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}
@keyframes hq-light-sweep {
  0% { background-position: -120% 0; }
  100% { background-position: 220% 0; }
}
.hq-lobby-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255,255,255,0.9) 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 85% 20%, rgba(235,28,36,0.06) 0%, transparent 50%);
}
.hq-floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(235,28,36,0.25);
  animation: hq-ambient-float 8s ease-in-out infinite;
}
.hq-crystal-ring {
  animation: hq-crystal-pulse 4.5s ease-in-out infinite;
}
.hq-wing-enter {
  animation: hqWingFade 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes hqWingFade {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export const hqGlassPanel: CSSProperties = {
  background: HQ.glass,
  backdropFilter: 'blur(18px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
  border: HQ.border,
  boxShadow: `${HQ.shadow}, ${HQ.innerGlow}`,
  borderRadius: '12px',
};

export const hqLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '7px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: HQ.gray,
};

export const hqBody: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  color: HQ.black,
  lineHeight: 1.5,
};

export const hqGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  color: HQ.black,
};

export const hqActionBtn: CSSProperties = {
  border: '1px solid rgba(235,28,36,0.35)',
  color: HQ.red,
  fontFamily: '"Futura PT Medium"',
  background: 'rgba(255,255,255,0.85)',
  fontSize: '7px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '6px',
};
