/** Innovation Expeditions™ Hall — guided knowledge network */

export const INNOVATION_EXPEDITIONS_STYLES = `
body.innovation-expeditions-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.ie-hall {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse 100% 70% at 50% 30%, #1a1410 0%, #0a0806 50%, #000000 100%);
  color: #f5e6c8;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.ie-hall * { box-sizing: border-box; }

.ie-hall__marble {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background: url('/assets/marble-half.png') center/cover;
}

.ie-hall__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%);
}

.ie-hall__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(232, 200, 120, 0.45);
  background: rgba(0,0,0,0.55);
  color: #e8c878;
  font-size: 14px;
  cursor: pointer;
}

.ie-hall__title-block { flex: 1; min-width: 0; }
.ie-hall__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.18em; color: #c9a855; }
.ie-hall__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  color: #f5e6c8;
  text-transform: none;
}

.ie-hall__orb-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(232, 200, 120, 0.4);
  color: #e8c878;
  background: rgba(0,0,0,0.5);
}

.ie-hall__stats {
  position: absolute;
  top: 48px;
  right: 8px;
  z-index: 25;
  display: flex;
  gap: 6px;
}

.ie-hall__stat {
  padding: 6px 8px;
  border: 1px solid rgba(232, 200, 120, 0.25);
  background: rgba(0,0,0,0.5);
  text-align: center;
  min-width: 52px;
}

.ie-hall__stat-val { display: block; font-size: 10px; color: #e8c878; }
.ie-hall__stat-label { font-size: 4px; letter-spacing: 0.1em; color: rgba(245,230,200,0.6); }

.ie-hall__scroll {
  position: absolute;
  top: 52px;
  left: 8px;
  right: 8px;
  bottom: 110px;
  overflow-y: auto;
  padding: 4px 2px;
}

.ie-hall__section-title {
  margin: 8px 0 4px;
  font-size: 6px;
  letter-spacing: 0.14em;
  color: #c9a855;
}

.ie-hall__type-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.ie-hall__type-pill {
  padding: 4px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(232, 200, 120, 0.3);
  background: rgba(0,0,0,0.45);
  color: #e8c878;
  cursor: pointer;
}

.ie-hall__type-pill.is-active {
  border-color: #e8c878;
  background: rgba(232, 200, 120, 0.15);
}

.ie-hall__path-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 8px;
}

.ie-hall__path-pill {
  padding: 3px 6px;
  font-size: 4px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(232, 200, 120, 0.2);
  background: rgba(0,0,0,0.35);
  color: rgba(232, 200, 120, 0.85);
  cursor: pointer;
}

.ie-hall__path-pill.is-active {
  border-color: #e8c878;
  color: #f5e6c8;
}

.ie-hall__card {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  padding: 8px;
  text-align: left;
  border: 1px solid rgba(232, 200, 120, 0.25);
  background: rgba(0,0,0,0.45);
  cursor: pointer;
  color: inherit;
}

.ie-hall__card.is-active {
  border-color: #e8c878;
  background: rgba(232, 200, 120, 0.1);
}

.ie-hall__card-title { margin: 0; font-size: 7px; color: #f5e6c8; }
.ie-hall__card-meta { margin: 3px 0 0; font-size: 5px; color: rgba(245,230,200,0.7); text-transform: none; }

.ie-hall__tour {
  margin-top: 8px;
  padding: 10px;
  border: 1px solid rgba(232, 200, 120, 0.35);
  background: rgba(20, 14, 8, 0.7);
}

.ie-hall__stop-title { margin: 0 0 4px; font-size: 7px; color: #e8c878; }
.ie-hall__stop-location { margin: 0 0 6px; font-size: 5px; color: #c9a855; }
.ie-hall__stop-story {
  margin: 0;
  font-size: 6px;
  line-height: 1.45;
  color: rgba(245, 230, 200, 0.85);
  text-transform: none;
}

.ie-hall__progress {
  display: flex;
  gap: 3px;
  margin: 8px 0;
}

.ie-hall__progress-dot {
  flex: 1;
  height: 3px;
  background: rgba(232, 200, 120, 0.2);
}

.ie-hall__progress-dot.is-done { background: #e8c878; }
.ie-hall__progress-dot.is-current { background: #f5e6c8; }

.ie-hall__mission {
  margin-top: 6px;
  padding: 6px;
  border: 1px dashed rgba(232, 200, 120, 0.25);
  font-size: 5px;
  color: rgba(245, 230, 200, 0.75);
  text-transform: none;
}

.ie-hall__event {
  margin-bottom: 4px;
  padding: 5px 6px;
  border: 1px solid rgba(232, 200, 120, 0.15);
  font-size: 5px;
  color: rgba(245, 230, 200, 0.7);
  text-transform: none;
}

.ie-hall__guide {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 25;
  padding: 10px;
  border: 1px solid rgba(232, 200, 120, 0.35);
  background: rgba(0,0,0,0.88);
}

.ie-hall__guide-text {
  margin: 0 0 8px;
  font-size: 6px;
  line-height: 1.45;
  color: rgba(245, 230, 200, 0.85);
  text-transform: none;
}

.ie-hall__actions { display: flex; gap: 6px; }

.ie-hall__action-btn {
  flex: 1;
  padding: 6px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(232, 200, 120, 0.35);
  background: rgba(232, 200, 120, 0.12);
  color: #e8c878;
  cursor: pointer;
}
`;
