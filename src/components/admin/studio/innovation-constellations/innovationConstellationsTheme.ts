/** Innovation Constellations™ Observatory — living universe visualization */

export const INNOVATION_CONSTELLATIONS_STYLES = `
body.innovation-constellations-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.ic-observatory {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse 120% 80% at 50% 40%, #0a0e1a 0%, #020408 55%, #000000 100%);
  color: #d8e8ff;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.ic-observatory * { box-sizing: border-box; }

.ic-observatory__stars-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 70% 30%, rgba(110,181,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 75%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 100%);
  opacity: 0.8;
}

.ic-observatory__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
}

.ic-observatory__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(110, 181, 255, 0.45);
  background: rgba(0,0,0,0.55);
  color: #9ecfff;
  font-size: 14px;
  cursor: pointer;
}

.ic-observatory__title-block { flex: 1; min-width: 0; }
.ic-observatory__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.18em; color: #6eb5ff; text-transform: uppercase; }
.ic-observatory__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  color: #d8e8ff;
  text-transform: none;
}

.ic-observatory__orb-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(110, 181, 255, 0.4);
  color: #9ecfff;
  background: rgba(0,0,0,0.5);
}

.ic-observatory__sky {
  position: absolute;
  top: 52px;
  left: 8px;
  right: 8px;
  bottom: 130px;
  border: 1px solid rgba(110, 181, 255, 0.15);
  background: rgba(0, 8, 24, 0.5);
  overflow: hidden;
}

.ic-observatory__celestial {
  position: absolute;
  transform: translate(-50%, -50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  text-align: center;
}

.ic-observatory__celestial-dot {
  display: block;
  border-radius: 50%;
  margin: 0 auto 2px;
  box-shadow: 0 0 12px currentColor;
}

.ic-observatory__celestial-dot.is-blue { background: #6eb5ff; color: #6eb5ff; }
.ic-observatory__celestial-dot.is-white { background: #e8f4ff; color: #e8f4ff; }
.ic-observatory__celestial-dot.is-gold { background: #e8c878; color: #e8c878; }
.ic-observatory__celestial-dot.is-red { background: #f87171; color: #f87171; }
.ic-observatory__celestial-dot.is-anchor { background: #fff; color: #fff; box-shadow: 0 0 20px #e8c878, 0 0 40px #6eb5ff; }
.ic-observatory__celestial-dot.is-sun { border-radius: 50%; box-shadow: 0 0 24px #e8c878, 0 0 48px #fbbf24; }

.ic-observatory__celestial-label {
  font-size: 5px;
  letter-spacing: 0.06em;
  color: rgba(216, 232, 255, 0.85);
  max-width: 64px;
  line-height: 1.2;
  text-transform: uppercase;
}

.ic-observatory__pathway {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(110,181,255,0.6), transparent);
  transform-origin: left center;
  pointer-events: none;
  opacity: 0.5;
}

.ic-observatory__pathway.is-glow { opacity: 0.9; box-shadow: 0 0 6px #6eb5ff; }

.ic-observatory__nav {
  position: absolute;
  top: 56px;
  left: 12px;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 55%;
}

.ic-observatory__nav-pill {
  padding: 4px 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(110, 181, 255, 0.3);
  background: rgba(0,0,0,0.5);
  color: #9ecfff;
  cursor: pointer;
  text-transform: uppercase;
}

.ic-observatory__nav-pill.is-active {
  border-color: #6eb5ff;
  background: rgba(110, 181, 255, 0.2);
}

.ic-observatory__panel {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 25;
  max-height: 120px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid rgba(110, 181, 255, 0.3);
  background: rgba(0,0,0,0.85);
}

.ic-observatory__panel-title {
  margin: 0 0 4px;
  font-size: 6px;
  letter-spacing: 0.14em;
  color: #6eb5ff;
}

.ic-observatory__panel-body {
  margin: 0;
  font-size: 6px;
  line-height: 1.45;
  color: rgba(216, 232, 255, 0.8);
  text-transform: none;
}

.ic-observatory__opp {
  margin-top: 6px;
  padding: 6px;
  border: 1px dashed rgba(110, 181, 255, 0.25);
  background: rgba(0, 20, 40, 0.5);
  font-size: 5px;
  color: rgba(150, 180, 220, 0.75);
  text-transform: none;
}

.ic-observatory__actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.ic-observatory__action-btn {
  flex: 1;
  padding: 6px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(110, 181, 255, 0.35);
  background: rgba(110, 181, 255, 0.12);
  color: #9ecfff;
  cursor: pointer;
}
`;
