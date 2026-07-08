/** Global Atlas Layer™ — projected holographic navigation overlay */

export const GLOBAL_ATLAS_LAYER_STYLES = `
body.global-atlas-layer-open {
  overflow: hidden;
}

.gal-root {
  position: fixed;
  inset: 0;
  z-index: 100060;
  pointer-events: none;
}

.gal-root.is-open {
  pointer-events: auto;
}

.gal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(2, 2, 1, 0.42);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.gal-root.is-open .gal-backdrop {
  opacity: 1;
}

.gal-panel {
  position: absolute;
  left: 50%;
  bottom: max(72px, calc(env(safe-area-inset-bottom) + 64px));
  transform: translateX(-50%) translateY(12px) scale(0.96);
  width: min(96vw, 420px);
  max-height: min(72vh, 560px);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: linear-gradient(165deg, rgba(12, 10, 8, 0.92) 0%, rgba(4, 3, 2, 0.88) 100%);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55), 0 0 40px rgba(201, 169, 98, 0.12);
  opacity: 0;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
  pointer-events: auto;
  font-family: "Futura PT", sans-serif;
  color: #e8e0d4;
  text-transform: uppercase;
}

.gal-root.is-open .gal-panel {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.gal-anchor-story-table .gal-panel { box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 48px rgba(201, 169, 98, 0.18); }
.gal-anchor-warehouse-floor .gal-panel { box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 36px rgba(139, 164, 196, 0.2); }
.gal-anchor-museum-exhibit .gal-panel { box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 36px rgba(155, 123, 184, 0.18); }

.gal-hud {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 10px 6px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.2);
}

.gal-close {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.45);
  color: #c9a962;
  cursor: pointer;
  font-size: 12px;
}

.gal-title-block { flex: 1; min-width: 0; }
.gal-eyebrow { margin: 0; font-size: 5px; letter-spacing: 0.16em; color: #c9a962; }
.gal-title { margin: 2px 0 0; font-size: 7px; letter-spacing: 0.1em; }
.gal-anchor-line { margin: 3px 0 0; font-size: 5px; letter-spacing: 0.08em; opacity: 0.6; }

.gal-location {
  padding: 8px 10px;
  font-size: 5px;
  letter-spacing: 0.06em;
  line-height: 1.5;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  color: #d4c4a0;
}

.gal-location strong { color: #c9a962; font-weight: 600; }

.gal-collaborators {
  margin: 0 10px 8px;
  padding: 8px;
  border: 1px solid rgba(124, 92, 255, 0.25);
  background: rgba(0,0,0,0.35);
}

.gal-collaborators-title {
  margin: 0 0 4px;
  font-size: 5px;
  letter-spacing: 0.14em;
  color: #9d8cff;
}

.gal-collaborator-row {
  margin: 2px 0 0;
  font-size: 6px;
  letter-spacing: 0.06em;
  color: rgba(232, 228, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.gal-collaborator-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

.gal-lineage-hint {
  margin: 0 10px 8px;
  padding: 6px 8px;
  font-size: 6px;
  letter-spacing: 0.08em;
  color: rgba(232, 168, 76, 0.9);
  border: 1px solid rgba(232, 168, 76, 0.25);
  background: rgba(0,0,0,0.35);
}

.gal-table {
  position: relative;
  flex: 1;
  min-height: 160px;
  margin: 8px 10px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  border-radius: 2px;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201, 169, 98, 0.08) 0%, transparent 70%),
    repeating-linear-gradient(0deg, transparent 0, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px),
    repeating-linear-gradient(90deg, transparent 0, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px);
  overflow: hidden;
}

.gal-table-surface {
  position: absolute;
  inset: 0;
}

.gal-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.gal-marker-pillar {
  width: 10px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(201,169,98,0.9) 0%, rgba(80,60,30,0.6) 100%);
  border: 1px solid rgba(201,169,98,0.5);
  transition: height 0.3s ease, box-shadow 0.3s ease;
}

.gal-marker.is-here .gal-marker-pillar {
  box-shadow: 0 0 14px rgba(235, 28, 36, 0.55);
  border-color: rgba(235, 28, 36, 0.65);
}

.gal-marker.is-selected .gal-marker-pillar {
  box-shadow: 0 0 12px rgba(201, 169, 98, 0.7);
}

.gal-marker-label {
  display: block;
  margin-top: 2px;
  font-size: 4px;
  letter-spacing: 0.06em;
  max-width: 72px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c9b896;
}

.gal-shortcuts {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 6px 10px;
  -webkit-overflow-scrolling: touch;
}

.gal-shortcuts::-webkit-scrollbar { display: none; }

.gal-shortcut {
  flex: 0 0 auto;
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.28);
  background: rgba(0,0,0,0.45);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}

.gal-travel-bar {
  display: flex;
  gap: 4px;
  padding: 0 10px 6px;
  overflow-x: auto;
}

.gal-travel-pill {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.35);
  color: #a89878;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.gal-travel-pill.is-active {
  border-color: rgba(201, 169, 98, 0.55);
  color: #c9a962;
}

.gal-actions {
  display: flex;
  gap: 6px;
  padding: 8px 10px 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.gal-go-btn {
  flex: 1;
  padding: 10px;
  font-size: 6px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.14);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}

.gal-go-btn:disabled { opacity: 0.4; cursor: wait; }

.gal-orb-hint {
  padding: 0 10px 8px;
  font-size: 5px;
  letter-spacing: 0.06em;
  line-height: 1.45;
  color: #8a7a62;
}

/* Cinematic travel — room stays visible underneath */
.gal-travel-overlay {
  position: fixed;
  inset: 0;
  z-index: 100070;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  pointer-events: none;
}

.gal-travel-overlay.is-walk { animation: gal-travel-walk 1.4s ease forwards; }
.gal-travel-overlay.is-elevator { animation: gal-travel-elevator 0.9s ease forwards; }
.gal-travel-overlay.is-fast { animation: gal-travel-fast 0.6s ease forwards; }
.gal-travel-overlay.is-tour { animation: gal-travel-tour 2.2s ease forwards; }

.gal-travel-msg {
  font-size: 7px;
  letter-spacing: 0.14em;
  color: #c9a962;
  text-align: center;
  padding: 12px 20px;
  border: 1px solid rgba(201, 169, 98, 0.4);
  background: rgba(0,0,0,0.7);
}

@keyframes gal-travel-walk {
  0% { opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes gal-travel-elevator {
  0% { opacity: 0; transform: translateY(8px); }
  30% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-12px); }
}
@keyframes gal-travel-fast {
  0% { opacity: 0; transform: scale(1.04); }
  40% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; }
}
@keyframes gal-travel-tour {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
`;
