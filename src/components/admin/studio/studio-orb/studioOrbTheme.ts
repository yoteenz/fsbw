/** Studio Orb™ — optical acrylic artifact · Living Light™ · holographic projections. */
import type { CSSProperties } from 'react';

export const ORB_SIZE_PX = 40;

export const ORB_VISUAL = {
  acrylicClear: 'rgba(255, 252, 248, 0.22)',
  warmWhite: 'rgba(255, 248, 240, 0.95)',
  champagne: '#c9a962',
  champagneSoft: 'rgba(201, 169, 98, 0.55)',
  bronze: '#92704A',
  chromeMicro: 'rgba(220, 210, 200, 0.75)',
  crystalSpectrum:
    'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(201,169,98,0.4) 35%, rgba(180,200,255,0.35) 70%, rgba(255,248,240,0.8) 100%)',
  text: 'rgba(255, 248, 240, 0.92)',
  textMuted: 'rgba(212, 196, 160, 0.78)',
  shadow:
    '0 12px 40px rgba(0, 0, 0, 0.28), 0 0 32px rgba(201, 169, 98, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
  innerBloom:
    'inset 0 2px 16px rgba(255, 255, 255, 0.75), inset 0 -6px 20px rgba(201, 169, 98, 0.12)',
  refraction:
    'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.98) 0%, rgba(255,248,240,0.25) 32%, transparent 58%)',
  caustic:
    'radial-gradient(ellipse 80% 60% at 62% 78%, rgba(201,169,98,0.28) 0%, transparent 55%)',
  subsurface:
    'radial-gradient(circle at 50% 62%, rgba(255,248,235,0.55) 0%, rgba(201,169,98,0.08) 45%, transparent 70%)',
  border: '0.5px solid rgba(255, 255, 255, 0.45)',
  brandRed: '#c9a962',
  gold: '#c9a962',
  borderLegacy: '0.5px solid rgba(255, 255, 255, 0.45)',
} as const;

export const ORB_ANIMATION_CSS = `
@keyframes studio-orb-breathe {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.015); filter: brightness(1.06); }
}
@keyframes studio-orb-light-circulate {
  0% { transform: rotate(0deg); opacity: 0.55; }
  50% { opacity: 0.85; }
  100% { transform: rotate(360deg); opacity: 0.55; }
}
@keyframes studio-orb-energy-concentrate {
  0%, 100% { transform: scale(1.1); opacity: 0.5; }
  50% { transform: scale(0.85); opacity: 0.95; }
}
@keyframes studio-orb-speak-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  40% { transform: scale(1.08); opacity: 1; }
}
@keyframes studio-orb-discovery-refract {
  0%, 100% { filter: hue-rotate(0deg) brightness(1.05); }
  33% { filter: hue-rotate(8deg) brightness(1.12); }
  66% { filter: hue-rotate(-6deg) brightness(1.08); }
}
@keyframes studio-orb-legendary-spectrum {
  0%, 100% { opacity: 0.65; transform: rotate(0deg); }
  50% { opacity: 1; transform: rotate(180deg); }
}
@keyframes studio-orb-particle-drift {
  0%, 100% { transform: translate(0, 0); opacity: 0.35; }
  50% { transform: translate(1px, -2px); opacity: 0.65; }
}
@keyframes studio-orb-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes studio-orb-event-ring {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.06); }
}
@keyframes studio-orb-projection-emerge {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.35); filter: blur(6px) brightness(1.4); }
  35% { opacity: 0.85; filter: blur(2px) brightness(1.2); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0) brightness(1); }
}
@keyframes studio-orb-projection-dismiss {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.6); filter: blur(8px); }
}
@keyframes studio-orb-projection-icon {
  0% { opacity: 0; transform: rotate(-8deg) scale(0.6); }
  60% { opacity: 1; transform: rotate(2deg) scale(1.02); }
  100% { opacity: 1; transform: rotate(0deg) scale(1); }
}
@keyframes studio-orb-projection-label {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes studio-conversation-enter {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.94); filter: blur(4px); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
}
@keyframes studio-orb-awaken-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes studio-orb-awaken-ignite {
  0% { transform: scale(0.85); filter: brightness(0.8); opacity: 0.6; }
  60% { transform: scale(1.08); filter: brightness(1.25); opacity: 1; }
  100% { transform: scale(1); filter: brightness(1); opacity: 1; }
}
.studio-orb-crystal {
  border-radius: 50%;
  background: ${ORB_VISUAL.acrylicClear};
  backdrop-filter: blur(18px) saturate(1.45);
  -webkit-backdrop-filter: blur(18px) saturate(1.45);
  box-shadow: ${ORB_VISUAL.shadow}, ${ORB_VISUAL.innerBloom};
  border: ${ORB_VISUAL.border};
}

.studio-orb-root {
  position: fixed; z-index: 100050; width: ${ORB_SIZE_PX}px; height: ${ORB_SIZE_PX}px;
  border-radius: 50%; border: none; padding: 0; cursor: pointer; background: transparent;
  transition: bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1), right 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s ease;
  -webkit-tap-highlight-color: transparent;
}
.studio-orb-root:hover { transform: translateY(-1px); }

.studio-orb-shell-outer {
  position: absolute; inset: -3px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(201,169,98,0.08) 0%, transparent 70%);
  animation: studio-orb-breathe 6s ease-in-out infinite;
}
.studio-orb-acrylic-core {
  position: absolute; inset: 0; border-radius: 50%;
  background: ${ORB_VISUAL.acrylicClear};
  backdrop-filter: blur(18px) saturate(1.45) brightness(1.08);
  -webkit-backdrop-filter: blur(18px) saturate(1.45) brightness(1.08);
  box-shadow: ${ORB_VISUAL.shadow}, ${ORB_VISUAL.innerBloom};
  border: ${ORB_VISUAL.border}; overflow: hidden;
}
.studio-orb-volumetric-glow {
  position: absolute; inset: 2px; border-radius: 50%;
  background: ${ORB_VISUAL.subsurface}; pointer-events: none;
  animation: studio-orb-breathe 5.2s ease-in-out infinite;
}
.studio-orb-caustic {
  position: absolute; inset: 0; border-radius: 50%;
  background: ${ORB_VISUAL.caustic}; pointer-events: none; mix-blend-mode: soft-light;
}
.studio-orb-refraction {
  position: absolute; inset: 0; border-radius: 50%;
  background: ${ORB_VISUAL.refraction}; pointer-events: none;
}
.studio-orb-chrome-micro-ring {
  position: absolute; inset: -1px; border-radius: 50%;
  border: 0.5px solid ${ORB_VISUAL.chromeMicro}; pointer-events: none;
}
.studio-orb-event-ring {
  position: absolute; inset: -5px; border-radius: 50%;
  border: 1px solid rgba(201,169,98,0.35); pointer-events: none; opacity: 0;
}
.studio-orb-particle-field {
  position: absolute; inset: 6px; border-radius: 50%; pointer-events: none;
  background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.9) 0.5px, transparent 1px),
    radial-gradient(circle at 70% 60%, rgba(255,248,240,0.8) 0.4px, transparent 0.8px);
  animation: studio-orb-particle-drift 8s ease-in-out infinite;
}
.studio-orb-inner-bloom {
  position: absolute; inset: 8px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,248,235,0.5) 0%, transparent 72%); pointer-events: none;
}
.studio-orb-lens { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; opacity: 0.25; }

.studio-orb-state-idle .studio-orb-volumetric-glow { animation: studio-orb-breathe 5.8s ease-in-out infinite; }
.studio-orb-state-listening .studio-orb-volumetric-glow { animation: studio-orb-light-circulate 4.5s linear infinite; }
.studio-orb-state-thinking .studio-orb-volumetric-glow,
.studio-orb-state-learning .studio-orb-volumetric-glow { animation: studio-orb-energy-concentrate 2.2s ease-in-out infinite; }
.studio-orb-state-speaking .studio-orb-volumetric-glow { animation: studio-orb-speak-pulse 1.1s ease-in-out infinite; }
.studio-orb-state-discovery .studio-orb-acrylic-core { animation: studio-orb-discovery-refract 4s ease-in-out infinite; }
.studio-orb-state-civilization-event .studio-orb-event-ring { opacity: 1; animation: studio-orb-event-ring 2.8s ease-in-out infinite; }
.studio-orb-state-legendary-discovery .studio-orb-acrylic-core { background: ${ORB_VISUAL.crystalSpectrum}; animation: studio-orb-legendary-spectrum 6s ease-in-out infinite; }
.studio-orb-state-opportunity .studio-orb-inner-bloom { animation: studio-orb-breathe 3.4s ease-in-out infinite; }
.studio-orb-state-completed .studio-orb-refraction {
  background: linear-gradient(105deg, transparent 20%, rgba(201,169,98,0.2) 50%, transparent 80%);
  background-size: 200% 100%; animation: studio-orb-shimmer 1.6s ease-out 1;
}
.studio-orb-state-focus .studio-orb-acrylic-core { opacity: 0.82; }
.studio-orb-state-presentation .studio-orb-acrylic-core { opacity: 0.32; }
.studio-orb-state-launch .studio-orb-volumetric-glow { animation: studio-orb-breathe 2.6s ease-in-out infinite; }
.studio-orb-state-emergency .studio-orb-volumetric-glow { animation: studio-orb-speak-pulse 0.7s ease-in-out infinite; }
.studio-orb-radial-open .studio-orb-acrylic-core {
  filter: brightness(1.15);
  box-shadow: ${ORB_VISUAL.shadow}, 0 0 24px rgba(201,169,98,0.25), ${ORB_VISUAL.innerBloom};
}

.studio-orb-projection {
  animation: studio-orb-projection-emerge 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  border: none; background: transparent; padding: 0; cursor: pointer; z-index: 100049;
}
.studio-orb-projection.is-dismissing { animation: studio-orb-projection-dismiss 0.38s ease-in forwards; }
.studio-orb-projection__beam {
  position: absolute; bottom: 50%; left: 50%; width: 1px; height: 28px;
  background: linear-gradient(to top, rgba(201,169,98,0.5), transparent);
  transform: translate(-50%, 100%); pointer-events: none;
}
.studio-orb-projection__glass {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255, 252, 248, 0.12);
  backdrop-filter: blur(20px) saturate(1.35); -webkit-backdrop-filter: blur(20px) saturate(1.35);
  border: 0.5px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.55);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
}
.studio-orb-projection:hover .studio-orb-projection__glass {
  transform: rotate(3deg);
  box-shadow: 0 12px 36px rgba(0,0,0,0.28), 0 0 28px rgba(201,169,98,0.15);
}
.studio-orb-projection__chrome-edge {
  position: absolute; inset: 0; border-radius: 14px;
  border: 0.5px solid rgba(201, 169, 98, 0.35); pointer-events: none;
}
.studio-orb-projection__icon-wrap {
  animation: studio-orb-projection-icon 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  z-index: 1;
}
.studio-orb-projection__glow {
  position: absolute; inset: 4px; border-radius: 10px;
  background: radial-gradient(circle at 50% 30%, rgba(255,248,240,0.35) 0%, transparent 65%);
  pointer-events: none;
}
.studio-orb-projection__particles {
  position: absolute; inset: 0; border-radius: 14px; opacity: 0.35; pointer-events: none;
  background-image: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.6) 0.5px, transparent 1px);
}
.studio-orb-projection__label {
  animation: studio-orb-projection-label 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.studio-conversation-backdrop {
  position: fixed; inset: 0; z-index: 100040;
  background: rgba(8, 7, 6, 0.35);
  backdrop-filter: blur(14px) saturate(0.88); -webkit-backdrop-filter: blur(14px) saturate(0.88);
  pointer-events: auto; animation: studio-orb-awaken-fade 0.45s ease-out;
}
.studio-conversation-environment { transition: transform 0.5s ease, filter 0.5s ease; transform-origin: center top; }
.studio-conversation-environment-active {
  transform: scale(0.985); filter: saturate(0.92) brightness(0.96);
  pointer-events: none; user-select: none;
}
.studio-conversation-dock-panel { animation: studio-conversation-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
`;

export const orbProjectionPanelStyle: CSSProperties = {
  background: 'rgba(255, 252, 248, 0.1)',
  backdropFilter: 'blur(28px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
  border: '0.5px solid rgba(255, 255, 255, 0.32)',
  boxShadow:
    '0 24px 64px rgba(0, 0, 0, 0.32), 0 0 48px rgba(201, 169, 98, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
  borderRadius: '16px',
};

export const conversationDockPanelStyle: CSSProperties = orbProjectionPanelStyle;

export const orbLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '6px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: ORB_VISUAL.textMuted,
};

export const orbProjectionLabelStyle: CSSProperties = {
  ...orbLabel,
  fontSize: '5px',
  marginTop: 6,
  color: ORB_VISUAL.text,
  textShadow: '0 0 8px rgba(201, 169, 98, 0.25)',
};

export const orbBody: CSSProperties = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '8px',
  color: ORB_VISUAL.text,
  lineHeight: 1.5,
};

export const orbGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '15px',
  color: ORB_VISUAL.champagne,
};

/** Inner glass field — holographic projection content wells */
export const orbProjectionInnerStyle: CSSProperties = {
  background: 'rgba(255, 252, 248, 0.08)',
  backdropFilter: 'blur(16px) saturate(1.3)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
  border: '0.5px solid rgba(255, 255, 255, 0.28)',
  borderRadius: 12,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
};

export const orbCloseBtnStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: '0.5px solid rgba(201, 169, 98, 0.35)',
  background: 'rgba(255, 252, 248, 0.12)',
  color: ORB_VISUAL.text,
  padding: '6px 10px',
  cursor: 'pointer',
  borderRadius: 6,
};

export const orbPrimaryBtnStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '10px 16px',
  borderRadius: 999,
  border: '0.5px solid rgba(201, 169, 98, 0.45)',
  background: 'rgba(201, 169, 98, 0.18)',
  color: ORB_VISUAL.warmWhite,
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(201, 169, 98, 0.12)',
};

export const orbSecondaryBtnStyle: CSSProperties = {
  ...orbPrimaryBtnStyle,
  background: 'rgba(255, 252, 248, 0.08)',
  color: ORB_VISUAL.text,
  borderColor: 'rgba(255, 255, 255, 0.28)',
  boxShadow: 'none',
};

export const orbChipBtnStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '6px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '6px 8px',
  border: '0.5px solid rgba(255, 255, 255, 0.28)',
  background: 'rgba(255, 252, 248, 0.1)',
  borderRadius: 6,
  cursor: 'pointer',
  color: ORB_VISUAL.text,
};

export const orbOverlayBackdropStyle: CSSProperties = {
  background: 'rgba(8, 7, 6, 0.42)',
  backdropFilter: 'blur(14px) saturate(0.88)',
  WebkitBackdropFilter: 'blur(14px) saturate(0.88)',
};
