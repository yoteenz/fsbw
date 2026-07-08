/** Studio Command Center™ — Executive Atrium immersive destination styles. */

export const COMMAND_CENTER_DESTINATION_STYLES = `
body.scc-world-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.scc-world {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f5f0e8;
  font-family: "Futura PT", sans-serif;
  touch-action: manipulation;
  background: #080706;
  text-transform: uppercase;
}

.scc-world * { text-transform: uppercase; }

.scc-world__camera { position: absolute; inset: 0; overflow: hidden; }

.scc-world__camera-track {
  display: flex;
  height: 100%;
  width: max-content;
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.scc-world__zone-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  overflow: hidden;
}

.scc-world__zone-panel.is-locked {
  filter: brightness(0.3) saturate(0.45);
  pointer-events: none;
}

.scc-world__interaction-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.scc-world__hotspot { position: absolute; pointer-events: auto; }
.scc-world__hotspot--ghost { background: transparent; border: none; }

.scc-world__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%);
  pointer-events: none;
}
.scc-world__hud > * { pointer-events: auto; }

.scc-world__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.45);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.scc-world__identity { flex: 1; min-width: 0; }
.scc-world__title { margin: 0; font-size: 7px; letter-spacing: 0.14em; color: #c9a962; }
.scc-world__sub { margin: 2px 0 0; font-size: 5px; letter-spacing: 0.08em; opacity: 0.55; }

.scc-world__pill-btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(0,0,0,0.5);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}

.scc-world__enter-btn {
  width: 100%;
  padding: 10px 12px;
  font-size: 6px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(0,0,0,0.55);
  color: #f5f0e8;
  cursor: pointer;
  font-family: inherit;
}

.scc-world__teaching {
  position: absolute;
  left: 50%;
  bottom: max(16px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(92vw, 360px);
  text-align: center;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.75);
  z-index: 16;
  pointer-events: none;
  line-height: 1.5;
}

/* ── Organization Pulse Core™ ── */
.scc-pulse-core {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scc-pulse-core__halo {
  position: absolute;
  width: 88%;
  height: 88%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.18) 0%, transparent 68%);
  animation: scc-pulse-breathe 5s ease-in-out infinite;
}

.scc-pulse-core__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.22);
  pointer-events: none;
}
.scc-pulse-core__ring--outer { width: 92%; height: 92%; animation: scc-ring-spin 48s linear infinite; }
.scc-pulse-core__ring--mid { width: 72%; height: 72%; animation: scc-ring-spin 32s linear infinite reverse; opacity: 0.7; }
.scc-pulse-core__ring--inner { width: 54%; height: 54%; border-color: rgba(235, 28, 36, 0.25); }

@keyframes scc-pulse-breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.04); opacity: 1; }
}
@keyframes scc-ring-spin { to { transform: rotate(360deg); } }

.scc-pulse-core__nucleus {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 12px;
  max-width: 92%;
}

.scc-pulse-core__eyebrow {
  margin: 0 0 4px;
  font-size: 5px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.85);
}

.scc-pulse-core__workspace {
  margin: 0 0 6px;
  font-family: "Covered By Your Grace", cursive;
  font-size: 16px;
  color: #f5f0e8;
  letter-spacing: 0.04em;
}

.scc-pulse-core__priority {
  margin: 0 0 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  color: rgba(235, 28, 36, 0.9);
}

.scc-pulse-core__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.scc-pulse-core__metric {
  padding: 4px 2px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.35);
}
.scc-pulse-core__metric.is-accent {
  border-color: rgba(201, 169, 98, 0.45);
}

.scc-pulse-core__metric-val {
  display: block;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  color: #c9a962;
  line-height: 1.1;
}
.scc-pulse-core__metric-label {
  display: block;
  font-size: 4px;
  letter-spacing: 0.08em;
  opacity: 0.65;
  margin-top: 2px;
}

/* ── Wing portals ── */
.scc-wing-portal {
  width: 100%;
  height: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(201,169,98,0.08) 100%);
  cursor: pointer;
  font-family: inherit;
  color: #f5f0e8;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.scc-wing-portal:hover,
.scc-wing-portal.is-focused {
  border-color: rgba(201, 169, 98, 0.8);
  box-shadow: 0 0 20px rgba(201, 169, 98, 0.2);
}
.scc-wing-portal__icon { font-size: 14px; margin-bottom: 4px; }
.scc-wing-portal__label { font-size: 5px; letter-spacing: 0.1em; color: #c9a962; margin: 0 0 2px; }
.scc-wing-portal__tagline { font-size: 4px; opacity: 0.55; margin: 0 0 4px; line-height: 1.35; }
.scc-wing-portal__stat { font-size: 4px; opacity: 0.7; letter-spacing: 0.06em; }

.scc-world__env-display {
  padding: 6px 10px;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(201, 169, 98, 0.22);
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(245, 240, 232, 0.8);
  text-align: center;
}

.scc-world__station-list {
  position: absolute;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  width: min(88vw, 320px);
  max-height: 22%;
  overflow-y: auto;
  padding: 8px;
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(201, 169, 98, 0.28);
  pointer-events: auto;
  scrollbar-width: none;
}
.scc-world__station-list::-webkit-scrollbar { display: none; }

.scc-world__station-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 5px 6px;
  margin-bottom: 4px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.35);
  color: #f5f0e8;
  cursor: pointer;
  font-family: inherit;
}
.scc-world__station-btn:hover { border-color: rgba(201, 169, 98, 0.5); }
`;
