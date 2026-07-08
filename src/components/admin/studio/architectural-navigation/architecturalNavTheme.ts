/** Architectural Navigation Rail™ + Frame Status — museum signage language */

export const ARCHITECTURAL_NAV_STYLES = `
:root {
  --sw-rail-w: 168px;
  --sw-rail-w-expanded: 168px;
  --sw-rail-w-compact: 48px;
}

/* ── Navigation Rail ── */
.sw-nav-rail {
  position: absolute;
  left: 0;
  top: var(--wh-frame-hud-h, 48px);
  bottom: var(--wh-frame-teach-h, 56px);
  width: var(--sw-rail-w, 168px);
  z-index: 28;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.62) 88%, transparent 100%);
  border-right: 1px solid rgba(201, 169, 98, 0.28);
  overflow: hidden;
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: auto;
}

.sw-nav-rail.is-hidden {
  width: 0;
  border-right-color: transparent;
  pointer-events: none;
}

.sw-nav-rail__reveal {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 29;
  width: 14px;
  padding: 12px 2px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  border-left: none;
  background: rgba(0, 0, 0, 0.72);
  color: #c9a962;
  font-size: 8px;
  cursor: pointer;
  pointer-events: auto;
  writing-mode: vertical-rl;
  letter-spacing: 0.12em;
}

.sw-nav-rail__header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 8px 6px 6px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.15);
}

.sw-nav-rail__mode-btn {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0, 0, 0, 0.45);
  color: #c9a962;
  font-size: 10px;
  cursor: pointer;
  line-height: 1;
}

.sw-nav-rail__scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px 4px 8px;
  scrollbar-width: none;
}

.sw-nav-rail__scroll::-webkit-scrollbar { display: none; }

/* Atlas — always first */
.sw-nav-rail__atlas {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  margin-bottom: 4px;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.12), rgba(0, 0, 0, 0.55));
  color: #f5f0e8;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.sw-nav-rail.is-compact .sw-nav-rail__atlas {
  justify-content: center;
  padding: 8px 4px;
}

.sw-nav-rail__atlas-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.sw-nav-rail__atlas-label {
  font-size: 6px;
  letter-spacing: 0.12em;
  color: #c9a962;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail.is-compact .sw-nav-rail__atlas-label,
.sw-nav-rail.is-compact .sw-nav-rail__section-title,
.sw-nav-rail.is-compact .sw-nav-rail__location-stack,
.sw-nav-rail.is-compact .sw-nav-rail__frame-status,
.sw-nav-rail.is-compact .sw-nav-rail__dest-label,
.sw-nav-rail.is-compact .sw-nav-rail__wing-label,
.sw-nav-rail.is-compact .sw-nav-rail__room-label {
  display: none;
}

/* Location stack */
.sw-nav-rail__location {
  padding: 6px;
  margin-bottom: 6px;
  border: 1px solid rgba(201, 169, 98, 0.18);
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.sw-nav-rail__location-line {
  margin: 0;
  font-size: 5px;
  letter-spacing: 0.08em;
  line-height: 1.45;
  color: rgba(245, 240, 232, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail__location-line.is-headquarters { color: #c9a962; font-size: 5.5px; }
.sw-nav-rail__location-line.is-wing { opacity: 0.75; padding-left: 4px; }
.sw-nav-rail__location-line.is-room { opacity: 0.92; padding-left: 8px; color: #f5f0e8; }
.sw-nav-rail__location-arrow {
  display: block;
  font-size: 4px;
  opacity: 0.35;
  padding-left: 2px;
  line-height: 1;
}

/* Frame status embedded in rail */
.sw-nav-rail__frame-status {
  padding: 6px;
  margin-bottom: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.sw-nav-rail__status-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-size: 3.5px;
  letter-spacing: 0.06em;
  padding: 2px 0;
  opacity: 0.72;
  min-width: 0;
}

.sw-nav-rail__status-row span:first-child {
  flex-shrink: 0;
  opacity: 0.55;
}

.sw-nav-rail__status-row span:last-child {
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  color: rgba(245, 240, 232, 0.9);
}

/* Sections */
.sw-nav-rail__section {
  margin-bottom: 8px;
  overflow: hidden;
}

.sw-nav-rail__section-title {
  margin: 0 0 4px 4px;
  font-size: 4px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.55);
}

.sw-nav-rail__wing {
  margin-bottom: 4px;
  overflow: hidden;
}

.sw-nav-rail__wing-label {
  margin: 0 0 2px;
  font-size: 4px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.65);
  padding: 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail__rooms {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sw-nav-rail__room-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 4px;
  border: 1px solid rgba(201, 169, 98, 0.12);
  background: rgba(0, 0, 0, 0.4);
  color: rgba(245, 240, 232, 0.78);
  font-size: 4px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  min-width: 0;
}

.sw-nav-rail.is-compact .sw-nav-rail__room-btn {
  justify-content: center;
  padding: 6px 2px;
}

.sw-nav-rail__room-btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.sw-nav-rail__room-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.sw-nav-rail__room-dot {
  flex-shrink: 0;
  font-size: 5px;
  opacity: 0.5;
}

.sw-nav-rail__room-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* Primary destinations */
.sw-nav-rail__dest-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 4px;
  margin-bottom: 2px;
  border: 1px solid rgba(201, 169, 98, 0.1);
  background: transparent;
  color: rgba(245, 240, 232, 0.65);
  font-size: 4px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
}

.sw-nav-rail.is-compact .sw-nav-rail__dest-btn {
  justify-content: center;
}

.sw-nav-rail__dest-icon {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1;
}

.sw-nav-rail__dest-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail__dest-btn:hover {
  border-color: rgba(201, 169, 98, 0.35);
  color: #f5f0e8;
}

/* Compact active indicator */
.sw-nav-rail.is-compact .sw-nav-rail__room-btn.is-active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  background: #c9a962;
}

.sw-nav-rail.is-compact .sw-nav-rail__room-btn {
  position: relative;
}

/* HUD frame status strip */
.sw-frame-status-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
  max-width: 100%;
  overflow: hidden;
}

.sw-frame-status-chip {
  font-size: 3.5px;
  letter-spacing: 0.06em;
  padding: 2px 5px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(245, 240, 232, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
`;
