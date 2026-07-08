/** Architectural Navigation Rail™ — universal structure, district-themed via CSS variables */

export const ARCHITECTURAL_NAV_STYLES = `
:root {
  --sw-rail-w: 168px;
  --sw-rail-w-expanded: 168px;
  --sw-rail-w-compact: 48px;
}

/* ── Navigation Rail (structure — materials via district themes) ── */
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
  background: var(--sw-rail-bg);
  border-right: 1px solid var(--sw-rail-border);
  overflow: hidden;
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s ease, background 0.4s ease;
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
  border: 1px solid var(--sw-rail-border);
  border-left: none;
  background: rgba(0, 0, 0, 0.78);
  color: var(--sw-rail-accent);
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
  border-bottom: 1px solid var(--sw-rail-border-subtle);
}

.sw-nav-rail__mode-btn {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1px solid var(--sw-rail-border);
  background: var(--sw-rail-surface);
  color: var(--sw-rail-accent);
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

.sw-nav-rail__atlas {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  margin-bottom: 4px;
  border: 1px solid var(--sw-rail-border);
  background: var(--sw-rail-atlas-bg);
  color: var(--sw-rail-text);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.sw-nav-rail.is-compact .sw-nav-rail__atlas {
  justify-content: center;
  padding: 8px 4px;
}

.sw-nav-rail__atlas-icon { font-size: 14px; flex-shrink: 0; line-height: 1; }

.sw-nav-rail__atlas-label {
  font-size: 6px;
  letter-spacing: 0.12em;
  color: var(--sw-rail-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail.is-compact .sw-nav-rail__atlas-label,
.sw-nav-rail.is-compact .sw-nav-rail__section-title,
.sw-nav-rail.is-compact .sw-nav-rail__frame-status,
.sw-nav-rail.is-compact .sw-nav-rail__dest-label,
.sw-nav-rail.is-compact .sw-nav-rail__wing-label,
.sw-nav-rail.is-compact .sw-nav-rail__room-label {
  display: none;
}

.sw-nav-rail__location {
  padding: 6px;
  margin-bottom: 6px;
  border: 1px solid var(--sw-rail-border-subtle);
  background: var(--sw-rail-surface);
  overflow: hidden;
}

.sw-nav-rail__location-line {
  margin: 0;
  font-size: 5px;
  letter-spacing: 0.08em;
  line-height: 1.45;
  color: var(--sw-rail-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-nav-rail__location-line.is-headquarters { color: var(--sw-rail-accent); font-size: 5.5px; }
.sw-nav-rail__location-line.is-wing { opacity: 0.75; padding-left: 4px; }
.sw-nav-rail__location-line.is-room { opacity: 0.92; padding-left: 8px; }

.sw-nav-rail__location-arrow {
  display: block;
  font-size: 4px;
  opacity: 0.35;
  padding-left: 2px;
  line-height: 1;
  color: var(--sw-rail-accent-dim);
}

.sw-nav-rail__frame-status {
  padding: 6px;
  margin-bottom: 8px;
  border-top: 1px solid var(--sw-rail-border-subtle);
  border-bottom: 1px solid var(--sw-rail-border-subtle);
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

.sw-nav-rail__status-row span:first-child { flex-shrink: 0; opacity: 0.55; }
.sw-nav-rail__status-row span:last-child {
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  color: var(--sw-rail-text);
}

.sw-nav-rail__section { margin-bottom: 8px; overflow: hidden; }

.sw-nav-rail__section-title {
  margin: 0 0 4px 4px;
  font-size: 4px;
  letter-spacing: 0.14em;
  color: var(--sw-rail-accent-dim);
}

.sw-nav-rail__wing { margin-bottom: 4px; overflow: hidden; }

.sw-nav-rail__wing-label {
  margin: 0 0 2px;
  font-size: 4px;
  letter-spacing: 0.08em;
  color: var(--sw-rail-accent-dim);
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
  border: 1px solid var(--sw-rail-border-subtle);
  background: var(--sw-rail-surface);
  color: var(--sw-rail-text-muted, var(--sw-rail-text));
  font-size: 4px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  min-width: 0;
  transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
}

.sw-nav-rail.is-compact .sw-nav-rail__room-btn {
  justify-content: center;
  padding: 6px 2px;
}

.sw-nav-rail__room-btn.is-active {
  border-color: var(--sw-rail-accent);
  color: var(--sw-rail-accent);
  background: var(--sw-rail-accent-glow);
}

.sw-nav-rail__room-btn:disabled { opacity: 0.28; cursor: not-allowed; }
.sw-nav-rail__room-dot { flex-shrink: 0; font-size: 5px; opacity: 0.5; color: var(--sw-rail-accent-dim); }

.sw-nav-rail__room-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.sw-nav-rail__dest-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 4px;
  margin-bottom: 2px;
  border: 1px solid var(--sw-rail-border-subtle);
  background: transparent;
  color: var(--sw-rail-text-muted, var(--sw-rail-text));
  font-size: 4px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
}

.sw-nav-rail.is-compact .sw-nav-rail__dest-btn { justify-content: center; }
.sw-nav-rail__dest-icon { flex-shrink: 0; font-size: 11px; line-height: 1; }
.sw-nav-rail__dest-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sw-nav-rail__dest-btn:hover {
  border-color: var(--sw-rail-border);
  color: var(--sw-rail-text);
}

.sw-nav-rail.is-compact .sw-nav-rail__room-btn.is-active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  background: var(--sw-rail-accent);
}

.sw-nav-rail.is-compact .sw-nav-rail__room-btn { position: relative; }

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
  border: 1px solid var(--sw-rail-border-subtle);
  background: var(--sw-rail-surface);
  color: var(--sw-rail-text-muted, var(--sw-rail-text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
`;
