/** Studio Orb™ — crystal acrylic intelligence · premium OS motion language. */
import type { CSSProperties } from 'react';

export const ORB_SIZE_PX = 58;

export const ORB_VISUAL = {
  brandRed: '#EB1C24',
  chrome: 'rgba(255,255,255,0.92)',
  glassCore: 'rgba(255,255,255,0.38)',
  glassEdge: 'rgba(255,255,255,0.78)',
  crystalDepth: 'rgba(235,28,36,0.14)',
  shadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(235,28,36,0.12)',
  innerGlow: 'inset 0 2px 12px rgba(255,255,255,0.95), inset 0 -4px 16px rgba(235,28,36,0.08)',
  refraction: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 38%, transparent 62%)',
  ambientRed: 'radial-gradient(circle at 50% 85%, rgba(235,28,36,0.35) 0%, transparent 68%)',
  text: '#1a1a1a',
  textMuted: '#666',
  gold: '#92704A',
  portfolio: '#6366F1',
} as const;

export const ORB_ANIMATION_CSS = `
@keyframes studio-orb-breathe {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50% { transform: scale(1.035); opacity: 1; }
}
@keyframes studio-orb-think {
  0%, 100% { box-shadow: 0 0 0 0 rgba(235,28,36,0.25); }
  50% { box-shadow: 0 0 0 10px rgba(235,28,36,0); }
}
@keyframes studio-orb-shimmer {
  0% { background-position: -180% 0; }
  100% { background-position: 180% 0; }
}
@keyframes studio-orb-bloom {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.12); }
}
@keyframes studio-orb-awaken-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes studio-orb-awaken-converge {
  from { transform: translate(var(--ox), var(--oy)) scale(0); opacity: 0; }
  to { transform: translate(0, 0) scale(1); opacity: 0.85; }
}
@keyframes studio-orb-awaken-ignite {
  0% { opacity: 0; transform: scale(0.6); }
  60% { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes studio-conversation-enter {
  from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes studio-radial-item {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

.studio-orb-root {
  position: fixed;
  z-index: 100050;
  width: ${ORB_SIZE_PX}px;
  height: ${ORB_SIZE_PX}px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              right 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              left 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
}
.studio-orb-crystal {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${ORB_VISUAL.glassCore};
  backdrop-filter: blur(14px) saturate(1.35);
  -webkit-backdrop-filter: blur(14px) saturate(1.35);
  box-shadow: ${ORB_VISUAL.shadow}, ${ORB_VISUAL.innerGlow};
  border: 1.5px solid rgba(255,255,255,0.72);
  overflow: hidden;
}
.studio-orb-crystal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: ${ORB_VISUAL.refraction};
  pointer-events: none;
}
.studio-orb-crystal::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: ${ORB_VISUAL.ambientRed};
  pointer-events: none;
}
.studio-orb-chrome-ring {
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  border: 1px solid rgba(200,200,200,0.55);
  pointer-events: none;
}
.studio-orb-state-idle .studio-orb-crystal { animation: studio-orb-breathe 4.8s ease-in-out infinite; }
.studio-orb-state-thinking .studio-orb-crystal { animation: studio-orb-think 1.6s ease-in-out infinite; }
.studio-orb-state-learning .studio-orb-crystal {
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: studio-orb-shimmer 2.4s ease-in-out infinite;
}
.studio-orb-state-opportunity .studio-orb-crystal { animation: studio-orb-bloom 3.2s ease-in-out infinite; }
.studio-orb-state-completed .studio-orb-crystal {
  background: linear-gradient(105deg, transparent 20%, rgba(235,28,36,0.15) 50%, transparent 80%);
  background-size: 200% 100%;
  animation: studio-orb-shimmer 1.8s ease-out 1;
}
.studio-orb-state-focus .studio-orb-crystal { animation: studio-orb-breathe 7s ease-in-out infinite; opacity: 0.78; }
.studio-orb-state-presentation .studio-orb-crystal { opacity: 0.35; animation: none; }
.studio-orb-state-launch .studio-orb-crystal { animation: studio-orb-bloom 2.8s ease-in-out infinite; }
.studio-orb-state-emergency .studio-orb-crystal { animation: studio-orb-think 0.9s ease-in-out infinite; }

.studio-conversation-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100040;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px) saturate(0.92);
  -webkit-backdrop-filter: blur(10px) saturate(0.92);
  pointer-events: auto;
  animation: studio-orb-awaken-fade 0.45s ease-out;
}
.studio-conversation-environment {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease, opacity 0.5s ease;
  transform-origin: center top;
}
.studio-conversation-environment-active {
  transform: scale(0.98);
  filter: saturate(0.94);
  pointer-events: none;
  user-select: none;
}
.studio-conversation-dock-panel {
  animation: studio-conversation-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.studio-radial-menu-item {
  animation: studio-radial-item 0.32s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
`;

export const conversationDockPanelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px) saturate(1.25)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.25)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow:
    '0 24px 64px rgba(0,0,0,0.14), 0 0 48px rgba(235,28,36,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
  borderRadius: '14px',
};

export const orbLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: ORB_VISUAL.textMuted,
};

export const orbBody: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  color: ORB_VISUAL.text,
  lineHeight: 1.45,
};

export const orbGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '15px',
  color: ORB_VISUAL.gold,
};
