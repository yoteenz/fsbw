/** Creative Direction Studio™ — Environmental Production Pass V1 (mobile-safe CSS). */

export const CDS_V2_STYLES = `
body.cds-v2-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.cds-v2 {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f0ebe3;
  font-family: "Futura PT", sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  perspective: 1200px;
}

/* ── Global atmosphere ── */
.cds-v2__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 100% 42% at 50% -8%, rgba(201, 169, 98, 0.18) 0%, transparent 62%),
    radial-gradient(ellipse 60% 35% at 20% 80%, rgba(90, 72, 48, 0.12) 0%, transparent 55%),
    radial-gradient(ellipse 50% 30% at 85% 70%, rgba(70, 90, 110, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #1e1b18 0%, #141210 42%, #080706 100%);
}

.cds-v2__atmosphere::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.008) 3px,
    rgba(255, 255, 255, 0.008) 4px
  );
  opacity: 0.4;
}

/* ── Camera · physical movement ── */
.cds-v2__camera {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cds-v2__camera-track {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 600vw;
  display: flex;
  flex-direction: row;
  will-change: transform;
  transition: transform 0.85s cubic-bezier(0.16, 0.84, 0.32, 1);
}

.cds-v2__zone-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  overflow: hidden;
  transform-style: preserve-3d;
}

.cds-v2__zone-panel.is-locked {
  opacity: 0.28;
  pointer-events: none;
  filter: saturate(0.6);
}

.cds-v2__zone-panel.is-active {
  opacity: 1;
}

/* ── Architectural shell (per zone) ── */
.cds-env__ceiling {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 22%;
  pointer-events: none;
  z-index: 1;
  background: linear-gradient(180deg, #2a2622 0%, #1a1816 55%, transparent 100%);
}

.cds-env__ceiling--tall {
  height: 26%;
}

.cds-env__ceiling-coffer {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 4%;
  height: 48%;
  border: 1px solid rgba(201, 169, 98, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%),
    repeating-linear-gradient(
      90deg,
      rgba(201, 169, 98, 0.04) 0,
      rgba(201, 169, 98, 0.04) 1px,
      transparent 1px,
      transparent 24px
    );
  box-shadow: inset 0 -20px 40px rgba(0, 0, 0, 0.35);
}

.cds-env__skylight {
  position: absolute;
  left: 25%;
  right: 25%;
  top: 0;
  height: 18%;
  background: radial-gradient(ellipse 80% 100% at 50% 0%, var(--cds-zone-light, rgba(201, 169, 98, 0.14)) 0%, transparent 72%);
  animation: cds-env-light-breathe 8s ease-in-out infinite;
}

@keyframes cds-env-light-breathe {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}

.cds-env__column {
  position: absolute;
  top: 12%;
  bottom: 22%;
  width: 5%;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(180deg, #4a4038 0%, #2e2824 40%, #1e1a18 100%);
  border: 1px solid rgba(201, 169, 98, 0.15);
  box-shadow: inset -2px 0 8px rgba(0, 0, 0, 0.4), 4px 0 16px rgba(0, 0, 0, 0.25);
}

.cds-env__column--left { left: 2%; }
.cds-env__column--right { right: 2%; }

.cds-env__volumetric {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 18%;
  bottom: 30%;
  pointer-events: none;
  z-index: 3;
  background: radial-gradient(ellipse 70% 50% at 50% 40%, rgba(201, 169, 98, 0.04) 0%, transparent 70%);
  animation: cds-env-volumetric-drift 12s ease-in-out infinite;
}

@keyframes cds-env-volumetric-drift {
  0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.6; }
  50% { transform: translate3d(2%, -1%, 0); opacity: 0.85; }
}

.cds-env__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  overflow: hidden;
}

.cds-env__particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(255, 240, 220, 0.35);
  left: calc(10% + (var(--i) * 8.5%));
  top: calc(15% + (var(--i) * 6%));
  animation: cds-env-particle-float calc(6s + var(--i) * 0.7s) ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.9s);
}

@keyframes cds-env-particle-float {
  0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.2; }
  50% { transform: translate3d(4px, -12px, 0); opacity: 0.55; }
}

.cds-env__floor-stone {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 26%;
  pointer-events: none;
  z-index: 2;
  border-top: 1px solid rgba(201, 169, 98, 0.28);
  background:
    linear-gradient(180deg, rgba(90, 82, 72, 0.15) 0%, rgba(18, 16, 14, 0.92) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.02) 0,
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 48px
    );
}

.cds-env__floor-reflection {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.08) 0%, transparent 100%);
  animation: cds-env-reflection-sweep 10s ease-in-out infinite;
}

@keyframes cds-env-reflection-sweep {
  0%, 100% { opacity: 0.35; transform: scaleX(0.92); }
  50% { opacity: 0.7; transform: scaleX(1); }
}

.cds-env__zone-horizon {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 24%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.35), transparent);
  pointer-events: none;
  z-index: 3;
}

/* ── Minimal HUD ── */
.cds-v2__hud {
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
  background: linear-gradient(180deg, rgba(8, 7, 6, 0.65) 0%, transparent 100%);
}

.cds-v2__hud > * { pointer-events: auto; }

.cds-v2__back {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(14, 12, 10, 0.75);
  color: rgba(240, 235, 227, 0.9);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.cds-v2__identity {
  flex: 1;
  min-width: 0;
  opacity: 0.85;
}

.cds-v2__dept {
  font-size: 6px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cds-v2__project {
  font-family: "Covered By Your Grace", cursive;
  font-size: clamp(12px, 3.5vw, 16px);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cds-v2__pill {
  flex-shrink: 0;
  padding: 3px 7px;
  font-size: 5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(201, 169, 98, 0.06);
  color: rgba(201, 169, 98, 0.75);
  white-space: nowrap;
}

/* ── Diegetic floor navigation ── */
.cds-v2__nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 18;
  display: flex;
  gap: 3px;
  padding: 4px 6px max(6px, env(safe-area-inset-bottom));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: linear-gradient(0deg, rgba(8, 7, 6, 0.95) 0%, rgba(8, 7, 6, 0.4) 70%, transparent 100%);
  pointer-events: none;
}

.cds-v2__nav::-webkit-scrollbar { display: none; }
.cds-v2__nav > * { pointer-events: auto; }

.cds-v2__nav-btn {
  flex-shrink: 0;
  padding: 5px 9px;
  font-size: 5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-bottom: 2px solid rgba(201, 169, 98, 0.35);
  background: rgba(30, 26, 22, 0.88);
  color: rgba(240, 235, 227, 0.85);
  cursor: pointer;
}

.cds-v2__nav-btn.is-active {
  border-color: rgba(201, 169, 98, 0.55);
  border-bottom-color: rgba(201, 169, 98, 0.85);
  background: rgba(201, 169, 98, 0.12);
  color: #f5f0e8;
  box-shadow: 0 0 12px rgba(201, 169, 98, 0.15);
}

.cds-v2__nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cds-v2__teaching {
  position: absolute;
  left: 50%;
  bottom: 48px;
  transform: translateX(-50%);
  width: min(300px, 82vw);
  text-align: center;
  font-size: 5px;
  line-height: 1.5;
  letter-spacing: 0.06em;
  opacity: 0.55;
  z-index: 12;
  pointer-events: none;
}

/* ═══════════════════════════════════════
   ARRIVAL — Hero: The Orb™
   ═══════════════════════════════════════ */
.cds-v2__arrival-threshold {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  width: min(340px, 88vw);
  text-align: center;
  z-index: 8;
}

.cds-v2__arrival-arch {
  position: relative;
  height: 140px;
  margin: 0 auto 16px;
  border: 2px solid rgba(201, 169, 98, 0.4);
  border-bottom: none;
  border-radius: 140px 140px 0 0;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.1) 0%, rgba(30, 26, 22, 0.4) 60%, transparent 100%);
  box-shadow: inset 0 -30px 50px rgba(0, 0, 0, 0.3);
}

.cds-v2__arrival-orb-hero {
  position: absolute;
  left: 50%;
  top: 28%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  z-index: 10;
}

.cds-v2__arrival-orb-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.25) 0%, transparent 70%);
  animation: cds-orb-glow-pulse 5s ease-in-out infinite;
}

.cds-v2__arrival-orb-sphere {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 8px auto 0;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.65);
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.45) 0%, transparent 35%),
    radial-gradient(circle at 50% 50%, rgba(201, 169, 98, 0.35) 0%, rgba(40, 34, 28, 0.95) 65%, rgba(12, 10, 8, 1) 100%);
  box-shadow: 0 0 40px rgba(201, 169, 98, 0.25), inset 0 -8px 20px rgba(0, 0, 0, 0.5);
  animation: cds-orb-rotate 20s linear infinite;
}

.cds-v2__arrival-orb-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 50%;
  animation: cds-orb-ring-spin 24s linear infinite reverse;
}

@keyframes cds-orb-glow-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes cds-orb-rotate {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes cds-orb-ring-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cds-v2__arrival-sign {
  font-size: 7px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
}

.cds-v2__arrival-copy {
  margin-top: 10px;
  font-size: 6px;
  line-height: 1.55;
  opacity: 0.72;
}

.cds-v2__arrival-peek {
  position: absolute;
  left: 50%;
  top: 62%;
  transform: translateX(-50%);
  width: 76%;
  height: 72px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background:
    linear-gradient(180deg, rgba(60, 52, 44, 0.25) 0%, rgba(0, 0, 0, 0.4) 100%),
    repeating-linear-gradient(90deg, rgba(201, 169, 98, 0.06) 0, rgba(201, 169, 98, 0.06) 2px, transparent 2px, transparent 20px);
  pointer-events: none;
  z-index: 5;
}

.cds-v2__arrival-peek::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.15), transparent);
  animation: cds-env-reflection-sweep 8s ease-in-out infinite;
}

.cds-v2__enter-btn {
  margin-top: 16px;
  padding: 10px 20px;
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.1);
  color: #f0ebe3;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

/* ═══════════════════════════════════════
   STORY TABLE — Hero: floating creative altar
   ═══════════════════════════════════════ */
.cds-v2__story-table {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: min(320px, 82vw);
  height: 160px;
  z-index: 6;
}

.cds-v2__table-float {
  position: absolute;
  left: 50%;
  bottom: 52px;
  transform: translateX(-50%);
  width: 92%;
  height: 56px;
  border: 1px solid rgba(201, 169, 98, 0.4);
  background:
    linear-gradient(180deg, rgba(80, 70, 58, 0.35) 0%, rgba(22, 18, 16, 0.9) 100%);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 -1px 0 rgba(201, 169, 98, 0.2);
  animation: cds-table-float 6s ease-in-out infinite;
}

@keyframes cds-table-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.cds-v2__table-float::before {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  top: -24px;
  height: 24px;
  background: linear-gradient(180deg, transparent, rgba(201, 169, 98, 0.08));
  filter: blur(4px);
}

.cds-v2__table-surface {
  position: absolute;
  left: 50%;
  bottom: 52px;
  transform: translateX(-50%);
  width: 92%;
  height: 56px;
  pointer-events: none;
}

.cds-v2__table-projections {
  position: absolute;
  left: 50%;
  bottom: 112px;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  pointer-events: none;
}

.cds-v2__table-projection {
  padding: 4px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(201, 169, 98, 0.08);
  color: rgba(240, 235, 227, 0.9);
  animation: cds-projection-flicker calc(4s + var(--p-i, 0) * 0.5s) ease-in-out infinite;
  animation-delay: calc(var(--p-i, 0) * -1.2s);
  box-shadow: 0 0 16px rgba(201, 169, 98, 0.12);
}

@keyframes cds-projection-flicker {
  0%, 100% { opacity: 0.65; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}

.cds-v2__orb-anchor {
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  width: 96px;
  height: 96px;
  z-index: 10;
  pointer-events: none;
}

.cds-v2__orb-spotlight {
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  width: 140px;
  height: 80px;
  background: radial-gradient(ellipse 50% 100% at 50% 0%, rgba(201, 169, 98, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.cds-v2__orb-sphere {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.65);
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.42) 0%, transparent 38%),
    radial-gradient(circle at 50% 50%, rgba(201, 169, 98, 0.3) 0%, rgba(28, 24, 20, 0.95) 100%);
  box-shadow: 0 0 32px rgba(201, 169, 98, 0.3);
  animation: cds-orb-host-pulse 4s ease-in-out infinite, cds-orb-rotate 24s linear infinite;
}

@keyframes cds-orb-host-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.cds-v2__orb-speech {
  position: absolute;
  left: 50%;
  top: 72px;
  transform: translateX(-50%);
  width: min(300px, 80vw);
  text-align: center;
  font-size: 6px;
  line-height: 1.5;
}

.cds-v2__table-chips {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.cds-v2__table-chip {
  padding: 3px 7px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(240, 235, 227, 0.85);
}

/* ═══════════════════════════════════════
   MOOD WALL — Hero: 30-foot editorial wall
   ═══════════════════════════════════════ */
.cds-v2__mood-wall {
  position: absolute;
  left: 7%;
  top: 12%;
  width: 86%;
  height: 64%;
  z-index: 6;
  display: flex;
  flex-direction: column;
}

.cds-v2__mood-wall-frame {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-left: 4px solid rgba(201, 169, 98, 0.6);
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  background:
    linear-gradient(180deg, rgba(36, 32, 28, 0.95) 0%, rgba(14, 12, 10, 0.92) 100%),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.015) 0,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 32px
    );
  box-shadow:
    inset 0 0 60px rgba(0, 0, 0, 0.4),
    0 8px 32px rgba(0, 0, 0, 0.35);
  padding: 8px;
}

.cds-v2__mood-wall-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.15);
}

.cds-v2__mood-wall-label {
  font-size: 6px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
}

.cds-v2__mood-wall-scale {
  font-size: 5px;
  letter-spacing: 0.1em;
  opacity: 0.45;
  text-transform: uppercase;
}

.cds-v2__mood-wall-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  gap: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cds-v2__mood-tile {
  position: relative;
  min-height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 5px;
  font-size: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  animation: cds-mood-tile-breathe calc(5s + var(--tile-i, 0) * 0.4s) ease-in-out infinite;
  animation-delay: calc(var(--tile-i, 0) * -0.8s);
}

.cds-v2__mood-tile--ambient {
  opacity: 0.75;
}

.cds-v2__mood-tile--ambient::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--tile-accent, #2a2420) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.cds-v2__mood-tile--user {
  background: rgba(0, 0, 0, 0.35);
}

.cds-v2__mood-tile--user::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.08) 0%, transparent 50%);
  animation: cds-env-reflection-sweep 7s ease-in-out infinite;
}

@keyframes cds-mood-tile-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
}

.cds-v2__mood-tile-cat {
  position: relative;
  z-index: 1;
  font-size: 4px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
  margin-bottom: 2px;
}

.cds-v2__mood-tile-title {
  position: relative;
  z-index: 1;
  line-height: 1.3;
}

.cds-v2__mood-tile-remove {
  position: relative;
  z-index: 2;
  align-self: flex-start;
  margin-top: 3px;
  font-size: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: none;
  border: none;
  color: rgba(240, 235, 227, 0.5);
  cursor: pointer;
  padding: 0;
}

.cds-v2__mood-console {
  margin-top: 6px;
  padding: 6px;
  border-top: 1px solid rgba(201, 169, 98, 0.12);
  background: rgba(8, 7, 6, 0.6);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cds-v2__mood-console-label {
  font-size: 4px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.45;
}

/* ═══════════════════════════════════════
   NOTES DESK — Hero: executive workstation
   ═══════════════════════════════════════ */
.cds-v2__notes-desk {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  width: min(340px, 88vw);
  z-index: 6;
}

.cds-v2__desk-scene {
  position: relative;
  padding-top: 28px;
}

.cds-v2__desk-lamp {
  position: absolute;
  left: 6%;
  top: 0;
  width: 48px;
  height: 48px;
  pointer-events: none;
}

.cds-v2__desk-lamp-shade {
  position: absolute;
  left: 8px;
  top: 0;
  width: 28px;
  height: 14px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #4a4038 0%, #2e2824 100%);
  border: 1px solid rgba(201, 169, 98, 0.2);
}

.cds-v2__desk-lamp-beam {
  position: absolute;
  left: 0;
  top: 12px;
  width: 44px;
  height: 60px;
  background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255, 220, 160, 0.28) 0%, transparent 75%);
  animation: cds-env-light-breathe 6s ease-in-out infinite;
}

.cds-v2__desk-props {
  position: absolute;
  right: 4%;
  top: 8px;
  display: flex;
  gap: 6px;
  pointer-events: none;
}

.cds-v2__desk-prop-coffee {
  width: 14px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 4px 4px;
  background: linear-gradient(180deg, #3a3228 0%, #1e1a18 100%);
}

.cds-v2__desk-prop-tablet {
  width: 22px;
  height: 16px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: linear-gradient(135deg, rgba(80, 90, 100, 0.3) 0%, rgba(20, 18, 16, 0.8) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cds-v2__desk-prop-recorder {
  width: 16px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #2a2622;
}

.cds-v2__desk-surface {
  padding: 14px 12px 12px;
  border: 1px solid rgba(201, 169, 98, 0.28);
  background:
    linear-gradient(165deg, rgba(48, 40, 34, 0.98) 0%, rgba(20, 18, 16, 0.95) 100%);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.cds-v2__desk-surface::before {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  top: 36px;
  height: 1px;
  background: rgba(201, 169, 98, 0.1);
}

.cds-v2__desk-label {
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.85);
  margin-bottom: 8px;
}

.cds-v2__desk-notebook {
  position: absolute;
  left: -8px;
  bottom: -6px;
  width: 36px;
  height: 48px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: linear-gradient(180deg, #3a3228 0%, #2a2420 100%);
  transform: rotate(-4deg);
  pointer-events: none;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.35);
}

.cds-v2__desk-scroll {
  max-height: 120px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 8px;
}

.cds-v2__desk-note-row {
  margin-top: 6px;
  font-size: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 5px;
  line-height: 1.4;
}

.cds-v2__desk-note-actions {
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

.cds-v2__desk-note-actions button {
  font-size: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: none;
  border: none;
  color: rgba(201, 169, 98, 0.7);
  cursor: pointer;
  padding: 0;
}

/* ═══════════════════════════════════════
   PIPELINE — Hero: mission control wall
   ═══════════════════════════════════════ */
.cds-v2__pipeline-wall {
  position: absolute;
  left: 5%;
  top: 11%;
  width: 90%;
  height: 66%;
  z-index: 6;
  display: flex;
  flex-direction: column;
}

.cds-v2__pipeline-frame {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(201, 169, 98, 0.22);
  background:
    linear-gradient(180deg, rgba(24, 22, 20, 0.97) 0%, rgba(8, 7, 6, 0.95) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(201, 169, 98, 0.03) 0,
      rgba(201, 169, 98, 0.03) 1px,
      transparent 1px,
      transparent 40px
    );
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
  padding: 8px;
}

.cds-v2__pipeline-frame::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 10px;
  right: 10px;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    rgba(201, 169, 98, 0.5) 0,
    rgba(201, 169, 98, 0.5) 6px,
    transparent 6px,
    transparent 12px
  );
  pointer-events: none;
}

.cds-v2__pipeline-status-lights {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  padding-top: 4px;
}

.cds-v2__pipeline-light {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(60, 55, 50, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cds-v2__pipeline-light.is-live {
  background: rgba(120, 200, 140, 0.9);
  box-shadow: 0 0 8px rgba(120, 200, 140, 0.5);
  animation: cds-pipeline-light-pulse 2s ease-in-out infinite;
}

@keyframes cds-pipeline-light-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.cds-v2__pipeline-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Mission control overrides inside CDS */
.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline {
  max-height: none;
  gap: 6px;
}

.cds-v2 .cds-pipeline-mission .gb-immersive__object-label {
  font-size: 6px;
  letter-spacing: 0.18em;
  color: rgba(201, 169, 98, 0.95);
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-sub {
  opacity: 0.5;
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-list {
  gap: 3px;
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-row {
  grid-template-columns: 22px 1fr auto;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.25);
  border-left: 3px solid rgba(60, 55, 50, 0.8);
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-row.is-active {
  border-left-color: rgba(201, 169, 98, 0.85);
  background: rgba(201, 169, 98, 0.08);
  box-shadow: 0 0 16px rgba(201, 169, 98, 0.1);
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-row.is-done {
  border-left-color: rgba(120, 200, 140, 0.7);
  opacity: 0.75;
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-row.is-locked {
  opacity: 0.4;
}

.cds-v2 .cds-pipeline-mission .gb-immersive__pipeline-detail {
  border-top: 1px solid rgba(201, 169, 98, 0.15);
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
}

/* ═══════════════════════════════════════
   LIBRARY — Hero: luxury archive
   ═══════════════════════════════════════ */
.cds-v2__library-zone {
  position: absolute;
  left: 7%;
  top: 14%;
  width: 86%;
  height: 62%;
  z-index: 6;
}

.cds-v2__library-header {
  font-size: 6px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.9);
  margin-bottom: 8px;
}

.cds-v2__library {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  height: calc(100% - 20px);
}

.cds-v2__shelf-unit {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(32, 28, 24, 0.9) 0%, rgba(16, 14, 12, 0.95) 100%);
  padding: 6px;
  min-height: 0;
  box-shadow: inset 0 -8px 16px rgba(0, 0, 0, 0.3);
}

.cds-v2__shelf-label {
  font-size: 5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.8);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.12);
}

.cds-v2__shelf-drawer {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.cds-v2__volume-spine {
  flex-shrink: 0;
  height: 22px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  font-size: 4px;
  letter-spacing: 0.04em;
  line-height: 1.2;
  border-left: 3px solid rgba(201, 169, 98, 0.5);
  background: linear-gradient(90deg, var(--spine-tone, #2a2420) 0%, rgba(0, 0, 0, 0.4) 100%);
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
}

.cds-v2__volume-spine--user {
  border-left-color: rgba(201, 169, 98, 0.75);
}

.cds-v2__shelf-empty {
  font-size: 5px;
  opacity: 0.4;
  line-height: 1.4;
  padding: 4px;
}

/* ── Shared diegetic controls ── */
.cds-v2__input {
  width: 100%;
  padding: 5px 6px;
  font-size: 7px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f0ebe3;
}

.cds-v2__input::placeholder {
  color: rgba(240, 235, 227, 0.35);
}

.cds-v2__btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(201, 169, 98, 0.08);
  color: #f0ebe3;
  cursor: pointer;
}

.cds-v2__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cds-v2__btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

/* Review mode atmosphere */
.cds-v2--review-mode .cds-v2__atmosphere {
  background:
    radial-gradient(ellipse 65% 48% at 50% 40%, rgba(201, 169, 98, 0.22) 0%, transparent 65%),
    linear-gradient(180deg, #1e1b18 0%, #141210 42%, #080706 100%);
}

.cds-v2--review-mode .cds-v2__orb-sphere {
  box-shadow: 0 0 48px rgba(201, 169, 98, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .cds-v2__camera-track { transition: none; }
  .cds-v2__orb-sphere,
  .cds-v2__arrival-orb-sphere,
  .cds-env__skylight,
  .cds-env__volumetric,
  .cds-env__particle,
  .cds-env__floor-reflection,
  .cds-v2__mood-tile,
  .cds-v2__table-float,
  .cds-v2__table-projection,
  .cds-v2__pipeline-light.is-live {
    animation: none !important;
  }
}

@media (max-width: 767px) {
  .cds-v2__library {
    grid-template-columns: repeat(2, 1fr);
  }

  .cds-v2__mood-wall-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cds-v2__pipeline-wall {
    height: 64%;
  }

  .cds-env__column {
    width: 3%;
  }
}
`;
