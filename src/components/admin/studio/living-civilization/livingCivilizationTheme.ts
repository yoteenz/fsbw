/** Living Civilization™ — civilization pulse, economies, cultural identity */

export const LIVING_CIVILIZATION_STYLES = `
.sw-civilization-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 22;
}

.sw-civilization-layer__pulse {
  position: absolute;
  top: calc(var(--wh-frame-hud-h, 48px) + 52px);
  left: calc(var(--sw-rail-w, 168px) + 12px);
  max-width: min(260px, 34vw);
  padding: 8px 10px;
  border: 1px solid rgba(212, 196, 160, 0.28);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
}

.sw-civilization-layer__stage {
  margin: 0 0 3px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.85);
}

.sw-civilization-layer__health {
  margin: 0 0 4px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.04em;
}

.sw-civilization-layer__founder {
  margin: 0;
  font-size: 7px;
  line-height: 1.45;
  color: rgba(212, 196, 160, 0.78);
  font-style: italic;
}

.sw-civilization-layer__economies {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  top: calc(var(--wh-frame-hud-h, 48px) + 52px);
  max-width: min(200px, 28vw);
  padding: 8px 10px;
  border: 1px solid rgba(201, 169, 98, 0.22);
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(6px);
}

.sw-civilization-layer__economy-title {
  margin: 0 0 6px;
  font-size: 7px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 169, 98, 0.75);
}

.sw-civilization-layer__economy-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 7px;
  color: rgba(212, 196, 160, 0.82);
}

.sw-civilization-layer__economy-capital {
  color: #c9a962;
  font-size: 8px;
}

.sw-civilization-layer__economy-capital.is-growing { color: #b8d4a8; }
.sw-civilization-layer__economy-capital.is-contracting { color: rgba(155, 123, 184, 0.85); }

.sw-civilization-layer__consequence {
  position: absolute;
  left: 50%;
  bottom: calc(var(--wh-frame-teach-h, 56px) + 12px);
  transform: translateX(-50%);
  max-width: min(420px, 56vw);
  padding: 8px 14px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0, 0, 0, 0.72);
  text-align: center;
  pointer-events: auto;
}

.sw-civilization-layer__consequence-order {
  font-size: 6px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9a962;
  margin-bottom: 3px;
}

.sw-civilization-layer__consequence-trigger {
  margin: 0 0 4px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.sw-civilization-layer__consequence-ripple {
  margin: 0;
  font-size: 7px;
  line-height: 1.45;
  color: rgba(212, 196, 160, 0.78);
}

.sw-civilization-layer__culture {
  position: absolute;
  left: calc(var(--sw-rail-w, 168px) + 12px);
  bottom: calc(var(--wh-frame-teach-h, 56px) + 80px);
  max-width: min(220px, 30vw);
  padding: 6px 8px;
  border-left: 2px solid rgba(201, 169, 98, 0.45);
  background: rgba(0, 0, 0, 0.45);
  font-size: 7px;
  color: rgba(212, 196, 160, 0.75);
  line-height: 1.4;
}

.wh-world.sw-civilization--self-balancing::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse 70% 55% at 50% 45%,
    rgba(201, 169, 98, 0.04),
    transparent 78%
  );
}

.sw-nav-rail__civilization-layer {
  margin-top: 6px;
  padding: 6px 0;
  border-top: 1px solid var(--sw-rail-border-subtle);
  font-size: 7px;
  color: var(--sw-rail-text-muted, rgba(212, 196, 160, 0.7));
}

.sw-nav-rail__civilization-layer-name {
  color: var(--sw-rail-accent, #c9a962);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
`;
