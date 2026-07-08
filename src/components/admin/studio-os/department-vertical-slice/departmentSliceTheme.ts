/** Golden Build — full-viewport immersive department scene (lightweight, no blur/motion). */

export const DEPARTMENT_SLICE_STYLES = `
body.gb-immersive-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.gb-immersive {
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

.gb-immersive__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 120% 70% at 50% -10%, rgba(201, 169, 98, 0.16) 0%, transparent 55%),
    linear-gradient(180deg, #2c2824 0%, #1c1a17 45%, #100e0c 100%);
}

.gb-immersive__scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Environment shell — full viewport architecture */
.gb-immersive__env-floor {
  position: absolute;
  left: -5%;
  right: -5%;
  bottom: 0;
  height: 32%;
  border-top: 1px solid rgba(201, 169, 98, 0.28);
  background: linear-gradient(180deg, rgba(245, 240, 232, 0.07) 0%, rgba(8, 7, 6, 0.55) 100%);
  pointer-events: none;
}

.gb-immersive__env-wall {
  position: absolute;
  left: 4%;
  right: 4%;
  top: 11%;
  bottom: 30%;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(14, 12, 10, 0.45) 100%);
  pointer-events: none;
}

.gb-immersive__env-horizon {
  position: absolute;
  left: 0;
  right: 0;
  top: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.35), transparent);
  pointer-events: none;
}

/* Minimal HUD */
.gb-immersive__hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: max(8px, env(safe-area-inset-top)) 12px 8px;
  pointer-events: none;
}

.gb-immersive__hud > * {
  pointer-events: auto;
}

.gb-immersive__back {
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

.gb-immersive__identity {
  flex: 1;
  min-width: 0;
}

.gb-immersive__dept {
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gb-immersive__project {
  font-family: "Covered By Your Grace", cursive;
  font-size: clamp(14px, 4vw, 18px);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gb-immersive__pill {
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

/* Spatial objects — float in scene, not stacked cards */
.gb-immersive__object {
  position: absolute;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(16, 14, 12, 0.82);
}

.gb-immersive__object-label {
  font-size: 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.9);
  margin-bottom: 6px;
}

.gb-immersive__object--mood-wall {
  left: 3%;
  top: 12%;
  width: 54%;
  height: 34%;
  padding: 8px;
  border-left: 2px solid rgba(201, 169, 98, 0.55);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gb-immersive__object--notes {
  right: 3%;
  top: 12%;
  width: 36%;
  height: 34%;
  padding: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gb-immersive__object-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.gb-immersive__object--orb {
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border: none;
  background: transparent;
  pointer-events: none;
  z-index: 5;
}

.gb-immersive__orb-sphere {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.3), rgba(201, 169, 98, 0.2) 42%, rgba(18, 16, 14, 0.92) 100%);
}

.gb-immersive__orb-speech {
  position: absolute;
  left: 50%;
  top: 58px;
  transform: translateX(-50%);
  width: min(260px, 72vw);
  text-align: center;
  font-size: 6px;
  line-height: 1.4;
  opacity: 0.88;
}

.gb-immersive__object--console {
  left: 3%;
  right: 3%;
  bottom: max(8px, env(safe-area-inset-bottom));
  height: auto;
  max-height: 28%;
  padding: 8px 10px;
  border-color: rgba(201, 169, 98, 0.25);
  z-index: 6;
}

.gb-immersive__zone {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
  padding: 4px 7px;
  font-size: 5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(12, 10, 9, 0.78);
  color: #f0ebe3;
  cursor: pointer;
  max-width: 72px;
  text-align: center;
  line-height: 1.25;
}

.gb-immersive__zone.is-active {
  border-color: rgba(201, 169, 98, 0.8);
  background: rgba(201, 169, 98, 0.14);
}

.gb-immersive__input {
  width: 100%;
  margin-top: 4px;
  padding: 5px 6px;
  font-size: 7px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f0ebe3;
}

.gb-immersive__btn {
  margin-top: 6px;
  padding: 6px 10px;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.1);
  color: #f0ebe3;
  cursor: pointer;
}

.gb-immersive__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gb-immersive__btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.gb-immersive__queue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 3px 0;
  font-size: 6px;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.gb-immersive__pipeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 100%;
  overflow-y: auto;
}

.gb-immersive__pipeline-sub {
  font-size: 5px;
  opacity: 0.7;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gb-immersive__pipeline-notice {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gb-immersive__pipeline-notice-btn {
  text-align: left;
  padding: 5px 6px;
  font-size: 6px;
  background: rgba(201, 169, 98, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.45);
  color: #f0ebe3;
  cursor: pointer;
}

.gb-immersive__pipeline-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.gb-immersive__pipeline-row {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 4px;
  align-items: center;
  padding: 4px 5px;
  font-size: 5px;
  text-align: left;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #f0ebe3;
  cursor: pointer;
}

.gb-immersive__pipeline-row.is-active {
  border-color: rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.08);
}

.gb-immersive__pipeline-row.is-done .gb-immersive__pipeline-status {
  color: rgba(120, 200, 140, 0.9);
}

.gb-immersive__pipeline-row.is-locked {
  opacity: 0.5;
}

.gb-immersive__pipeline-order {
  opacity: 0.65;
}

.gb-immersive__pipeline-name {
  letter-spacing: 0.05em;
}

.gb-immersive__pipeline-status {
  font-size: 5px;
  opacity: 0.8;
  text-transform: uppercase;
}

.gb-immersive__pipeline-branches {
  grid-column: 2 / -1;
  font-size: 5px;
  opacity: 0.6;
}

.gb-immersive__pipeline-detail {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.gb-immersive__pipeline-detail-title {
  font-size: 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.gb-immersive__pipeline-prep {
  font-size: 5px;
  opacity: 0.65;
  margin-top: 4px;
}

.gb-immersive__pipeline-warning {
  margin-top: 6px;
  padding: 6px;
  font-size: 5px;
  border: 1px solid rgba(235, 28, 36, 0.35);
  background: rgba(235, 28, 36, 0.08);
}

.gb-immersive__pipeline-warning ul {
  margin: 4px 0;
  padding-left: 0;
  list-style: none;
}

.gb-immersive__pipeline-error {
  margin-top: 4px;
  font-size: 5px;
  color: rgba(235, 28, 36, 0.9);
}

.gb-immersive__btn.is-selected {
  border-color: rgba(201, 169, 98, 0.9);
  background: rgba(201, 169, 98, 0.2);
}

.gb-immersive__mood-tile {
  margin-top: 4px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 6px;
}

.gb-immersive__preview-link {
  display: inline-block;
  margin-top: 4px;
  font-size: 6px;
  color: rgba(201, 169, 98, 0.95);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.gb-immersive__teaching {
  position: absolute;
  left: 50%;
  top: 68%;
  transform: translateX(-50%);
  width: min(300px, 80vw);
  text-align: center;
  font-size: 6px;
  opacity: 0.7;
  z-index: 4;
  pointer-events: none;
}

/* Mobile: slight horizontal room pan for spatial feel */
@media (max-width: 767px) {
  .gb-immersive__scene-pan {
    position: absolute;
    inset: 0;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }

  .gb-immersive__scene-inner {
    position: relative;
    width: 108vw;
    min-width: 108vw;
    height: 100%;
  }

  .gb-immersive__object--mood-wall {
    left: 2%;
    width: 58%;
    height: 30%;
  }

  .gb-immersive__object--notes {
    right: 2%;
    width: 34%;
    height: 30%;
  }

  .gb-immersive__object--console {
    left: 2%;
    right: 2%;
    max-height: 32%;
  }
}

@media (min-width: 768px) {
  .gb-immersive__scene-pan {
    position: absolute;
    inset: 0;
  }

  .gb-immersive__scene-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
`;
