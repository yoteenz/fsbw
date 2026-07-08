/** Living District Ecology™ — ecosystem overlays, synergy flows, chain reactions */

export const DISTRICT_ECOLOGY_STYLES = `
/* ── Ecology layer ── */
.sw-ecology-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 23;
}

.sw-ecology-layer__balance {
  position: absolute;
  top: calc(var(--wh-frame-hud-h, 48px) + 4px);
  left: calc(var(--sw-rail-w, 168px) + 12px);
  max-width: min(240px, 32vw);
  padding: 6px 10px;
  border: 1px solid rgba(139, 164, 196, 0.32);
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(8px);
  font-size: 7px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(139, 164, 196, 0.95);
  line-height: 1.45;
}

.sw-ecology-layer__balance-value {
  color: #8ba4c4;
  font-size: 9px;
  display: block;
  margin-top: 2px;
}

.sw-ecology-layer__chain {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  bottom: calc(var(--wh-frame-teach-h, 56px) + 12px);
  max-width: min(300px, 40vw);
  padding: 10px 12px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  border-right: 3px solid #8ba4c4;
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.5) 100%);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

.sw-ecology-layer__chain-label {
  margin: 0 0 4px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8ba4c4;
}

.sw-ecology-layer__chain-trigger {
  margin: 0 0 6px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.92);
}

.sw-ecology-layer__chain-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sw-ecology-layer__chain-item {
  font-size: 7px;
  line-height: 1.5;
  color: rgba(212, 196, 160, 0.82);
  margin-bottom: 3px;
  padding-left: 8px;
  border-left: 1px solid rgba(139, 164, 196, 0.25);
}

.sw-ecology-layer__chain-district {
  color: #8ba4c4;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sw-ecology-layer__synergy {
  position: absolute;
  left: calc(var(--sw-rail-w, 168px) + 12px);
  bottom: calc(var(--wh-frame-teach-h, 56px) + 12px);
  max-width: min(220px, 30vw);
  padding: 8px 10px;
  border: 1px solid rgba(184, 212, 168, 0.28);
  background: rgba(0, 0, 0, 0.55);
  font-size: 7px;
  letter-spacing: 0.06em;
  color: rgba(184, 212, 168, 0.9);
}

.sw-ecology-layer__synergy-flow {
  display: block;
  margin-bottom: 3px;
  opacity: 0.55;
}

.sw-ecology-layer__synergy-flow.is-active {
  opacity: 1;
  color: #b8d4a8;
}

/* ── Rail ecology badges ── */
.sw-nav-rail__wing-synergy {
  display: inline-flex;
  margin-left: 3px;
  font-size: 6px;
  color: rgba(139, 164, 196, 0.75);
  letter-spacing: 0.04em;
}

.sw-nav-rail__wing-synergy.is-spillover {
  color: #b8d4a8;
  animation: sw-ecology-flow 2.8s ease-in-out infinite;
}

@keyframes sw-ecology-flow {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}

.sw-nav-rail__ecology-health {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--sw-rail-border-subtle);
}

.sw-nav-rail__ecology-health-title {
  margin: 0 0 6px;
  font-size: 7px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sw-rail-accent-dim, rgba(201, 169, 98, 0.6));
}

.sw-nav-rail__health-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  font-size: 7px;
  color: var(--sw-rail-text-muted, rgba(212, 196, 160, 0.7));
}

.sw-nav-rail__health-bar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  overflow: hidden;
}

.sw-nav-rail__health-fill {
  height: 100%;
  background: var(--sw-rail-accent, #c9a962);
  border-radius: 1px;
  transition: width 0.6s ease;
}

.sw-nav-rail__health-fill.is-rising { background: #b8d4a8; }
.sw-nav-rail__health-fill.is-stagnant { background: rgba(155, 123, 184, 0.6); }

/* ── World ecology tier classes ── */
.wh-world[data-ecology-tier] {
  --sw-ecology-intensity: calc(var(--sw-ecology-tier, 0) * 0.15);
}

.wh-world.sw-ecology--balanced::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse 60% 50% at 50% 50%,
    rgba(139, 164, 196, calc(0.03 + var(--sw-ecology-intensity, 0))),
    transparent 75%
  );
}
`;
