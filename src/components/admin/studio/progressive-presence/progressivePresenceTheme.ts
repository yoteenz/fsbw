/** Progressive Presence™ — Article K18 ambient UI surfaces */

export const PROGRESSIVE_PRESENCE_STYLES = `
.sw-world-health-ambient {
  margin: 6px 0;
}

.sw-world-health-ambient__trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 4px 5px;
  border: 1px solid var(--sw-rail-border-subtle, rgba(201, 169, 98, 0.2));
  background: var(--sw-rail-surface, rgba(0, 0, 0, 0.35));
  color: var(--sw-rail-text, rgba(245, 240, 232, 0.75));
  font-size: 5px;
  letter-spacing: 0.08em;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
}

.sw-world-health-ambient__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(120, 200, 140, 0.85);
  flex-shrink: 0;
  animation: sw-world-health-pulse 2.4s ease-in-out infinite;
}

@keyframes sw-world-health-pulse {
  0%, 100% { opacity: 0.65; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.sw-world-health-ambient__label {
  flex: 1;
  text-align: left;
}

.sw-world-health-ambient__value {
  color: var(--sw-rail-accent, #c9a962);
}

.sw-world-health-ambient__panel {
  margin-top: 4px;
  padding: 6px 5px;
  border: 1px solid var(--sw-rail-border, rgba(201, 169, 98, 0.28));
  background: rgba(0, 0, 0, 0.55);
  animation: sw-world-health-reveal 0.25s ease-out;
}

@keyframes sw-world-health-reveal {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.sw-world-health-ambient__balance {
  margin: 0 0 4px;
  font-size: 4.5px;
  opacity: 0.7;
}

.sw-world-health-ambient__row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 4.5px;
  margin-bottom: 3px;
}

.sw-world-health-ambient__bar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
}

.sw-world-health-ambient__fill {
  height: 100%;
  background: rgba(120, 200, 140, 0.7);
}

.sw-world-health-ambient__fill.is-rising {
  background: rgba(201, 169, 98, 0.85);
}

.sw-world-health-ambient__fill.is-stagnant {
  background: rgba(180, 180, 180, 0.5);
}

.sw-world-health-ambient__civilization {
  margin: 4px 0 0;
  font-size: 4.5px;
  opacity: 0.65;
}

.sw-world-health-ambient__collapse {
  margin-top: 5px;
  padding: 3px 5px;
  font-size: 4.5px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: transparent;
  color: rgba(201, 169, 98, 0.8);
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
}

/* Progressive Presence — living overlays hidden until World Health tap or explore */
:not(.is-presence-earned) .sw-living-layer,
:not(.is-presence-earned) .sw-ecology-layer,
:not(.is-presence-earned) .sw-civilization-layer {
  opacity: 0;
  pointer-events: none;
}

.is-presence-earned .sw-living-layer,
.is-presence-earned .sw-ecology-layer,
.is-presence-earned .sw-civilization-layer {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.35s ease;
}
`;
