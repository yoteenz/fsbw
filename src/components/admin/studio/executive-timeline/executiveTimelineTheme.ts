/** Executive Timeline — temporal intelligence · warm marble · executive planner aesthetic. */
import type { CSSProperties } from 'react';

export const ET_VISUAL = {
  champagne: '#C9A962',
  champagneSoft: 'rgba(201,169,98,0.14)',
  gold: '#92704A',
  marble: 'url(/assets/marble-half.png)',
  ambient: 'radial-gradient(ellipse 85% 55% at 50% 15%, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0) 60%)',
  glass: 'rgba(255,255,255,0.82)',
  glassBorder: '1.3px solid rgba(0,0,0,0.08)',
  text: '#1a1a1a',
  textMuted: '#666',
  textDim: '#999',
  founder: '#EB1C24',
  critical: '#DC2626',
  atRisk: '#D97706',
  scheduled: '#059669',
  portfolio: '#6366F1',
  personal: '#EB1C24',
} as const;

export const etPanelStyle: CSSProperties = {
  background: ET_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: ET_VISUAL.glassBorder,
  boxShadow: '0 4px 28px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)',
};

export const etLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: ET_VISUAL.textDim,
};

export const etValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: ET_VISUAL.text,
  lineHeight: 1.5,
};

export const etGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '18px',
  color: ET_VISUAL.gold,
};

export const etSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: ET_VISUAL.text,
  margin: '0 0 8px 0',
};

export const ET_ANIMATION_CSS = `
@keyframes et-ambient {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.9; }
}
@keyframes et-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(99,102,241,0); }
  50% { box-shadow: 0 0 10px rgba(99,102,241,0.25); }
}
.et-ambient { animation: et-ambient 7s ease-in-out infinite; }
.et-event-active { animation: et-pulse 2.8s ease-in-out infinite; }
`;

export function statusColor(status: string): string {
  switch (status) {
    case 'critical':
    case 'blocked':
      return ET_VISUAL.critical;
    case 'at-risk':
      return ET_VISUAL.atRisk;
    case 'completed':
    case 'scheduled':
      return ET_VISUAL.scheduled;
    case 'in-progress':
      return ET_VISUAL.portfolio;
    default:
      return ET_VISUAL.textDim;
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return ET_VISUAL.critical;
    case 'high':
      return ET_VISUAL.founder;
    case 'medium':
      return ET_VISUAL.gold;
    default:
      return ET_VISUAL.textDim;
  }
}
