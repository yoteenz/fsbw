/** Creative Direction Studio™ — Scene Genesis™ interaction layer only (no architectural CSS). */

export const CDS_GENESIS_INTERACTION_STYLES = `
body.cds-genesis-active,
body.cds-stack-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.cds-genesis,
.cds-stack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f0ebe3;
  font-family: "Futura PT", sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  background: #080706;
  text-transform: uppercase;
}

.cds-genesis *,
.cds-stack * {
  text-transform: uppercase;
}

.cds-genesis input::placeholder,
.cds-genesis textarea::placeholder,
.cds-stack input::placeholder,
.cds-stack textarea::placeholder {
  text-transform: uppercase;
}

/* ── Scene Stack™ compositor (layered FAL plates — never single scene) ── */
.cds-stack__viewport {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #080706;
}

.cds-stack__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  pointer-events: none;
  user-select: none;
}

.cds-stack__layer--environment-shell { z-index: 1; }
.cds-stack__layer--signature-landmark { z-index: 2; }
.cds-stack__layer--furniture-objects { z-index: 3; }
.cds-stack__layer--lighting-systems { z-index: 4; mix-blend-mode: soft-light; opacity: 0.85; }
.cds-stack__layer--atmospheric-systems { z-index: 5; mix-blend-mode: screen; opacity: 0.55; }
.cds-stack__layer--surface-materials { z-index: 6; mix-blend-mode: overlay; opacity: 0.45; }
.cds-stack__layer--ambient-motion { z-index: 7; mix-blend-mode: screen; opacity: 0.35; animation: cds-stack-ambient-drift 12s ease-in-out infinite; }
.cds-stack__layer--founder-personalization { z-index: 8; mix-blend-mode: color; opacity: 0.25; }

/* World Compiler™ — ARTICLE-K19: structural layers mount at full opacity, no alpha stack */
.cds-stack__viewport.is-world-compiler .cds-stack__depth-stage {
  isolation: isolate;
}

.cds-stack__viewport.is-world-compiler .cds-stack__layer--wc-structural,
.cds-stack__viewport.is-world-compiler .cds-stack__layer--wc-reference {
  mix-blend-mode: normal !important;
  opacity: 1 !important;
}

.cds-stack__viewport.is-world-compiler .cds-stack__layer--wc-effect {
  mix-blend-mode: soft-light;
  opacity: 0.85;
}

.cds-stack__layer--debug-hidden {
  visibility: hidden !important;
  opacity: 0 !important;
}

.cds-stack__debug-panel {
  position: absolute;
  top: calc(var(--wh-frame-hud-h, 48px) + 8px);
  right: max(8px, env(safe-area-inset-right));
  z-index: 30;
  max-width: min(280px, 36vw);
  padding: 8px 10px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.cds-stack__debug-toggle {
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8ba4c4;
  background: transparent;
  border: 1px solid rgba(139, 164, 196, 0.4);
  padding: 4px 8px;
  cursor: pointer;
}

.cds-stack__debug-report {
  margin: 6px 0 2px;
  font-size: 7px;
  color: rgba(184, 212, 168, 0.9);
}

.cds-stack__debug-integrity {
  margin: 0 0 6px;
  font-size: 7px;
  color: rgba(212, 196, 160, 0.78);
}

.cds-stack__debug-layers {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cds-stack__debug-layer-btn {
  font-size: 6px;
  letter-spacing: 0.08em;
  padding: 3px 6px;
  border: 1px solid rgba(139, 164, 196, 0.25);
  background: rgba(0, 0, 0, 0.4);
  color: rgba(212, 196, 160, 0.75);
  cursor: pointer;
}

.cds-stack__debug-layer-btn.is-active {
  border-color: #8ba4c4;
  color: #8ba4c4;
}

/* Locked layers stay fixed once approved — no drift during later pipeline passes */
.cds-stack__layer--locked {
  transition: none !important;
  animation: none !important;
}

.cds-stack__viewport.is-pipeline-active .cds-stack__layer--locked {
  will-change: auto;
}

.cds-stack__viewport.is-pipeline-active .cds-stack__layer--environment-shell {
  z-index: 1;
  mix-blend-mode: normal;
  opacity: 1;
}

@keyframes cds-stack-ambient-drift {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.01); opacity: 0.42; }
}

.cds-stack__runtime-effects {
  position: absolute;
  inset: 0;
  z-index: 9;
  pointer-events: none;
  background: radial-gradient(ellipse 70% 50% at 50% 60%, transparent 0%, rgba(0,0,0,0.15) 100%);
}

.cds-stack__plate-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201, 169, 98, 0.05) 0%, #080706 70%);
}

.cds-stack__plate-fallback.is-pulsing {
  animation: cds-stack-plate-pulse 2.4s ease-in-out infinite;
}

@keyframes cds-stack-plate-pulse {
  0%, 100% {
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201, 169, 98, 0.05) 0%, #080706 70%);
  }
  50% {
    background: radial-gradient(ellipse 82% 62% at 50% 40%, rgba(201, 169, 98, 0.14) 0%, #0a0908 70%);
  }
}

.cds-stack__viewport.is-pipeline-active .cds-stack__viewport-vignette {
  box-shadow: inset 0 0 80px rgba(201, 169, 98, 0.06);
}

.cds-stack__pipeline-hud {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  width: min(300px, 86vw);
  z-index: 13;
  text-align: center;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(201, 169, 98, 0.28);
  pointer-events: none;
}

.cds-stack__pipeline-title {
  margin: 0 0 6px;
  font-size: 6px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.9);
}

.cds-stack__pipeline-step {
  margin: 0 0 8px;
  font-size: 7px;
  letter-spacing: 0.1em;
  color: #f0ebe3;
  animation: cds-stack-pipeline-blink 1.6s ease-in-out infinite;
}

@keyframes cds-stack-pipeline-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.cds-stack__pipeline-bar {
  height: 3px;
  margin: 0 0 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.cds-stack__pipeline-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(201, 169, 98, 0.5), rgba(201, 169, 98, 0.95));
  transition: width 0.45s ease-out;
  animation: cds-stack-bar-shimmer 1.8s ease-in-out infinite;
}

@keyframes cds-stack-bar-shimmer {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

.cds-stack__pipeline-count {
  margin: 0;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(240, 235, 227, 0.65);
}

.cds-stack__viewport-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 72%, rgba(0,0,0,0.5) 100%);
}

.cds-stack__viewport-status,
.cds-stack__viewport-hint {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  width: min(280px, 80vw);
  text-align: center;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
  z-index: 11;
  pointer-events: none;
}

.cds-stack__viewport-error {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 12;
  font-size: 6px;
  text-transform: uppercase;
}

/* Per-layer regeneration strip — regenerates one FAL layer without full stack rebuild */
.cds-stack__layer-strip {
  position: absolute;
  left: 6px;
  /* Clear centered zone nav + teaching line (nav z-index 18 sits ~0–52px) */
  bottom: max(64px, calc(56px + env(safe-area-inset-bottom, 0px)));
  z-index: 14;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: min(38%, calc(100% - 72px - env(safe-area-inset-bottom, 0px)));
  overflow-y: auto;
  padding: 4px 5px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(201, 169, 98, 0.22);
  pointer-events: auto;
  scrollbar-width: none;
}

.cds-stack__layer-strip::-webkit-scrollbar {
  display: none;
}

.cds-stack__layer-strip-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(240, 235, 227, 0.75);
}

.cds-stack__layer-strip-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.cds-stack__layer-strip-dot.is-ready {
  background: rgba(201, 169, 98, 0.85);
}

.cds-stack__layer-strip-dot.is-failed {
  background: rgba(220, 80, 80, 0.9);
}

.cds-stack__layer-strip-label {
  flex: 1;
  min-width: 0;
}

.cds-stack__layer-strip-btn {
  padding: 2px 4px;
  font-size: 5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.4);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(201, 169, 98, 0.9);
  cursor: pointer;
  font-family: inherit;
}

.cds-stack__layer-strip-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.cds-stack__layer-strip-dot.is-active {
  background: rgba(201, 169, 98, 0.95);
  animation: cds-stack-dot-pulse 1s ease-in-out infinite;
}

@keyframes cds-stack-dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.7; }
}

.cds-stack__layer-strip-row.is-generating .cds-stack__layer-strip-label,
.cds-stack__layer-strip-row.is-queued .cds-stack__layer-strip-label {
  color: rgba(201, 169, 98, 0.95);
}

.cds-stack__layer-strip-busy {
  opacity: 0.85;
  min-width: 22px;
  text-align: right;
  color: rgba(201, 169, 98, 0.9);
  animation: cds-stack-pipeline-blink 1.2s ease-in-out infinite;
}

.cds-stack__layer-strip-pending {
  opacity: 0.45;
  min-width: 22px;
  text-align: right;
}

/* Legacy genesis single-plate (deprecated) */
.cds-genesis__viewport {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #080706;
}

.cds-genesis__plate {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  pointer-events: none;
  user-select: none;
}

.cds-genesis__plate-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201, 169, 98, 0.06) 0%, #080706 70%);
}

.cds-genesis__viewport-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 72%, rgba(0,0,0,0.5) 100%);
}

.cds-genesis__viewport-status,
.cds-genesis__viewport-hint {
  position: absolute;
  left: 50%;
  top: 44%;
  transform: translate(-50%, -50%);
  width: min(280px, 80vw);
  text-align: center;
  font-size: 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.85);
  z-index: 2;
  pointer-events: none;
}

.cds-genesis__viewport-error {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 3;
  font-size: 6px;
}

.cds-genesis__viewport-error p {
  margin-bottom: 8px;
  opacity: 0.8;
}

/* ── Camera movement (physical walk) ── */
.cds-genesis__camera {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cds-genesis__camera-track {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 600vw;
  display: flex;
  flex-direction: row;
  will-change: transform;
  transition: transform 0.9s cubic-bezier(0.16, 0.84, 0.32, 1);
}

.cds-genesis__zone-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  overflow: hidden;
}

.cds-genesis__zone-panel.is-locked {
  pointer-events: none;
}

/* ── Invisible interaction layer (hotspots float in world) ── */
.cds-genesis__interaction-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.cds-genesis__hotspot {
  position: absolute;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cds-genesis__hotspot--ghost {
  background: transparent;
  border: none;
}

/* Minimal HUD */
.cds-genesis__hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: max(6px, env(safe-area-inset-top)) 10px 6px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%);
}

.cds-genesis__hud > * { pointer-events: auto; }

.cds-genesis__back {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.45);
  color: #f0ebe3;
  font-size: 12px;
  cursor: pointer;
}

.cds-genesis__identity { flex: 1; min-width: 0; }

.cds-genesis__dept {
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
}

.cds-genesis__project {
  font-family: "Covered By Your Grace", cursive;
  font-size: clamp(12px, 3.5vw, 16px);
  text-transform: uppercase;
  color: #f5f0e8;
}

.cds-genesis__pill {
  padding: 3px 7px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.35);
  color: rgba(201, 169, 98, 0.8);
  background: rgba(0,0,0,0.4);
}

.cds-genesis__pill-btn {
  cursor: pointer;
  font-family: inherit;
}

.cds-genesis__stack-btn.is-building {
  border-color: rgba(201, 169, 98, 0.65);
  color: #f0ebe3;
  background: rgba(201, 169, 98, 0.12);
  animation: cds-stack-btn-pulse 1.4s ease-in-out infinite;
  min-width: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.cds-genesis__stack-btn:disabled {
  cursor: wait;
  opacity: 1;
}

.cds-genesis__stack-spinner {
  width: 6px;
  height: 6px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  border-top-color: rgba(201, 169, 98, 0.95);
  border-radius: 50%;
  animation: cds-stack-spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes cds-stack-spin {
  to { transform: rotate(360deg); }
}

@keyframes cds-stack-btn-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(201, 169, 98, 0); }
  50% { box-shadow: 0 0 10px rgba(201, 169, 98, 0.25); }
}

/* Floor navigation */
.cds-genesis__nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 18;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 4px 6px max(6px, env(safe-area-inset-bottom));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%);
  pointer-events: none;
}

.cds-genesis__nav::-webkit-scrollbar {
  display: none;
}

.cds-genesis__nav-track {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
  justify-content: center;
  pointer-events: auto;
}

.cds-genesis__nav > * { pointer-events: auto; }

.cds-genesis__nav-btn {
  flex-shrink: 0;
  padding: 5px 9px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.5);
  color: rgba(240,235,227,0.9);
  cursor: pointer;
}

.cds-genesis__nav-btn.is-active {
  border-color: rgba(201, 169, 98, 0.6);
  color: #f5f0e8;
}

.cds-genesis__nav-btn:disabled { opacity: 0.35; }

.cds-genesis__teaching {
  position: absolute;
  left: 50%;
  bottom: 46px;
  transform: translateX(-50%);
  width: min(280px, 82vw);
  text-align: center;
  font-size: 5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
  z-index: 12;
  pointer-events: none;
}

/* ── Interaction controls (minimal · diegetic glass) ── */
.cds-genesis__glass-panel {
  background: rgba(8, 7, 6, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px;
  font-size: 6px;
}

.cds-genesis__orb-sphere {
  width: 48px;
  height: 48px;
  margin: 0 auto 6px;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.5);
  background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35) 0%, rgba(201,169,98,0.2) 45%, rgba(12,10,8,0.9) 100%);
  box-shadow: 0 0 24px rgba(201, 169, 98, 0.25);
  pointer-events: none;
}

.cds-genesis__orb-speech {
  text-align: center;
  font-size: 6px;
  line-height: 1.45;
  text-transform: uppercase;
}

.cds-genesis__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-top: 6px;
}

.cds-genesis__chip {
  padding: 3px 6px;
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.35);
}

.cds-genesis__input {
  width: 100%;
  padding: 5px 6px;
  font-size: 7px;
  text-transform: uppercase;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f0ebe3;
}

.cds-genesis__btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(0,0,0,0.45);
  color: #f0ebe3;
  cursor: pointer;
}

.cds-genesis__btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.cds-genesis__label {
  font-size: 5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
  margin-bottom: 6px;
}

.cds-genesis__mood-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cds-genesis__mood-tile {
  padding: 4px;
  font-size: 5px;
  text-transform: uppercase;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.06);
  line-height: 1.3;
}

.cds-genesis__desk-scroll,
.cds-genesis__pipeline-scroll,
.cds-genesis__library-scroll {
  max-height: 100px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cds-genesis__shelf-row {
  font-size: 5px;
  text-transform: uppercase;
  padding: 4px 0;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.cds-genesis__enter-btn {
  padding: 10px 18px;
  font-size: 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.5);
  background: rgba(0,0,0,0.5);
  color: #f0ebe3;
  cursor: pointer;
}

.cds-genesis--review-mode .cds-genesis__viewport-vignette {
  background: linear-gradient(180deg, rgba(201,169,98,0.12) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%);
}

/* Pipeline mission control — interaction styling only */
.cds-genesis .cds-pipeline-mission .gb-immersive__pipeline-row {
  background: rgba(0,0,0,0.35);
  border-left: 2px solid rgba(201, 169, 98, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .cds-genesis__camera-track { transition: none; }
}
`;

/** Ndxbook Creative Direction Studio™ workspace + embedded strip */
export const CDS_WORKSPACE_TEXT_STYLES = `
.creative-direction-studio-root,
.creative-direction-studio-root * {
  text-transform: uppercase;
}

.creative-direction-studio-root input::placeholder,
.creative-direction-studio-root textarea::placeholder {
  text-transform: uppercase;
}
`;
