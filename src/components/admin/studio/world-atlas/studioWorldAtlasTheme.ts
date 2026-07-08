/** Studio World Atlas™ — holographic table environment styles */

export const STUDIO_WORLD_ATLAS_STYLES = `
body.studio-world-atlas-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.swa {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 90% 60% at 50% 18%, rgba(201, 169, 98, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse 120% 80% at 50% 100%, #0a0908 0%, #020201 70%);
  color: #e8e0d4;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.swa * { box-sizing: border-box; text-transform: uppercase; }

.swa__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 40;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
}

.swa__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.4);
  background: rgba(0,0,0,0.5);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.swa__title-block { flex: 1; min-width: 0; }
.swa__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.16em; color: #c9a962; }
.swa__title { margin: 2px 0 0; font-size: 8px; letter-spacing: 0.12em; }
.swa__zoom { margin: 2px 0 0; font-size: 5px; letter-spacing: 0.1em; opacity: 0.55; }

.swa__zoom-out {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.55);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}

/* Holographic table */
.swa__table-stage {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: min(94vw, 520px);
  height: min(62vh, 380px);
  perspective: 900px;
  z-index: 10;
}

.swa__table {
  position: relative;
  width: 100%;
  height: 100%;
  transform: rotateX(58deg);
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.swa__table.is-zooming {
  transform: rotateX(52deg) scale(1.04);
}

.swa__table-surface {
  position: absolute;
  inset: 8% 4%;
  border: 1px solid rgba(80, 200, 255, 0.35);
  background:
    linear-gradient(rgba(80, 200, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 200, 255, 0.06) 1px, transparent 1px),
    radial-gradient(ellipse at center, rgba(80, 200, 255, 0.12) 0%, rgba(0,0,0,0.55) 70%);
  background-size: 28px 28px, 28px 28px, 100% 100%;
  box-shadow:
    0 0 40px rgba(80, 200, 255, 0.15),
    inset 0 0 60px rgba(80, 200, 255, 0.08);
}

.swa__table-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(80, 200, 255, 0.2) 0%, transparent 65%);
  animation: swa-table-pulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes swa-table-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.75; }
}

.swa__roads {
  position: absolute;
  inset: 8% 4%;
  pointer-events: none;
  z-index: 2;
}

.swa__road {
  stroke: rgba(80, 200, 255, 0.22);
  stroke-width: 1;
  fill: none;
  stroke-dasharray: 4 6;
  animation: swa-road-flow 12s linear infinite;
}

@keyframes swa-road-flow {
  to { stroke-dashoffset: -40; }
}

/* Buildings */
.swa__buildings {
  position: absolute;
  inset: 8% 4%;
  z-index: 5;
}

.swa__building {
  position: absolute;
  transform: translate(-50%, -50%);
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: filter 0.5s ease, opacity 0.5s ease;
}

.swa__building.is-fogged {
  opacity: 0.35;
  filter: blur(0.5px) grayscale(0.6);
  cursor: not-allowed;
}

.swa__building.is-hidden { display: none; }

.swa__extrusion {
  position: relative;
  width: 22px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(80, 200, 255, 0.85) 0%, rgba(30, 120, 180, 0.5) 100%);
  border: 1px solid rgba(120, 220, 255, 0.6);
  box-shadow: 0 0 12px rgba(80, 200, 255, 0.35);
  transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
}

.swa__building.is-pulse .swa__extrusion {
  animation: swa-building-pulse 2.4s ease-in-out infinite;
  box-shadow: 0 0 18px rgba(201, 169, 98, 0.55);
}

.swa__building.is-generating .swa__extrusion {
  animation: swa-building-gen 1.2s ease-in-out infinite;
  background: linear-gradient(180deg, rgba(235, 28, 36, 0.9) 0%, rgba(80, 200, 255, 0.5) 100%);
}

.swa__building.is-active .swa__extrusion {
  box-shadow: 0 0 14px rgba(201, 169, 98, 0.45);
}

.swa__building.is-focused .swa__extrusion {
  border-color: #c9a962;
  box-shadow: 0 0 22px rgba(201, 169, 98, 0.7);
}

@keyframes swa-building-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}

@keyframes swa-building-gen {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; transform: scaleY(1.06); }
}

.swa__building-label {
  display: block;
  margin-top: 4px;
  font-size: 4px;
  letter-spacing: 0.06em;
  max-width: 72px;
  text-align: center;
  line-height: 1.3;
  text-shadow: 0 0 6px rgba(0,0,0,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.swa__building-level {
  display: block;
  font-size: 3px;
  opacity: 0.5;
  margin-top: 1px;
}

/* Mode + travel rails */
.swa__mode-rail {
  position: absolute;
  left: 50%;
  bottom: max(72px, calc(env(safe-area-inset-bottom) + 56px));
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  max-width: 96vw;
  padding: 0 8px;
}

.swa__mode-pill,
.swa__travel-pill {
  padding: 5px 8px;
  font-size: 4px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0,0,0,0.55);
  color: rgba(232, 224, 212, 0.75);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.swa__mode-pill.is-active,
.swa__travel-pill.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.swa__travel-rail {
  position: absolute;
  left: 50%;
  bottom: max(44px, calc(env(safe-area-inset-bottom) + 28px));
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  max-width: 96vw;
  scrollbar-width: none;
}
.swa__travel-rail::-webkit-scrollbar { display: none; }

/* Orb guide */
.swa__orb {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  top: 18%;
  width: min(34vw, 160px);
  z-index: 25;
  padding: 10px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
}

.swa__orb-sphere {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin: 0 auto 8px;
  background: radial-gradient(circle at 35% 30%, #fff8e8 0%, #c9a962 40%, #4a3a18 100%);
  box-shadow: 0 0 20px rgba(201, 169, 98, 0.5);
  animation: swa-orb-float 3s ease-in-out infinite;
}

@keyframes swa-orb-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.swa__orb-title {
  margin: 0 0 6px;
  font-size: 5px;
  letter-spacing: 0.12em;
  text-align: center;
  color: #c9a962;
}

.swa__orb-rec {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 4px;
  padding: 5px 6px;
  font-size: 4px;
  letter-spacing: 0.05em;
  line-height: 1.4;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.35);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
}

.swa__orb-rec.is-high { border-color: rgba(235, 28, 36, 0.35); }
.swa__orb-rec.is-medium { border-color: rgba(201, 169, 98, 0.35); }

/* Focus panel */
.swa__focus-panel {
  position: absolute;
  left: max(8px, env(safe-area-inset-left));
  top: 18%;
  width: min(36vw, 170px);
  z-index: 25;
  padding: 10px;
  border: 1px solid rgba(80, 200, 255, 0.25);
  background: rgba(0,0,0,0.55);
}

.swa__focus-name {
  margin: 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  color: #c9a962;
  line-height: 1.1;
}

.swa__focus-meta {
  margin: 6px 0 0;
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.7;
  line-height: 1.5;
}

.swa__travel-btn {
  margin-top: 8px;
  width: 100%;
  padding: 7px 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.6);
  background: rgba(201, 169, 98, 0.15);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}

.swa__travel-btn:disabled { opacity: 0.45; cursor: wait; }

.swa__breadcrumb {
  position: absolute;
  left: 50%;
  top: max(52px, calc(env(safe-area-inset-top) + 44px));
  transform: translateX(-50%);
  z-index: 35;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  max-width: 92vw;
}

.swa__crumb {
  padding: 3px 6px;
  font-size: 4px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.4);
  color: rgba(232,224,212,0.65);
  cursor: pointer;
  font-family: inherit;
}

.swa__crumb.is-current {
  border-color: rgba(201, 169, 98, 0.5);
  color: #c9a962;
}

/* Cinematic travel overlay */
.swa__travel-overlay {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 70%);
  animation: swa-travel-fade 0.4s ease;
}

.swa__travel-overlay.is-walk { background: radial-gradient(ellipse at center, rgba(80,200,255,0.08) 0%, rgba(0,0,0,0.9) 70%); }
.swa__travel-overlay.is-elevator { background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%); }
.swa__travel-overlay.is-fast-travel { background: radial-gradient(circle, rgba(201,169,98,0.15) 0%, rgba(0,0,0,0.95) 55%); }
.swa__travel-overlay.is-guided-tour { background: radial-gradient(ellipse 120% 80% at 50% 40%, rgba(80,200,255,0.1) 0%, rgba(0,0,0,0.92) 65%); }

.swa__travel-msg {
  font-family: "Covered By Your Grace", cursive;
  font-size: 18px;
  color: #c9a962;
  text-align: center;
  padding: 0 20px;
  animation: swa-travel-msg 0.8s ease;
}

@keyframes swa-travel-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes swa-travel-msg {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.swa__fog-legend {
  position: absolute;
  left: max(8px, env(safe-area-inset-left));
  bottom: max(12px, env(safe-area-inset-bottom));
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.55;
  z-index: 20;
}

/* Phase 2 — living world evolution */
.swa__ticker {
  position: absolute;
  left: 0; right: 0;
  top: max(88px, calc(env(safe-area-inset-top) + 76px));
  z-index: 28;
  overflow: hidden;
  white-space: nowrap;
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.65;
  pointer-events: none;
}
.swa__ticker-inner {
  display: inline-block;
  animation: swa-ticker 32s linear infinite;
}
@keyframes swa-ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.swa__engine-strip {
  position: absolute;
  left: max(8px, env(safe-area-inset-left));
  right: max(8px, env(safe-area-inset-right));
  top: max(100px, calc(env(safe-area-inset-top) + 88px));
  z-index: 22;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  max-width: 96vw;
  pointer-events: none;
}
.swa__engine-chip {
  padding: 2px 5px;
  font-size: 3px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(80, 200, 255, 0.25);
  background: rgba(0,0,0,0.45);
  opacity: 0.8;
}

.swa__building.is-planned .swa__extrusion {
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.35) 0%, transparent 100%);
  border-style: dashed;
  animation: swa-plan-pulse 3s ease-in-out infinite;
}
@keyframes swa-plan-pulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}

.swa__building.has-signal-construction-crane .swa__extrusion::after {
  content: '▲';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 6px;
  color: #e8a040;
  animation: swa-crane 1.6s ease-in-out infinite;
}
@keyframes swa-crane {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.swa__building.has-signal-golden-monument .swa__extrusion {
  border-color: #c9a962;
  box-shadow: 0 0 16px rgba(201, 169, 98, 0.65);
}

.swa__building.has-signal-ai-glow .swa__extrusion {
  box-shadow: 0 0 14px rgba(235, 28, 36, 0.35), 0 0 8px rgba(80, 200, 255, 0.4);
}

.swa__building.has-signal-marketplace-delivery::before {
  content: '◆';
  position: absolute;
  top: -6px;
  right: -4px;
  font-size: 5px;
  color: #c9a962;
  animation: swa-delivery 2s ease-in-out infinite;
}
@keyframes swa-delivery {
  0% { opacity: 0.3; transform: translateY(4px); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0.3; transform: translateY(-2px); }
}

.swa__road.is-illuminated {
  stroke: rgba(201, 169, 98, 0.65);
  stroke-width: 1.5;
  filter: drop-shadow(0 0 4px rgba(201, 169, 98, 0.5));
}

.swa__memory-block {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 3px;
  letter-spacing: 0.06em;
  line-height: 1.5;
  opacity: 0.75;
}

.swa__construction-phase {
  margin-top: 4px;
  font-size: 4px;
  color: #e8a040;
  letter-spacing: 0.08em;
}

.swa__engine-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 6px;
}
.swa__engine-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(80, 200, 255, 0.7);
  box-shadow: 0 0 4px rgba(80, 200, 255, 0.5);
}

.swa__planner-panel {
  position: absolute;
  left: max(8px, env(safe-area-inset-left));
  bottom: max(100px, calc(env(safe-area-inset-bottom) + 84px));
  width: min(42vw, 190px);
  z-index: 26;
  padding: 8px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.6);
  max-height: 22vh;
  overflow-y: auto;
}
.swa__planner-title {
  margin: 0 0 6px;
  font-size: 5px;
  color: #c9a962;
  letter-spacing: 0.1em;
}
.swa__planner-item {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 4px;
  padding: 4px 5px;
  font-size: 3px;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.35);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
}

.swa__travel-overlay.is-shuttle { background: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(201,169,98,0.12) 50%, rgba(0,0,0,0.5) 100%); }
.swa__travel-overlay.is-skybridge { background: linear-gradient(180deg, rgba(80,200,255,0.1) 0%, rgba(0,0,0,0.92) 60%); }
.swa__travel-overlay.is-train { background: repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 8px, rgba(201,169,98,0.08) 8px, rgba(201,169,98,0.08) 16px); }
.swa__travel-overlay.is-transit { background: radial-gradient(circle, rgba(80,200,255,0.12) 0%, rgba(0,0,0,0.94) 50%); }

/* Phase 3 — Master Planner™ */
.swa.is-master-planner .swa__table-surface {
  box-shadow:
    0 0 40px rgba(80, 200, 255, 0.15),
    inset 0 0 60px rgba(201, 169, 98, 0.06),
    inset 0 0 80px rgba(80, 200, 255, 0.08);
}

.swa__road.is-potential {
  stroke: rgba(201, 169, 98, 0.35);
  stroke-dasharray: 6 8;
  opacity: 0.7;
}

.swa__building.is-draggable {
  cursor: grab;
  touch-action: none;
}
.swa__building.is-draggable:active { cursor: grabbing; }

.swa__planner-toolbar {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  bottom: max(100px, calc(env(safe-area-inset-bottom) + 84px));
  width: min(38vw, 175px);
  z-index: 27;
  padding: 8px;
  border: 1px solid rgba(80, 200, 255, 0.3);
  background: rgba(0,0,0,0.65);
  max-height: 32vh;
  overflow-y: auto;
}
.swa__planner-toolbar-title {
  margin: 0 0 6px;
  font-size: 5px;
  color: #c9a962;
  letter-spacing: 0.1em;
}
.swa__planner-btn {
  display: block;
  width: 100%;
  margin-bottom: 3px;
  padding: 4px 6px;
  font-size: 3px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.4);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.swa__planner-btn.is-primary {
  border-color: rgba(201, 169, 98, 0.5);
  color: #c9a962;
}

.swa__forecast-row {
  display: flex;
  gap: 3px;
  margin: 6px 0;
  flex-wrap: wrap;
}
.swa__forecast-pill {
  padding: 3px 6px;
  font-size: 3px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.35);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
}
.swa__forecast-pill.is-active {
  border-color: rgba(201, 169, 98, 0.6);
  color: #c9a962;
}

.swa__sim-panel {
  margin-top: 6px;
  padding: 6px;
  border: 1px solid rgba(80, 200, 255, 0.25);
  font-size: 3px;
  line-height: 1.45;
  letter-spacing: 0.05em;
  opacity: 0.85;
}
.swa__sim-score {
  font-family: "Covered By Your Grace", cursive;
  font-size: 12px;
  color: #c9a962;
  margin: 0 0 4px;
}

.swa__expansion-zone {
  position: absolute;
  border: 1px dashed rgba(201, 169, 98, 0.25);
  border-radius: 2px;
  pointer-events: none;
  z-index: 3;
  animation: swa-zone-pulse 4s ease-in-out infinite;
}
@keyframes swa-zone-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.5; }
}

.swa__budget-line {
  font-size: 3px;
  letter-spacing: 0.05em;
  opacity: 0.8;
  margin-top: 4px;
  line-height: 1.4;
}

/* Orb Recommendations™ — world integration */
.swa__road.is-orb-journey {
  stroke: rgba(235, 28, 36, 0.45);
  stroke-width: 1.2;
  stroke-dasharray: 4 6;
  opacity: 0.85;
  animation: swa-journey-glow 3s ease-in-out infinite;
}
@keyframes swa-journey-glow {
  0%, 100% { opacity: 0.55; stroke-width: 1; }
  50% { opacity: 0.95; stroke-width: 1.4; }
}

.swa__building.has-orb-glow .swa__extrusion {
  box-shadow: 0 0 14px rgba(201, 169, 98, 0.55), inset 0 0 8px rgba(201, 169, 98, 0.2);
}
.swa__building.has-orb-pulse .swa__extrusion {
  animation: swa-orb-pulse 2.4s ease-in-out infinite;
}
@keyframes swa-orb-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(235, 28, 36, 0.35); }
  50% { box-shadow: 0 0 22px rgba(235, 28, 36, 0.65); }
}
.swa__building.has-orb-beacon .swa__extrusion::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #EB1C24;
  box-shadow: 0 0 10px rgba(235, 28, 36, 0.9);
  animation: swa-beacon-blink 1.8s ease-in-out infinite;
}
@keyframes swa-beacon-blink {
  0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(0.8); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

/* Phase 4 — Parallel Futures™ */
.swa.is-parallel-futures .swa__table-surface {
  box-shadow:
    0 0 48px rgba(201, 169, 98, 0.18),
    inset 0 0 70px rgba(80, 200, 255, 0.1);
}

.swa__building.is-pf-active .swa__extrusion {
  border: 1px solid rgba(201, 169, 98, 0.65);
  box-shadow: 0 0 16px rgba(201, 169, 98, 0.45);
}
.swa__building.is-pf-inactive .swa__extrusion {
  opacity: 0.45;
  border: 1px dashed rgba(80, 200, 255, 0.35);
}

.swa__pf-comparison {
  position: absolute;
  left: 8px;
  top: 38%;
  width: min(42vw, 200px);
  max-height: 52vh;
  overflow-y: auto;
  z-index: 35;
  padding: 8px;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(201, 169, 98, 0.3);
  font-size: 4px;
  letter-spacing: 0.06em;
  line-height: 1.45;
}

.swa__pf-row {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
  padding: 6px 8px;
  border: 1px solid rgba(80, 200, 255, 0.25);
  background: rgba(0, 0, 0, 0.4);
  color: #e8e0d4;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}
.swa__pf-row.is-active {
  border-color: rgba(201, 169, 98, 0.65);
  background: rgba(201, 169, 98, 0.12);
}

.swa__pf-analysis,
.swa__pf-commit {
  font-size: 3px;
  letter-spacing: 0.05em;
  opacity: 0.85;
  margin-top: 6px;
  line-height: 1.45;
}

.swa__planner-btn.is-active {
  border-color: rgba(201, 169, 98, 0.7);
  background: rgba(201, 169, 98, 0.15);
}

.swa__travel-btn.is-primary {
  border-color: rgba(201, 169, 98, 0.6);
  color: #c9a962;
}

/* Phase 5 — Future Merge™ */
.swa.is-future-merge .swa__table-surface {
  box-shadow:
    0 0 64px rgba(120, 180, 255, 0.22),
    inset 0 0 90px rgba(201, 169, 98, 0.12);
  perspective: 900px;
}

.swa.is-future-merge .swa__buildings {
  transform-style: preserve-3d;
}

.swa.is-future-merge .swa__building {
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.45));
}

.swa.is-future-merge .swa__building.is-pf-active .swa__extrusion {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 0 22px rgba(120, 200, 255, 0.55),
    0 18px 28px rgba(0, 0, 0, 0.35);
}

.swa__building.is-merge-draggable {
  cursor: grab;
  touch-action: none;
}
.swa__building.is-merge-draggable:active {
  cursor: grabbing;
}

.swa__merge-lab-panel {
  border-color: rgba(120, 200, 255, 0.35);
  box-shadow: 0 0 24px rgba(120, 200, 255, 0.12);
}

.swa__pf-row.is-resolved {
  opacity: 0.55;
  border-color: rgba(80, 200, 120, 0.35);
}

.swa__merge-live-metrics,
.swa__merge-genome,
.swa__merge-replay,
.swa__merge-comments {
  font-size: 3px;
  letter-spacing: 0.05em;
  opacity: 0.88;
  margin-top: 6px;
  line-height: 1.45;
  padding: 6px;
  border: 1px solid rgba(120, 200, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
}

/* ═══════════════════════════════════════════════════════════════
   Spatial Experience™ — projected civilization, not dashboard
   ═══════════════════════════════════════════════════════════════ */

.swa.is-spatial {
  background:
    radial-gradient(ellipse 55% 35% at 50% 6%, rgba(201, 169, 98, 0.14) 0%, transparent 62%),
    radial-gradient(ellipse 140% 90% at 50% 100%, #060504 0%, #010100 72%);
}

.swa__spatial-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.swa__spatial-content {
  position: absolute;
  inset: 0;
  z-index: 8;
}

.swa__ambient-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 100% 80% at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.55) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.2) 28%, rgba(0, 0, 0, 0.65) 100%);
  animation: swa-veil-darken 1.8s ease forwards;
}

@keyframes swa-veil-darken {
  from { opacity: 0.35; }
  to { opacity: 1; }
}

.swa__marble-floor {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 140%;
  height: 42%;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232, 224, 212, 0.06) 0%, transparent 70%),
    repeating-linear-gradient(
      92deg,
      rgba(255, 255, 255, 0.02) 0px,
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 48px
    );
  opacity: 0.5;
}

.swa__orb-projector {
  position: absolute;
  left: 50%;
  top: max(6%, env(safe-area-inset-top));
  transform: translateX(-50%);
  z-index: 6;
  width: 64px;
  height: 64px;
  pointer-events: none;
}

.swa__orb-projector-sphere {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #fffef6 0%, #e8d49a 35%, #c9a962 58%, #3d3018 100%);
  box-shadow:
    0 0 32px rgba(201, 169, 98, 0.75),
    0 0 64px rgba(201, 169, 98, 0.35),
    inset 0 -4px 12px rgba(0, 0, 0, 0.25);
  animation: swa-orb-activate 2.4s ease-in-out infinite;
}

@keyframes swa-orb-activate {
  0%, 100% { filter: brightness(1); transform: translateX(-50%) scale(1); }
  50% { filter: brightness(1.25); transform: translateX(-50%) scale(1.06); }
}

.swa__projection-beam {
  position: absolute;
  left: 50%;
  top: 34px;
  transform: translateX(-50%);
  width: 3px;
  height: 48vh;
  background: linear-gradient(
    180deg,
    rgba(201, 169, 98, 0.95) 0%,
    rgba(120, 210, 255, 0.55) 42%,
    rgba(80, 200, 255, 0.15) 78%,
    transparent 100%
  );
  filter: blur(0.5px);
  opacity: 0;
  box-shadow: 0 0 18px rgba(201, 169, 98, 0.45);
}

.swa__projection-splash {
  position: absolute;
  left: 50%;
  top: calc(34px + 48vh);
  transform: translate(-50%, -50%);
  width: min(72vw, 640px);
  height: min(28vh, 220px);
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(80, 200, 255, 0.22) 0%, transparent 68%);
  opacity: 0;
  filter: blur(8px);
}

.swa.is-spatial.is-assembly-beam .swa__projection-beam,
.swa.is-spatial.is-assembly-grid .swa__projection-beam,
.swa.is-spatial.is-assembly-terrain .swa__projection-beam,
.swa.is-spatial.is-assembly-foundations .swa__projection-beam,
.swa.is-spatial.is-assembly-buildings .swa__projection-beam,
.swa.is-spatial.is-assembly-roads .swa__projection-beam,
.swa.is-spatial.is-assembly-transit .swa__projection-beam,
.swa.is-spatial.is-assembly-labels .swa__projection-beam,
.swa.is-spatial.is-assembly-overlays .swa__projection-beam,
.swa.is-spatial.is-assembly-collaborators .swa__projection-beam,
.swa.is-spatial.is-assembly-alive .swa__projection-beam {
  opacity: 0.72;
  animation: swa-beam-breathe 3.2s ease-in-out infinite;
}

.swa.is-spatial.is-assembly-beam .swa__projection-splash,
.swa.is-spatial.is-assembly-grid .swa__projection-splash,
.swa.is-spatial.is-assembly-terrain .swa__projection-splash,
.swa.is-spatial.is-assembly-foundations .swa__projection-splash,
.swa.is-spatial.is-assembly-buildings .swa__projection-splash,
.swa.is-spatial.is-assembly-roads .swa__projection-splash,
.swa.is-spatial.is-assembly-transit .swa__projection-splash,
.swa.is-spatial.is-assembly-labels .swa__projection-splash,
.swa.is-spatial.is-assembly-overlays .swa__projection-splash,
.swa.is-spatial.is-assembly-collaborators .swa__projection-splash,
.swa.is-spatial.is-assembly-alive .swa__projection-splash {
  opacity: 0.55;
  animation: swa-splash-pulse 4s ease-in-out infinite;
}

@keyframes swa-beam-breathe {
  0%, 100% { opacity: 0.55; width: 2px; }
  50% { opacity: 0.85; width: 4px; }
}

@keyframes swa-splash-pulse {
  0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.95); }
  50% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.04); }
}

.swa__floor-projection-ring {
  position: absolute;
  left: 50%;
  top: 58%;
  transform: translate(-50%, -50%);
  width: min(94vw, 1100px);
  height: min(76vh, 680px);
  border: 1px solid rgba(80, 200, 255, 0.12);
  border-radius: 2px;
  box-shadow:
    inset 0 0 80px rgba(80, 200, 255, 0.06),
    0 0 40px rgba(80, 200, 255, 0.08);
  opacity: 0;
  pointer-events: none;
}

.swa.is-spatial.is-assembly-grid .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-terrain .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-foundations .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-buildings .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-roads .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-transit .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-labels .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-overlays .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-collaborators .swa__floor-projection-ring,
.swa.is-spatial.is-assembly-alive .swa__floor-projection-ring {
  opacity: 1;
  animation: swa-ring-appear 1.2s ease forwards;
}

@keyframes swa-ring-appear {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.swa__living-layers {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
}

.swa__particle-field { position: absolute; inset: 0; }

.swa__particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(201, 169, 98, 0.85);
  box-shadow: 0 0 6px rgba(201, 169, 98, 0.6);
  animation: swa-particle-drift 6s ease-in-out infinite;
}

@keyframes swa-particle-drift {
  0%, 100% { transform: translate(0, 0); opacity: 0.25; }
  50% { transform: translate(6px, -10px); opacity: 0.9; }
}

.swa__energy-ribbons {
  position: absolute;
  inset: 18% 8% 22%;
  opacity: 0;
}

.swa.is-spatial.is-assembly-transit .swa__energy-ribbons,
.swa.is-spatial.is-assembly-labels .swa__energy-ribbons,
.swa.is-spatial.is-assembly-overlays .swa__energy-ribbons,
.swa.is-spatial.is-assembly-collaborators .swa__energy-ribbons,
.swa.is-spatial.is-assembly-alive .swa__energy-ribbons {
  opacity: 1;
}

.swa__ribbon {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(80, 200, 255, 0.65), transparent);
  animation: swa-ribbon-flow 5s linear infinite;
}
.swa__ribbon--a { top: 38%; left: 10%; width: 55%; animation-delay: 0s; }
.swa__ribbon--b { top: 52%; left: 22%; width: 48%; animation-delay: 1.2s; }
.swa__ribbon--c { top: 64%; left: 8%; width: 62%; animation-delay: 2.4s; }

@keyframes swa-ribbon-flow {
  0% { opacity: 0.2; transform: scaleX(0.6); }
  50% { opacity: 0.85; transform: scaleX(1); }
  100% { opacity: 0.2; transform: scaleX(0.6); }
}

.swa__crystal-fog {
  position: absolute;
  width: 28%;
  height: 32%;
  background: radial-gradient(ellipse at center, rgba(180, 220, 255, 0.12) 0%, transparent 72%);
  filter: blur(12px);
  animation: swa-fog-shimmer 7s ease-in-out infinite;
}
.swa__crystal-fog--nw { left: 4%; top: 28%; }
.swa__crystal-fog--se { right: 6%; bottom: 18%; animation-delay: 2.5s; }

@keyframes swa-fog-shimmer {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
}

.swa__elevation-lines {
  position: absolute;
  left: 50%;
  top: 54%;
  transform: translate(-50%, -50%);
  width: min(90vw, 1040px);
  height: min(70vh, 620px);
  background:
    repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(80, 200, 255, 0.04) 18px, rgba(80, 200, 255, 0.04) 19px);
  opacity: 0;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}

.swa.is-spatial.is-assembly-terrain .swa__elevation-lines,
.swa.is-spatial.is-assembly-foundations .swa__elevation-lines,
.swa.is-spatial.is-assembly-buildings .swa__elevation-lines,
.swa.is-spatial.is-assembly-roads .swa__elevation-lines,
.swa.is-spatial.is-assembly-transit .swa__elevation-lines,
.swa.is-spatial.is-assembly-labels .swa__elevation-lines,
.swa.is-spatial.is-assembly-overlays .swa__elevation-lines,
.swa.is-spatial.is-assembly-collaborators .swa__elevation-lines,
.swa.is-spatial.is-assembly-alive .swa__elevation-lines {
  opacity: 0.65;
}

/* Full-viewport holographic table */
.swa.is-spatial .swa__table-stage {
  top: 56%;
  width: min(96vw, 1080px);
  height: min(74vh, 640px);
  perspective: 1400px;
  z-index: 12;
}

.swa.is-spatial .swa__table {
  transform: rotateX(62deg) translateZ(0);
}

.swa.is-spatial .swa__table-surface {
  inset: 4% 2%;
  border: 1px solid rgba(120, 220, 255, 0.42);
  background:
    linear-gradient(rgba(80, 200, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 200, 255, 0.08) 1px, transparent 1px),
    radial-gradient(ellipse at center, rgba(80, 200, 255, 0.16) 0%, rgba(0, 0, 0, 0.62) 72%);
  background-size: 24px 24px, 24px 24px, 100% 100%;
  box-shadow:
    0 0 60px rgba(80, 200, 255, 0.2),
    inset 0 0 80px rgba(80, 200, 255, 0.1);
  opacity: 0;
  transform: scaleY(0.3);
  transform-origin: center bottom;
}

.swa.is-spatial.is-assembly-grid .swa__table-surface,
.swa.is-spatial.is-assembly-terrain .swa__table-surface,
.swa.is-spatial.is-assembly-foundations .swa__table-surface,
.swa.is-spatial.is-assembly-buildings .swa__table-surface,
.swa.is-spatial.is-assembly-roads .swa__table-surface,
.swa.is-spatial.is-assembly-transit .swa__table-surface,
.swa.is-spatial.is-assembly-labels .swa__table-surface,
.swa.is-spatial.is-assembly-overlays .swa__table-surface,
.swa.is-spatial.is-assembly-collaborators .swa__table-surface,
.swa.is-spatial.is-assembly-alive .swa__table-surface {
  opacity: 1;
}

.swa.is-spatial.is-assembly-grid .swa__table-surface {
  animation: swa-grid-appear 0.9s ease forwards;
}

.swa.is-spatial.is-assembly-terrain .swa__table-surface,
.swa.is-spatial.is-assembly-foundations .swa__table-surface,
.swa.is-spatial.is-assembly-buildings .swa__table-surface,
.swa.is-spatial.is-assembly-roads .swa__table-surface,
.swa.is-spatial.is-assembly-transit .swa__table-surface,
.swa.is-spatial.is-assembly-labels .swa__table-surface,
.swa.is-spatial.is-assembly-overlays .swa__table-surface,
.swa.is-spatial.is-assembly-collaborators .swa__table-surface,
.swa.is-spatial.is-assembly-alive .swa__table-surface {
  transform: scaleY(1);
}

@keyframes swa-grid-appear {
  from { opacity: 0; transform: scaleY(0.2); }
  to { opacity: 1; transform: scaleY(1); }
}

.swa.is-spatial .swa__roads,
.swa.is-spatial .swa__buildings {
  inset: 4% 2%;
}

.swa.is-spatial .swa__road {
  opacity: 0;
  stroke-dashoffset: 40;
}

.swa.is-spatial.is-assembly-roads .swa__road,
.swa.is-spatial.is-assembly-transit .swa__road,
.swa.is-spatial.is-assembly-labels .swa__road,
.swa.is-spatial.is-assembly-overlays .swa__road,
.swa.is-spatial.is-assembly-collaborators .swa__road,
.swa.is-spatial.is-assembly-alive .swa__road {
  opacity: 1;
  animation: swa-roads-illuminate 1.1s ease forwards, swa-road-flow 12s linear infinite;
}

@keyframes swa-roads-illuminate {
  from { stroke-dashoffset: 80; opacity: 0; }
  to { stroke-dashoffset: 0; opacity: 1; }
}

.swa.is-spatial .swa__building {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
}

.swa.is-spatial.is-assembly-buildings .swa__building,
.swa.is-spatial.is-assembly-roads .swa__building,
.swa.is-spatial.is-assembly-transit .swa__building,
.swa.is-spatial.is-assembly-labels .swa__building,
.swa.is-spatial.is-assembly-overlays .swa__building,
.swa.is-spatial.is-assembly-collaborators .swa__building,
.swa.is-spatial.is-assembly-alive .swa__building {
  animation: swa-building-assemble 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes swa-building-assemble {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) translateY(12px); filter: brightness(2); }
  60% { filter: brightness(1.4); }
  100% { opacity: var(--swa-building-opacity, 1); transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
}

.swa.is-spatial .swa__building.is-fogged {
  --swa-building-opacity: 0.35;
}

.swa.is-spatial .swa__building-label,
.swa.is-spatial .swa__building-level {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.swa.is-spatial.is-labels-visible .swa__building-label,
.swa.is-spatial.is-labels-visible .swa__building-level,
.swa.is-spatial.is-assembly-labels .swa__building-label,
.swa.is-spatial.is-assembly-overlays .swa__building-label,
.swa.is-spatial.is-assembly-collaborators .swa__building-label,
.swa.is-spatial.is-assembly-alive .swa__building-label {
  opacity: 1;
  transform: translateY(0);
}

/* Holographic HUD — no dashboard chrome */
.swa.is-spatial .swa__hud {
  background: transparent;
  padding-top: max(8px, env(safe-area-inset-top));
  z-index: 45;
}

.swa.is-spatial .swa__back {
  border-color: rgba(201, 169, 98, 0.25);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  border-radius: 50%;
}

.swa.is-spatial .swa__title-block {
  text-align: center;
}

.swa.is-spatial .swa__eyebrow,
.swa.is-spatial .swa__title {
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.9);
}

.swa.is-spatial .swa__zoom-out {
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  border-color: rgba(80, 200, 255, 0.3);
}

/* No Panels™ — glass ribbons instead of rectangles */
.swa.is-spatial .swa__focus-panel,
.swa.is-spatial .swa__orb,
.swa.is-spatial .swa__planner-panel,
.swa.is-spatial .swa__planner-toolbar,
.swa.is-spatial .swa__pf-comparison {
  border: 1px solid rgba(120, 220, 255, 0.22);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(0, 0, 0, 0.35) 55%,
    rgba(80, 200, 255, 0.06) 100%
  );
  backdrop-filter: blur(14px);
  box-shadow:
    0 0 24px rgba(80, 200, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  border-radius: 2px;
}

.swa.is-spatial .swa__focus-panel {
  top: auto;
  bottom: max(108px, calc(env(safe-area-inset-bottom) + 92px));
  left: 50%;
  transform: translateX(-50%);
  width: min(88vw, 340px);
  text-align: center;
  animation: swa-annotation-float 4.5s ease-in-out infinite;
}

.swa.is-spatial .swa__orb {
  top: 12%;
  right: auto;
  left: 50%;
  transform: translateX(calc(50% + min(38vw, 220px)));
  width: min(30vw, 148px);
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.swa.is-spatial .swa__orb-sphere {
  display: none;
}

.swa.is-spatial .swa__orb-title {
  font-size: 4px;
  opacity: 0.7;
}

.swa.is-spatial .swa__orb-rec {
  border: 1px solid rgba(120, 220, 255, 0.18);
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
}

@keyframes swa-annotation-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.swa.is-spatial .swa__mode-rail,
.swa.is-spatial .swa__travel-rail {
  background: transparent;
  gap: 6px;
}

.swa.is-spatial .swa__mode-pill,
.swa.is-spatial .swa__travel-pill {
  border: 1px solid rgba(120, 220, 255, 0.2);
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  border-radius: 999px;
}

.swa.is-spatial .swa__breadcrumb {
  top: max(44px, calc(env(safe-area-inset-top) + 36px));
}

.swa.is-spatial .swa__crumb {
  border: 1px solid rgba(120, 220, 255, 0.15);
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
}

.swa.is-spatial .swa__ticker {
  top: max(72px, calc(env(safe-area-inset-top) + 60px));
  opacity: 0.45;
  mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
}

.swa.is-spatial .swa__engine-strip {
  top: max(84px, calc(env(safe-area-inset-top) + 72px));
  justify-content: center;
}

.swa.is-spatial .swa__engine-chip {
  border-color: rgba(120, 220, 255, 0.2);
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(6px);
}

.swa.is-spatial .swa__travel-overlay {
  background:
    radial-gradient(ellipse 80% 50% at 50% 58%, rgba(80, 200, 255, 0.12) 0%, rgba(0, 0, 0, 0.88) 68%);
  backdrop-filter: blur(4px);
}

.swa.is-spatial .swa__travel-overlay .swa__travel-route {
  position: absolute;
  left: 50%;
  bottom: 28%;
  transform: translateX(-50%);
  width: min(80vw, 480px);
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.8), transparent);
  animation: swa-route-pulse 1.2s ease-in-out infinite;
}

@keyframes swa-route-pulse {
  0%, 100% { opacity: 0.4; transform: translateX(-50%) scaleX(0.7); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1); }
}

.swa.is-spatial .swa__travel-collaborators {
  margin-top: 12px;
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.swa.is-spatial.is-assembly-alive .swa__table-glow {
  animation: swa-table-breathe 5s ease-in-out infinite;
}

@keyframes swa-table-breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
}

.swa.is-spatial .swa__extrusion {
  background: linear-gradient(
    180deg,
    rgba(140, 230, 255, 0.9) 0%,
    rgba(60, 150, 210, 0.45) 55%,
    rgba(30, 80, 140, 0.25) 100%
  );
  border-color: rgba(160, 235, 255, 0.55);
  box-shadow:
    0 0 16px rgba(80, 200, 255, 0.4),
    inset 0 0 8px rgba(255, 255, 255, 0.12);
}

.swa.is-spatial .swa__fog-legend {
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  opacity: 0.4;
}
`;
