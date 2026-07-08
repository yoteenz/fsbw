/** Civilization Events™ — world-scale events, discoveries, Grand Challenge */

export const CIVILIZATION_EVENTS_STYLES = `
.sw-events-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 21;
}

.sw-events-layer__banner {
  position: absolute;
  top: calc(var(--wh-frame-hud-h, 48px) + 4px);
  left: 50%;
  transform: translateX(-50%);
  max-width: min(480px, 62vw);
  padding: 6px 14px;
  border: 1px solid rgba(232, 200, 120, 0.4);
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(10px);
  text-align: center;
}

.sw-events-layer__banner-label {
  margin: 0 0 2px;
  font-size: 6px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #e8c878;
}

.sw-events-layer__banner-title {
  margin: 0;
  font-size: 8px;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.92);
}

.sw-events-layer__grand {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  top: calc(var(--wh-frame-hud-h, 48px) + 100px);
  max-width: min(240px, 32vw);
  padding: 8px 10px;
  border: 1px solid rgba(232, 200, 120, 0.35);
  border-right: 3px solid #e8c878;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(6px);
}

.sw-events-layer__grand-label {
  margin: 0 0 4px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e8c878;
}

.sw-events-layer__grand-theme {
  margin: 0 0 4px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.9);
}

.sw-events-layer__grand-progress {
  margin: 0;
  font-size: 7px;
  color: rgba(212, 196, 160, 0.78);
}

.sw-events-layer__discoveries {
  position: absolute;
  left: calc(var(--sw-rail-w, 168px) + 12px);
  top: calc(var(--wh-frame-hud-h, 48px) + 100px);
  max-width: min(220px, 30vw);
  padding: 8px 10px;
  border: 1px solid rgba(201, 169, 98, 0.28);
  background: rgba(0, 0, 0, 0.55);
}

.sw-events-layer__discoveries-title {
  margin: 0 0 6px;
  font-size: 7px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.85);
}

.sw-events-layer__discovery-item {
  display: block;
  margin-bottom: 4px;
  font-size: 7px;
  line-height: 1.4;
  color: rgba(184, 212, 168, 0.9);
}

.sw-events-layer__discovery-item.is-locked {
  color: rgba(212, 196, 160, 0.45);
  opacity: 0.7;
}

.sw-events-layer__collab {
  position: absolute;
  left: 50%;
  bottom: calc(var(--wh-frame-teach-h, 56px) + 72px);
  transform: translateX(-50%);
  max-width: min(400px, 54vw);
  padding: 8px 12px;
  border: 1px solid rgba(155, 123, 184, 0.35);
  background: rgba(0, 0, 0, 0.65);
  text-align: center;
  pointer-events: auto;
}

.sw-events-layer__collab-label {
  margin: 0 0 3px;
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9b7bb8;
}

.sw-events-layer__collab-team {
  margin: 0;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.88);
}

.sw-events-layer__frontier {
  position: absolute;
  left: calc(var(--sw-rail-w, 168px) + 12px);
  bottom: calc(var(--wh-frame-teach-h, 56px) + 16px);
  max-width: min(260px, 34vw);
  padding: 8px 10px;
  border: 1px solid rgba(168, 196, 184, 0.28);
  border-left: 3px solid rgba(184, 212, 168, 0.65);
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(6px);
}

.sw-events-layer__frontier-label {
  margin: 0 0 4px;
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(184, 212, 168, 0.85);
}

.sw-events-layer__frontier-prompt {
  margin: 0 0 4px;
  font-size: 8px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.82);
  font-style: italic;
}

.sw-events-layer__frontier-investigation {
  margin: 0;
  font-size: 7px;
  color: rgba(168, 196, 184, 0.78);
}

.wh-world.sw-events--active::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse 80% 40% at 50% 0%,
    rgba(232, 200, 120, 0.05),
    transparent 65%
  );
}

.sw-nav-rail__events {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--sw-rail-border-subtle);
}

.sw-nav-rail__events-title {
  margin: 0 0 6px;
  font-size: 7px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e8c878;
}

.sw-nav-rail__event-row {
  margin-bottom: 5px;
  font-size: 7px;
  line-height: 1.35;
  color: var(--sw-rail-text-muted, rgba(212, 196, 160, 0.75));
}

.sw-nav-rail__event-row.is-active {
  color: var(--sw-rail-accent, #c9a962);
}

.sw-nav-rail__event-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #e8c878;
  margin-right: 4px;
  vertical-align: middle;
  animation: sw-event-pulse 2s ease-in-out infinite;
}

@keyframes sw-event-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
`;
