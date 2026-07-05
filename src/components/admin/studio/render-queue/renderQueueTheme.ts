/** Render Queue — alive production floor · glass · ambient pulse. */
import type { CSSProperties } from 'react';

export const RQ_VISUAL = {
  accent: '#0EA5E9',
  accentSoft: 'rgba(14,165,233,0.12)',
  pulse: '#38BDF8',
  glass: 'rgba(255,255,255,0.78)',
  glassDeep: 'rgba(255,255,255,0.92)',
  border: '1.3px solid rgba(0,0,0,0.1)',
  ambient: 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(224,242,254,0.85) 0%, rgba(255,255,255,0) 65%)',
  marble: 'url(/assets/marble-half.png)',
  warning: '#D97706',
  success: '#059669',
  paused: '#64748B',
} as const;

export const rqPanelStyle: CSSProperties = {
  background: RQ_VISUAL.glass,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: RQ_VISUAL.border,
  boxShadow: '0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
};

export const rqSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  letterSpacing: '0.08em',
  color: '#000',
  margin: '0 0 8px 0',
  textTransform: 'uppercase',
};

export const rqLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  color: '#808080',
  textTransform: 'uppercase',
};

export const rqValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: '#000',
  lineHeight: 1.45,
};

export const rqGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: RQ_VISUAL.accent,
};

export const RQ_ANIMATION_CSS = `
@keyframes rq-pulse {
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
@keyframes rq-progress-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes rq-ambient-drift {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.95; }
}
@keyframes rq-activity-dot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.rq-live-pulse { animation: rq-pulse 2.4s ease-in-out infinite; }
.rq-ambient { animation: rq-ambient-drift 6s ease-in-out infinite; }
.rq-progress-active {
  background: linear-gradient(90deg, rgba(14,165,233,0.35) 0%, rgba(56,189,248,0.9) 50%, rgba(14,165,233,0.35) 100%);
  background-size: 200% 100%;
  animation: rq-progress-shimmer 2.8s linear infinite;
}
.rq-activity-row span:nth-child(1) { animation: rq-activity-dot 1.4s ease-in-out infinite; }
.rq-activity-row span:nth-child(2) { animation: rq-activity-dot 1.4s ease-in-out 0.2s infinite; }
.rq-activity-row span:nth-child(3) { animation: rq-activity-dot 1.4s ease-in-out 0.4s infinite; }
`;

export function formatElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatEta(sec: number): string {
  if (sec <= 0) return 'COMPLETE';
  return `~${formatElapsed(sec)} remaining`;
}
