/** Concierge Approval Flow — luxury editorial board · warm marble · champagne. */
import type { CSSProperties } from 'react';

export const CAF_VISUAL = {
  champagne: '#C9A962',
  champagneSoft: 'rgba(201,169,98,0.14)',
  gold: '#92704A',
  marble: 'url(/assets/marble-half.png)',
  ambient: 'radial-gradient(ellipse 85% 55% at 50% 15%, rgba(201,169,98,0.18) 0%, rgba(255,255,255,0) 60%)',
  glass: 'rgba(255,255,255,0.82)',
  glassBorder: '1.3px solid rgba(0,0,0,0.08)',
  text: '#1a1a1a',
  textMuted: '#666',
  textDim: '#999',
  founder: '#EB1C24',
  approved: '#059669',
  suggestions: '#D97706',
  revision: '#DC2626',
} as const;

export const cafPanelStyle: CSSProperties = {
  background: CAF_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: CAF_VISUAL.glassBorder,
  boxShadow: '0 4px 28px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)',
};

export const cafLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CAF_VISUAL.textDim,
};

export const cafValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: CAF_VISUAL.text,
  lineHeight: 1.5,
};

export const cafGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '18px',
  color: CAF_VISUAL.gold,
};

export const cafSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CAF_VISUAL.text,
  margin: '0 0 8px 0',
};

export const CAF_ANIMATION_CSS = `
@keyframes caf-ambient {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.9; }
}
@keyframes caf-pipeline-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(201,169,98,0); }
  50% { box-shadow: 0 0 12px rgba(201,169,98,0.35); }
}
.caf-ambient { animation: caf-ambient 7s ease-in-out infinite; }
.caf-pipeline-active { animation: caf-pipeline-glow 2.8s ease-in-out infinite; }
`;

export function verdictColor(verdict?: string): string {
  switch (verdict) {
    case 'approved':
      return CAF_VISUAL.approved;
    case 'approved-with-suggestions':
      return CAF_VISUAL.suggestions;
    case 'needs-revision':
    case 'critical-issue':
      return CAF_VISUAL.revision;
    default:
      return CAF_VISUAL.textDim;
  }
}
