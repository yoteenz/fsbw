/** Command Dock — floating executive console · glass · acrylic · ambient glow. */
import type { CSSProperties } from 'react';

export const DOCK_VISUAL = {
  glass: 'rgba(255,255,255,0.78)',
  glassBorder: '1px solid rgba(255,255,255,0.55)',
  edgeGlow: '0 0 40px rgba(99,102,241,0.12), 0 0 80px rgba(201,169,98,0.08)',
  innerGlow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04)',
  shadow: '0 12px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  ambient: 'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(99,102,241,0.15) 0%, transparent 70%)',
  champagne: '#C9A962',
  gold: '#92704A',
  portfolio: '#6366F1',
  text: '#1a1a1a',
  textMuted: '#666',
  textDim: '#999',
  founder: '#EB1C24',
  approved: '#059669',
} as const;

export const dockPanelStyle: CSSProperties = {
  background: DOCK_VISUAL.glass,
  backdropFilter: 'blur(20px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
  border: DOCK_VISUAL.glassBorder,
  boxShadow: `${DOCK_VISUAL.shadow}, ${DOCK_VISUAL.edgeGlow}, ${DOCK_VISUAL.innerGlow}`,
};

export const dockLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: DOCK_VISUAL.textDim,
};

export const dockValue: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  color: DOCK_VISUAL.text,
  lineHeight: 1.45,
};

export const dockGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: DOCK_VISUAL.gold,
};

export const DOCK_ANIMATION_CSS = `
@keyframes dock-ambient-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}
@keyframes dock-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.command-dock-ambient { animation: dock-ambient-pulse 6s ease-in-out infinite; }
.command-dock-processing {
  background: linear-gradient(90deg, transparent, rgba(201,169,98,0.12), transparent);
  background-size: 200% 100%;
  animation: dock-shimmer 2.2s ease-in-out infinite;
}
`;

export const DOCK_HEIGHT: Record<'compact' | 'medium' | 'large', number> = {
  compact: 72,
  medium: 200,
  large: 340,
};
