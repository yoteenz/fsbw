/** Studio Alpha™ Production Cost HUD — immersive glass overlay for internal founder use. */

export const STUDIO_ALPHA_COST_HUD_STYLES = `
.studio-alpha-cost-hud {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 280;
  transform: translateY(-50%);
  pointer-events: none;
  font-family: "Futura PT", system-ui, sans-serif;
  --sac-accent: #c9a962;
  --sac-glass: rgba(12, 10, 8, 0.72);
  --sac-border: rgba(201, 169, 98, 0.35);
  --sac-text: rgba(255, 252, 245, 0.92);
  --sac-muted: rgba(255, 252, 245, 0.55);
  --sac-est: rgba(147, 197, 253, 0.9);
  --sac-actual: rgba(134, 239, 172, 0.9);
  --sac-unknown: rgba(251, 191, 36, 0.9);
}

.studio-alpha-cost-hud * {
  box-sizing: border-box;
}

.studio-alpha-cost-hud__tab {
  pointer-events: auto;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 10px 6px;
  border: 1px solid var(--sac-border);
  border-right: none;
  border-radius: 8px 0 0 8px;
  background: var(--sac-glass);
  backdrop-filter: blur(12px);
  color: var(--sac-accent);
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.studio-alpha-cost-hud__tab:hover,
.studio-alpha-cost-hud.is-open .studio-alpha-cost-hud__tab {
  background: rgba(201, 169, 98, 0.15);
  color: #f5e6c8;
}

.studio-alpha-cost-hud__drawer {
  pointer-events: auto;
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%) translateX(110%);
  width: min(220px, 42vw);
  max-height: min(78dvh, 520px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 10px 12px;
  border: 1px solid var(--sac-border);
  border-radius: 10px 0 0 10px;
  background: var(--sac-glass);
  backdrop-filter: blur(16px);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: transform 0.28s ease, opacity 0.28s ease;
  scrollbar-width: thin;
  scrollbar-color: var(--sac-border) transparent;
}

.studio-alpha-cost-hud.is-open .studio-alpha-cost-hud__drawer {
  transform: translateY(-50%) translateX(0);
  opacity: 1;
}

.studio-alpha-cost-hud__title {
  margin: 0 0 8px;
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sac-accent);
  font-weight: 600;
}

.studio-alpha-cost-hud__subtitle {
  margin: 0 0 6px;
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sac-muted);
}

.studio-alpha-cost-hud__section {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.studio-alpha-cost-hud__section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.studio-alpha-cost-hud__row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
  font-size: 6.5px;
  line-height: 1.35;
}

.studio-alpha-cost-hud__label {
  color: var(--sac-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.studio-alpha-cost-hud__value {
  color: var(--sac-text);
  text-align: right;
  word-break: break-word;
}

.studio-alpha-cost-hud__value.is-est { color: var(--sac-est); }
.studio-alpha-cost-hud__value.is-actual { color: var(--sac-actual); }
.studio-alpha-cost-hud__value.is-unknown { color: var(--sac-unknown); }

.studio-alpha-cost-hud__status {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 5.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(201, 169, 98, 0.2);
  color: var(--sac-accent);
}

.studio-alpha-cost-hud__status.is-generating {
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  animation: sac-pulse 1.4s ease-in-out infinite;
}

.studio-alpha-cost-hud__status.is-complete {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.studio-alpha-cost-hud__status.is-failed {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.studio-alpha-cost-hud__risk-low { color: #86efac; }
.studio-alpha-cost-hud__risk-moderate { color: #fde047; }
.studio-alpha-cost-hud__risk-high { color: #fb923c; }
.studio-alpha-cost-hud__risk-over { color: #f87171; }

.studio-alpha-cost-hud__roi-name {
  font-size: 6px;
  color: var(--sac-text);
  margin-bottom: 2px;
}

@keyframes sac-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (max-width: 480px) {
  .studio-alpha-cost-hud__drawer {
    width: min(200px, 48vw);
    max-height: 70dvh;
    font-size: 6px;
  }
}
`;
