/** Golden Build department room — lightweight spatial shell (no blur, no infinite motion). */

export const DEPARTMENT_SLICE_STYLES = `
.gb-room {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  color: #f0ebe3;
  font-family: "Futura PT", sans-serif;
  background: #1a1816;
  touch-action: manipulation;
}

.gb-room__sky {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 90% 55% at 50% 0%, rgba(201, 169, 98, 0.14) 0%, transparent 58%),
    linear-gradient(180deg, #2a2622 0%, #1e1c19 38%, #141210 100%);
}

.gb-room__hud {
  position: relative;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px 8px;
  padding-top: max(12px, env(safe-area-inset-top));
}

.gb-room__exit {
  position: fixed;
  top: max(10px, env(safe-area-inset-top));
  right: 10px;
  z-index: 6;
  padding: 6px 10px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(20, 18, 16, 0.92);
  color: #f0ebe3;
  cursor: pointer;
}

.gb-room__label {
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.92);
}

.gb-room__title {
  font-family: "Covered By Your Grace", cursive;
  font-size: clamp(16px, 4.5vw, 22px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f5f0e8;
  margin: 2px 0 4px;
}

.gb-room__meta {
  font-size: 7px;
  letter-spacing: 0.08em;
  opacity: 0.72;
  text-align: right;
  line-height: 1.5;
}

.gb-room__canvas {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - 52px);
  padding: 0 10px 120px;
}

/* 2.5D space — simplified on mobile */
.gb-room__space {
  position: relative;
  min-height: 62vh;
  margin-top: 4px;
}

.gb-room__vanishing {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 8%;
  bottom: 18%;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(12, 11, 10, 0.35) 100%);
  transform: perspective(900px) rotateX(8deg);
  transform-origin: center bottom;
}

.gb-room__floor-plane {
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 6%;
  height: 22%;
  border-top: 1px solid rgba(201, 169, 98, 0.22);
  background: linear-gradient(180deg, rgba(245, 240, 232, 0.05) 0%, rgba(0, 0, 0, 0.15) 100%);
  transform: perspective(700px) rotateX(52deg);
  transform-origin: center top;
  border-radius: 4px;
}

.gb-room__zone {
  position: absolute;
  z-index: 3;
  transform: translate(-50%, -50%);
  padding: 5px 8px;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(16, 14, 12, 0.82);
  color: #f0ebe3;
  cursor: pointer;
  max-width: 88px;
  text-align: center;
  line-height: 1.3;
}

.gb-room__zone.is-active {
  border-color: rgba(201, 169, 98, 0.85);
  background: rgba(201, 169, 98, 0.14);
}

.gb-room__orb {
  position: absolute;
  left: 50%;
  bottom: 22%;
  z-index: 4;
  transform: translateX(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.28), rgba(201, 169, 98, 0.22) 42%, rgba(18, 16, 14, 0.9) 100%);
  box-shadow: 0 0 20px rgba(201, 169, 98, 0.25);
}

.gb-room__orb-caption {
  position: absolute;
  left: 50%;
  bottom: 14%;
  z-index: 4;
  transform: translateX(-50%);
  width: min(280px, 88vw);
  text-align: center;
  font-size: 7px;
  line-height: 1.45;
  opacity: 0.88;
  pointer-events: none;
}

.gb-room__teaching {
  position: relative;
  z-index: 2;
  margin: 10px 4px 0;
  font-size: 7px;
  letter-spacing: 0.06em;
  opacity: 0.78;
  line-height: 1.4;
}

/* Spatial objects — not stacked dashboard cards */
.gb-room__mood-wall {
  position: relative;
  z-index: 2;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid rgba(201, 169, 98, 0.65);
  background: rgba(22, 20, 18, 0.78);
  border-radius: 2px;
}

.gb-room__notes-rail {
  position: relative;
  z-index: 2;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(18, 16, 14, 0.72);
  border-radius: 2px;
}

.gb-room__console {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  padding: 10px 12px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(201, 169, 98, 0.28);
  background: rgba(14, 12, 10, 0.96);
}

.gb-room__console-inner {
  max-width: 640px;
  margin: 0 auto;
}

.gb-room__queue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 7px;
  letter-spacing: 0.06em;
}

.gb-room__btn {
  padding: 9px 12px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(201, 169, 98, 0.65);
  background: rgba(201, 169, 98, 0.12);
  color: #f0ebe3;
  cursor: pointer;
  font-family: "Futura PT Medium", sans-serif;
}

.gb-room__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gb-room__btn--block {
  width: 100%;
  margin-top: 8px;
}

.gb-room__input {
  width: 100%;
  margin-top: 6px;
  padding: 6px 8px;
  font-size: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f0ebe3;
}

.gb-room__mood-tile {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px;
  margin-top: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.gb-room__preview-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 7px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.95);
  text-decoration: underline;
}

/* Tablet/desktop: wider spatial layout */
@media (min-width: 768px) {
  .gb-room__canvas {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 12px;
    align-items: start;
    padding: 0 16px 130px;
  }

  .gb-room__space-col {
    grid-column: 1;
  }

  .gb-room__rail-col {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gb-room__space {
    min-height: 52vh;
  }
}

/* Mobile: flatten 3D transforms — major Safari perf win */
@media (max-width: 767px) {
  .gb-room__vanishing,
  .gb-room__floor-plane {
    transform: none;
  }

  .gb-room__vanishing {
    top: 4%;
    bottom: 28%;
  }

  .gb-room__floor-plane {
    height: 14%;
    bottom: 10%;
  }

  .gb-room__orb {
    bottom: 26%;
  }

  .gb-room__orb-caption {
    bottom: 18%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gb-room__orb {
    box-shadow: none;
  }
}
`;
