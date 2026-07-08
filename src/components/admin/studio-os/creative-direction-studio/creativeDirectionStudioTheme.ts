/** Creative Direction Studio™ V2 — spatial department scene (lightweight, iPhone-safe). */

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
}

.cds-v2__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 90% 55% at 50% 0%, rgba(201, 169, 98, 0.14) 0%, transparent 58%),
    linear-gradient(180deg, #2a2622 0%, #1a1816 48%, #0e0c0a 100%);
}

.cds-v2__camera {
  position: absolute;
  inset: 0;
  overflow: hidden;
  will-change: transform;
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
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.cds-v2__zone-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  overflow: hidden;
}

.cds-v2__zone-panel.is-locked {
  opacity: 0.35;
  pointer-events: none;
}

.cds-v2__zone-panel.is-active {
  opacity: 1;
}

.cds-v2__zone-floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28%;
  border-top: 1px solid rgba(201, 169, 98, 0.22);
  background: linear-gradient(180deg, rgba(245, 240, 232, 0.06) 0%, rgba(8, 7, 6, 0.65) 100%);
  pointer-events: none;
}

.cds-v2__zone-wall {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 14%;
  bottom: 30%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(12, 10, 9, 0.5) 100%);
  pointer-events: none;
}

.cds-v2__zone-horizon {
  position: absolute;
  left: 0;
  right: 0;
  top: 13%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.3), transparent);
  pointer-events: none;
}

/* HUD */
.cds-v2__hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: max(8px, env(safe-area-inset-top)) 12px 8px;
  pointer-events: none;
}

.cds-v2__hud > * {
  pointer-events: auto;
}

.cds-v2__back {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.5);
  background: rgba(14, 12, 10, 0.88);
  color: #f0ebe3;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.cds-v2__identity {
  flex: 1;
  min-width: 0;
}

.cds-v2__dept {
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cds-v2__project {
  font-family: "Covered By Your Grace", cursive;
  font-size: clamp(14px, 4vw, 18px);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cds-v2__pill {
  flex-shrink: 0;
  padding: 4px 8px;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(201, 169, 98, 0.1);
  color: rgba(201, 169, 98, 0.95);
  white-space: nowrap;
}

/* Zone navigation — floor diegetic nav, not floating panel */
.cds-v2__nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 18;
  display: flex;
  gap: 4px;
  padding: 6px 8px max(8px, env(safe-area-inset-bottom));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: linear-gradient(0deg, rgba(8, 7, 6, 0.92) 0%, transparent 100%);
  pointer-events: none;
}

.cds-v2__nav::-webkit-scrollbar {
  display: none;
}

.cds-v2__nav > * {
  pointer-events: auto;
}

.cds-v2__nav-btn {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(12, 10, 9, 0.82);
  color: #f0ebe3;
  cursor: pointer;
}

.cds-v2__nav-btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  background: rgba(201, 169, 98, 0.16);
}

.cds-v2__nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.cds-v2__teaching {
  position: absolute;
  left: 50%;
  bottom: 52px;
  transform: translateX(-50%);
  width: min(320px, 84vw);
  text-align: center;
  font-size: 6px;
  line-height: 1.45;
  opacity: 0.72;
  z-index: 12;
  pointer-events: none;
}

/* Arrival Zone™ */
.cds-v2__arrival-threshold {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  width: min(340px, 88vw);
  text-align: center;
  z-index: 8;
}

.cds-v2__arrival-arch {
  height: 120px;
  margin: 0 auto 12px;
  border: 2px solid rgba(201, 169, 98, 0.45);
  border-bottom: none;
  border-radius: 120px 120px 0 0;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.08) 0%, transparent 70%);
}

.cds-v2__arrival-sign {
  font-size: 7px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
}

.cds-v2__arrival-copy {
  margin-top: 8px;
  font-size: 6px;
  line-height: 1.5;
  opacity: 0.8;
}

.cds-v2__arrival-peek {
  position: absolute;
  left: 50%;
  top: 58%;
  transform: translateX(-50%);
  width: 70%;
  height: 80px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.25) 100%);
  pointer-events: none;
}

.cds-v2__arrival-peek::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.12), transparent);
}

.cds-v2__enter-btn {
  margin-top: 14px;
  padding: 10px 18px;
  font-size: 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.65);
  background: rgba(201, 169, 98, 0.14);
  color: #f0ebe3;
  cursor: pointer;
}

/* Story Table™ + Orb™ */
.cds-v2__story-table {
  position: absolute;
  left: 50%;
  top: 54%;
  transform: translate(-50%, -50%);
  width: min(300px, 78vw);
  height: 100px;
  z-index: 6;
}

.cds-v2__table-surface {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(18, 16, 14, 0.75) 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.cds-v2__table-surface::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cds-v2__orb-anchor {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  z-index: 8;
  pointer-events: none;
}

.cds-v2__orb-sphere {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.6);
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.32), rgba(201, 169, 98, 0.22) 42%, rgba(18, 16, 14, 0.92) 100%);
  animation: cds-v2-orb-pulse 4s ease-in-out infinite;
}

@keyframes cds-v2-orb-pulse {
  0%, 100% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.04); opacity: 1; }
}

.cds-v2__orb-speech {
  position: absolute;
  left: 50%;
  top: 62px;
  transform: translateX(-50%);
  width: min(280px, 76vw);
  text-align: center;
  font-size: 6px;
  line-height: 1.45;
}

.cds-v2__table-chips {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.cds-v2__table-chip {
  padding: 3px 6px;
  font-size: 5px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
}

/* Living Mood Wall™ — architectural wall */
.cds-v2__mood-wall {
  position: absolute;
  left: 8%;
  top: 16%;
  width: 84%;
  height: 58%;
  border-left: 3px solid rgba(201, 169, 98, 0.55);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(28, 24, 20, 0.9) 0%, rgba(14, 12, 10, 0.85) 100%);
  display: flex;
  flex-direction: column;
  padding: 10px;
  z-index: 6;
}

.cds-v2__mood-wall-label {
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
  margin-bottom: 8px;
}

.cds-v2__mood-wall-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cds-v2__mood-tile {
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.28);
  padding: 5px;
  font-size: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cds-v2__mood-add {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Founder Notes™ desk */
.cds-v2__notes-desk {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(320px, 84vw);
  z-index: 6;
}

.cds-v2__desk-lamp {
  position: absolute;
  left: 12%;
  top: -8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 220, 160, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.cds-v2__desk-surface {
  padding: 12px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: linear-gradient(165deg, rgba(42, 36, 30, 0.95) 0%, rgba(18, 16, 14, 0.9) 100%);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

.cds-v2__desk-label {
  font-size: 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.9);
  margin-bottom: 8px;
}

.cds-v2__desk-scroll {
  max-height: 140px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Creative Pipeline™ — wall-mounted board */
.cds-v2__pipeline-wall {
  position: absolute;
  left: 6%;
  top: 14%;
  width: 88%;
  height: 62%;
  border: 2px solid rgba(201, 169, 98, 0.25);
  background: linear-gradient(180deg, rgba(22, 20, 18, 0.95) 0%, rgba(10, 9, 8, 0.92) 100%);
  padding: 10px;
  display: flex;
  flex-direction: column;
  z-index: 6;
}

.cds-v2__pipeline-wall::before {
  content: "";
  position: absolute;
  top: 8px;
  left: 12px;
  right: 12px;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    rgba(201, 169, 98, 0.4) 0,
    rgba(201, 169, 98, 0.4) 8px,
    transparent 8px,
    transparent 14px
  );
  pointer-events: none;
}

.cds-v2__pipeline-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 10px;
}

/* Reference Library™ shelving */
.cds-v2__library {
  position: absolute;
  left: 8%;
  top: 18%;
  width: 84%;
  height: 56%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 6;
}

.cds-v2__shelf-unit {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(16, 14, 12, 0.85);
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.cds-v2__shelf-label {
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.85);
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 4px;
}

.cds-v2__volume {
  flex: 1;
  margin-top: 4px;
  padding: 5px 4px;
  font-size: 5px;
  line-height: 1.35;
  border-left: 2px solid rgba(201, 169, 98, 0.45);
  background: rgba(0, 0, 0, 0.22);
}

/* Shared form controls */
.cds-v2__input {
  width: 100%;
  padding: 5px 6px;
  font-size: 7px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f0ebe3;
}

.cds-v2__btn {
  padding: 6px 10px;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.1);
  color: #f0ebe3;
  cursor: pointer;
}

.cds-v2__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cds-v2__btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

/* Pipeline board inherits gb-immersive pipeline row styles */
.cds-v2__pipeline-wall .gb-immersive__pipeline {
  max-height: none;
}

.cds-v2--review-mode .cds-v2__atmosphere {
  background:
    radial-gradient(ellipse 70% 50% at 50% 45%, rgba(201, 169, 98, 0.14) 0%, transparent 65%),
    linear-gradient(180deg, #2a2622 0%, #1a1816 48%, #0e0c0a 100%);
}

@media (prefers-reduced-motion: reduce) {
  .cds-v2__camera-track {
    transition: none;
  }
  .cds-v2__orb-sphere {
    animation: none;
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
    height: 58%;
  }
}
`;
