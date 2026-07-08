/** Architecture Observatory™ — immersive mission-control environment styles */

export const ARCHITECTURE_OBSERVATORY_STYLES = `
body.arch-observatory-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.arch-obs {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse 120% 80% at 50% 40%, #12100e 0%, #060504 55%, #020201 100%);
  color: #e8e0d4;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.arch-obs * { text-transform: uppercase; box-sizing: border-box; }

.arch-obs__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%);
}

.arch-obs__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.4);
  background: rgba(0,0,0,0.5);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.arch-obs__title-block { flex: 1; min-width: 0; }
.arch-obs__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.16em; color: #c9a962; }
.arch-obs__title { margin: 2px 0 0; font-size: 7px; letter-spacing: 0.12em; opacity: 0.75; }

.arch-obs__scan-btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.5);
  background: rgba(0,0,0,0.55);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}
.arch-obs__scan-btn:disabled { opacity: 0.45; cursor: wait; }

/* Central health sculpture */
.arch-obs__core {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  width: min(72vw, 280px);
  height: min(72vw, 280px);
  z-index: 10;
}

.arch-obs__core-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.25);
  animation: arch-ring-pulse 4s ease-in-out infinite;
}
.arch-obs__core-ring--2 { inset: 12%; animation-delay: 0.5s; opacity: 0.7; }
.arch-obs__core-ring--3 { inset: 24%; border-color: rgba(235, 28, 36, 0.3); animation-delay: 1s; }

@keyframes arch-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.03); opacity: 1; }
}

.arch-obs__core-readout {
  position: absolute;
  inset: 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(circle, rgba(0,0,0,0.6) 0%, transparent 70%);
}

.arch-obs__health-val {
  font-family: "Covered By Your Grace", cursive;
  font-size: 36px;
  color: #c9a962;
  line-height: 1;
  margin: 0;
}
.arch-obs__health-val.is-warning { color: #e8a040; }
.arch-obs__health-val.is-critical { color: #eb1c24; }

.arch-obs__health-label {
  margin: 4px 0 0;
  font-size: 5px;
  letter-spacing: 0.14em;
  opacity: 0.7;
}

.arch-obs__status-line {
  margin: 8px 0 0;
  font-size: 5px;
  letter-spacing: 0.1em;
  color: rgba(235, 28, 36, 0.85);
}

/* Wall projections — score stations */
.arch-obs__wall {
  position: absolute;
  z-index: 12;
  width: 28%;
  max-height: 42%;
  overflow: hidden;
  pointer-events: none;
}

.arch-obs__wall--left { left: 4%; top: 22%; }
.arch-obs__wall--right { right: 4%; top: 22%; text-align: right; }
.arch-obs__wall--bottom {
  left: 50%;
  bottom: max(12px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(94vw, 400px);
  max-height: 28%;
  top: auto;
}

.arch-obs__projection {
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
}

.arch-obs__proj-label {
  display: block;
  font-size: 4px;
  letter-spacing: 0.1em;
  opacity: 0.6;
  margin-bottom: 2px;
}

.arch-obs__proj-bar {
  height: 3px;
  background: rgba(255,255,255,0.08);
  margin-top: 4px;
  overflow: hidden;
}
.arch-obs__proj-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a962, #e8d4a0);
  transition: width 0.6s ease;
}
.arch-obs__proj-fill.is-low { background: linear-gradient(90deg, #eb1c24, #e8a040); }

.arch-obs__proj-val {
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  color: #c9a962;
}

/* Violation ticker */
.arch-obs__ticker {
  overflow: hidden;
  white-space: nowrap;
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.8;
  padding: 6px 0 2px;
  border-top: 1px solid rgba(201, 169, 98, 0.15);
}

.arch-obs__ticker-inner {
  display: inline-block;
  animation: arch-ticker 28s linear infinite;
}

@keyframes arch-ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.arch-obs__migration-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 4px;
  letter-spacing: 0.06em;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  opacity: 0.85;
}

.arch-obs__floor-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(201,169,98,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,169,98,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(400px) rotateX(58deg) scale(2);
  transform-origin: 50% 100%;
  opacity: 0.35;
  pointer-events: none;
  z-index: 1;
}

.arch-obs__beacon {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #c9a962;
  box-shadow: 0 0 12px rgba(201, 169, 98, 0.6);
  animation: arch-beacon 2s ease-in-out infinite;
}
.arch-obs__beacon--tl { top: 18%; left: 18%; }
.arch-obs__beacon--tr { top: 18%; right: 18%; animation-delay: 0.7s; }

@keyframes arch-beacon {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
`;
