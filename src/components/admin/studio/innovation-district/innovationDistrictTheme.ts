/** Innovation District™ — collaborative invention campus styles */

export const INNOVATION_DISTRICT_STYLES = `
body.innovation-district-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.inno-district {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 50% 15%, rgba(124, 92, 255, 0.12) 0%, transparent 55%),
    radial-gradient(ellipse 100% 70% at 50% 60%, #0e0c18 0%, #06050a 55%, #020103 100%);
  color: #e8e4ff;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.inno-district * { box-sizing: border-box; text-transform: uppercase; }

.inno-district__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.inno-district__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%);
}

.inno-district__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(124, 92, 255, 0.5);
  background: rgba(0,0,0,0.55);
  color: #b8a8ff;
  font-size: 14px;
  cursor: pointer;
}

.inno-district__title-block { flex: 1; min-width: 0; }
.inno-district__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.18em; color: #9d8cff; }
.inno-district__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #e8e4ff;
  text-transform: none;
}

.inno-district__orb-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(124, 92, 255, 0.45);
  color: #b8a8ff;
  background: rgba(0,0,0,0.5);
}

.inno-district__stats {
  position: absolute;
  top: 52px;
  left: 8px;
  right: 8px;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.inno-district__stat {
  padding: 8px 6px;
  border: 1px solid rgba(124, 92, 255, 0.25);
  background: rgba(0,0,0,0.45);
  text-align: center;
}

.inno-district__stat-val {
  display: block;
  font-family: "Covered By Your Grace", cursive;
  font-size: 16px;
  color: #c4b5ff;
  text-transform: none;
}

.inno-district__stat-label {
  display: block;
  margin-top: 2px;
  font-size: 5px;
  letter-spacing: 0.1em;
  color: rgba(232, 228, 255, 0.65);
}

.inno-district__campus {
  position: absolute;
  top: 118px;
  left: 8px;
  right: 8px;
  bottom: 140px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 10;
}

.inno-district__section-title {
  margin: 0 0 6px;
  font-size: 6px;
  letter-spacing: 0.14em;
  color: #9d8cff;
}

.inno-district__card {
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid rgba(124, 92, 255, 0.3);
  background: rgba(14, 10, 28, 0.75);
}

.inno-district__card-head {
  margin: 0 0 4px;
  font-size: 8px;
  letter-spacing: 0.08em;
  color: #e8e4ff;
}

.inno-district__card-body {
  margin: 0;
  font-size: 7px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: rgba(232, 228, 255, 0.75);
  text-transform: none;
}

.inno-district__presence-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 6px;
}

.inno-district__presence-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

.inno-district__presence-dot.is-observing { background: #fbbf24; }
.inno-district__presence-dot.is-idle { background: #6b7280; }

.inno-district__contrib-bar {
  display: flex;
  height: 6px;
  margin-top: 8px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}

.inno-district__contrib-seg {
  height: 100%;
  min-width: 2px;
}

.inno-district__contrib-legend {
  margin-top: 4px;
  font-size: 5px;
  color: rgba(232, 228, 255, 0.6);
  letter-spacing: 0.06em;
}

.inno-district__publish-bar {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 25;
  padding: 10px;
  border: 1px solid rgba(124, 92, 255, 0.45);
  background: rgba(0,0,0,0.82);
}

.inno-district__publish-prompt {
  margin: 0 0 8px;
  font-size: 7px;
  line-height: 1.4;
  color: #e8e4ff;
  text-transform: none;
}

.inno-district__publish-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.inno-district__publish-btn {
  padding: 6px 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(124, 92, 255, 0.4);
  background: rgba(124, 92, 255, 0.15);
  color: #d4c8ff;
  cursor: pointer;
}

.inno-district__publish-btn.is-primary {
  border-color: #7c5cff;
  background: rgba(124, 92, 255, 0.35);
  color: #fff;
}

.inno-district__curator {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 88px;
  z-index: 20;
  padding: 8px;
  font-size: 6px;
  line-height: 1.4;
  letter-spacing: 0.05em;
  color: rgba(200, 190, 255, 0.85);
  border-top: 1px solid rgba(124, 92, 255, 0.2);
  text-transform: none;
}
`;
