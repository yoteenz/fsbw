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
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.28); filter: blur(8px) brightness(1.5); }
  35% { opacity: 0.88; filter: blur(2px) brightness(1.22); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0) brightness(1); }
}
@keyframes studio-orb-projection-dismiss {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.55); filter: blur(10px); }
}
@keyframes studio-orb-projection-icon {
  0% { opacity: 0; transform: rotate(-10deg) scale(0.5); }
  55% { opacity: 1; transform: rotate(2deg) scale(1.04); }
  100% { opacity: 1; transform: rotate(0deg) scale(1); }
}
@keyframes studio-orb-projection-label {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes studio-orb-tile-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2.5px); }
}
@keyframes studio-orb-tile-refraction {
  0%, 100% { opacity: 0.55; transform: translateX(0); }
  50% { opacity: 0.85; transform: translateX(1px); }
}
@keyframes studio-orb-tile-light-sweep {
  0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  35% { opacity: 0.75; }
  100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
}
@keyframes sw-hero-icon-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-1.2px) rotate(0.6deg); }
  66% { transform: translateY(0.4px) rotate(-0.4deg); }
}
@keyframes sw-hero-icon-core-pulse {
  0%, 100% { opacity: 0.65; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.12); }
}
@keyframes sw-hero-icon-caustic-drift {
  0%, 100% { opacity: 0.25; transform: translate(0, 0); }
  50% { opacity: 0.55; transform: translate(1px, -1px); }
}
@keyframes sw-hero-icon-orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes sw-hero-icon-wave {
  0%, 100% { opacity: 0.35; transform: scaleX(1); }
  50% { opacity: 0.75; transform: scaleX(1.06); }
}
@keyframes sw-hero-icon-energy-travel {
  0% { opacity: 0; transform: scale(0.85); filter: brightness(1); }
  40% { opacity: 1; transform: scale(1.06); filter: brightness(1.35); }
  100% { opacity: 0.85; transform: scale(1); filter: brightness(1.08); }
}
@keyframes sw-hero-icon-selection-bloom {
  0% { opacity: 0; transform: scale(0.6); }
  50% { opacity: 0.85; transform: scale(1.15); }
  100% { opacity: 0; transform: scale(1.35); }
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
  animation: studio-orb-projection-emerge 0.58s cubic-bezier(0.22, 1, 0.36, 1) backwards,
    studio-orb-tile-float 7.5s ease-in-out 0.58s infinite;
  border: none; background: transparent; padding: 0; cursor: pointer; z-index: 100049;
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.studio-orb-projection.is-dismissing { animation: studio-orb-projection-dismiss 0.38s ease-in forwards; }
.studio-orb-projection__float-shadow {
  position: absolute; bottom: calc(50% - 30px); left: 50%; width: 44px; height: 10px;
  transform: translate(-50%, 100%);
  background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,0,0,0.28) 0%, transparent 72%);
  filter: blur(3px); pointer-events: none; opacity: 0.65;
  animation: studio-orb-tile-float 7.5s ease-in-out infinite reverse;
}
.studio-orb-projection__beam {
  position: absolute; bottom: 50%; left: 50%; width: 1px; height: 32px;
  background: linear-gradient(to top, rgba(201,169,98,0.55), rgba(255,252,248,0.08), transparent);
  transform: translate(-50%, 100%); pointer-events: none; opacity: 0.75;
}
.studio-orb-projection__glass {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 58px; height: 58px; border-radius: 18px;
  background:
    linear-gradient(148deg, rgba(255,255,255,0.52) 0%, rgba(255,252,248,0.06) 38%, rgba(255,248,240,0.22) 100%);
  backdrop-filter: blur(26px) saturate(1.65) brightness(1.14);
  -webkit-backdrop-filter: blur(26px) saturate(1.65) brightness(1.14);
  border: 0.5px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    0 18px 48px rgba(0,0,0,0.34),
    0 6px 16px rgba(201,169,98,0.08),
    inset 0 1px 0 rgba(255,255,255,0.78),
    inset 0 -3px 12px rgba(201,169,98,0.07);
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.48s ease, filter 0.48s ease;
  overflow: hidden;
  transform-style: preserve-3d;
}
.studio-orb-projection:hover .studio-orb-projection__glass {
  transform: translateY(-3px) rotateX(4deg) rotateY(-3deg) scale(1.04);
  box-shadow:
    0 22px 56px rgba(0,0,0,0.38),
    0 0 36px rgba(201,169,98,0.18),
    inset 0 1px 0 rgba(255,255,255,0.85);
  filter: brightness(1.06);
}
.studio-orb-projection:active .studio-orb-projection__glass {
  transform: translateY(1px) scale(0.96);
  transition-duration: 0.12s;
}
.studio-orb-projection.is-selected .studio-orb-projection__glass {
  transform: scale(1.08);
  box-shadow:
    0 24px 60px rgba(0,0,0,0.4),
    0 0 44px rgba(201,169,98,0.28),
    inset 0 1px 0 rgba(255,255,255,0.9);
}
.studio-orb-projection__refraction-edge {
  position: absolute; inset: 0; border-radius: 18px; pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.65) 0%, transparent 28%, transparent 72%, rgba(136,200,255,0.22) 100%);
  opacity: 0.55;
  animation: studio-orb-tile-refraction 5.5s ease-in-out infinite;
}
.studio-orb-projection__chrome-edge {
  position: absolute; inset: 0; border-radius: 18px;
  border: 0.5px solid rgba(201, 169, 98, 0.42); pointer-events: none;
  box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.35);
}
.studio-orb-projection__frost {
  position: absolute; inset: 6px; border-radius: 13px; pointer-events: none;
  background: radial-gradient(circle at 50% 42%, rgba(255,252,248,0.38) 0%, rgba(255,248,240,0.12) 45%, transparent 72%);
}
.studio-orb-projection__depth {
  position: absolute; inset: 0; border-radius: 18px; pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.06) 100%);
}
.studio-orb-projection__reflection {
  position: absolute; top: 0; left: 0; width: 55%; height: 45%; border-radius: 18px 0 40% 0;
  background: linear-gradient(125deg, rgba(255,255,255,0.55) 0%, transparent 70%);
  pointer-events: none; opacity: 0.7;
}
.studio-orb-projection:hover .studio-orb-projection__reflection::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.45) 48%, transparent 100%);
  animation: studio-orb-tile-light-sweep 2.4s ease-in-out infinite;
}
.studio-orb-projection__icon-wrap {
  animation: studio-orb-projection-icon 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  z-index: 2; position: relative;
  perspective: 120px;
}
.studio-orb-projection__glow {
  position: absolute; inset: 8px; border-radius: 12px;
  background: radial-gradient(circle at 50% 28%, rgba(255,248,240,0.42) 0%, transparent 68%);
  pointer-events: none; z-index: 0;
  animation: studio-orb-breathe 5.8s ease-in-out infinite;
}
.studio-orb-projection__caustic {
  position: absolute; inset: 0; border-radius: 18px; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse 70% 50% at 68% 78%, rgba(201,169,98,0.22) 0%, transparent 58%);
  mix-blend-mode: soft-light;
  animation: sw-hero-icon-caustic-drift 6.5s ease-in-out infinite;
}
.studio-orb-projection__particles {
  position: absolute; inset: 0; border-radius: 18px; opacity: 0.4; pointer-events: none; z-index: 1;
  background-image:
    radial-gradient(circle at 28% 38%, rgba(255,255,255,0.75) 0.5px, transparent 1px),
    radial-gradient(circle at 72% 62%, rgba(255,248,240,0.65) 0.4px, transparent 0.8px);
  animation: studio-orb-particle-drift 9s ease-in-out infinite;
}
.studio-orb-projection__selection-bloom {
  position: absolute; inset: -4px; border-radius: 22px; pointer-events: none; z-index: 0;
  background: radial-gradient(circle, rgba(201,169,98,0.35) 0%, transparent 68%);
  opacity: 0;
}
.studio-orb-projection.is-selected .studio-orb-projection__selection-bloom {
  animation: sw-hero-icon-selection-bloom 0.65s ease-out forwards;
}
.studio-orb-projection__label {
  animation: studio-orb-projection-label 0.48s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

/* Studio World Hero Icon Library™ — sculptural object behavior */
.sw-hero-icon {
  display: inline-flex; align-items: center; justify-content: center;
  position: relative; width: 100%; height: 100%;
  animation: sw-hero-icon-float 8.5s ease-in-out infinite;
  transform-style: preserve-3d;
}
.sw-hero-icon__sculpture { position: relative; z-index: 1; }
.sw-hero-icon__caustic {
  position: absolute; inset: -4px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle at 60% 70%, rgba(201,169,98,0.18) 0%, transparent 65%);
  animation: sw-hero-icon-caustic-drift 7s ease-in-out infinite;
}
.sw-hero-icon__bloom {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(255,248,235,0.2) 0%, transparent 70%);
  animation: studio-orb-breathe 6.2s ease-in-out infinite;
}
.sw-hero-icon__core-light { animation: sw-hero-icon-core-pulse 4.8s ease-in-out infinite; }
.sw-hero-icon__orbit { transform-origin: 24px 24px; animation: sw-hero-icon-orbit-spin 18s linear infinite; }
.sw-hero-icon__orbit--alt { animation-duration: 24s; animation-direction: reverse; }
.sw-hero-icon__wave { animation: sw-hero-icon-wave 3.2s ease-in-out infinite; }
.sw-hero-icon__wave--alt { animation-delay: 0.8s; }
.studio-orb-projection:hover .sw-hero-icon {
  animation: sw-hero-icon-float 3.5s ease-in-out infinite;
}
.studio-orb-projection:hover .sw-hero-icon__sculpture {
  transform: rotateY(-6deg) rotateX(4deg) translateY(-1px);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.sw-hero-icon--selected,
.studio-orb-projection.is-selected .sw-hero-icon {
  animation: sw-hero-icon-energy-travel 0.55s ease-out forwards;
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
