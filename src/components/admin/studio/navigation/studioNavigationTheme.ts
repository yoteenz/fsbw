/** ArchitecturalRail™ + SceneTray™ — explicit layout guardrails (navigation responsibility split). */

export const STUDIO_NAVIGATION_STYLES = `
/* ── ArchitecturalRail™ — left vertical, department/district only ── */
.studio-architectural-rail,
.wh-world__directory.studio-architectural-rail {
  position: absolute;
  left: 0;
  top: 52px;
  bottom: 72px;
  right: auto;
  z-index: 24;
  width: 52px;
  display: flex;
  flex-direction: column;
  padding: 8px 4px;
  background: linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.35) 80%, transparent);
  border-right: 1px solid rgba(201, 169, 98, 0.18);
  pointer-events: auto;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.studio-architectural-rail::-webkit-scrollbar { display: none; }

.studio-architectural-rail__title {
  margin: 0 0 8px 4px;
  font-size: 4px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.55);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  height: 48px;
}

.studio-architectural-rail__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.studio-architectural-rail__btn {
  width: 100%;
  padding: 6px 4px;
  border: 1px solid rgba(201, 169, 98, 0.15);
  background: rgba(0, 0, 0, 0.45);
  color: rgba(245, 240, 232, 0.7);
  font-size: 4px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  line-height: 1.2;
  text-transform: uppercase;
  text-decoration: none;
}

.studio-architectural-rail__btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.studio-architectural-rail__btn.is-locked,
.studio-architectural-rail__btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.studio-architectural-rail__btn__label {
  display: block;
}

/* ── SceneTray™ — bottom horizontal, scene/workspace/exhibit only ── */
.studio-scene-tray,
.wh-world__nav.studio-scene-tray,
.cds-genesis__nav.studio-scene-tray {
  position: absolute;
  left: 0;
  right: 0;
  top: auto;
  bottom: 0;
  z-index: 18;
  display: block;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 6px max(8px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgba(0,0,0,0.82) 0%, transparent 100%);
  scrollbar-width: none;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}

.studio-scene-tray::-webkit-scrollbar { display: none; }

.studio-scene-tray__track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 4px;
  width: max-content;
  margin: 0 auto;
  pointer-events: auto;
}

.studio-scene-tray__btn {
  flex-shrink: 0;
  padding: 6px 10px;
  min-height: 32px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0,0,0,0.4);
  color: rgba(245, 240, 232, 0.7);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  text-transform: uppercase;
}

.studio-scene-tray__btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.studio-scene-tray__btn:disabled {
  opacity: 0.3;
}

/* Mobile guardrails — SceneTray stays bottom horizontal; rail stays left vertical */
@media (max-width: 768px) {
  .studio-scene-tray,
  .wh-world__nav.studio-scene-tray,
  .cds-genesis__nav.studio-scene-tray {
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    bottom: 0 !important;
    width: 100% !important;
    flex-direction: row !important;
    writing-mode: horizontal-tb !important;
    transform: none !important;
  }

  .studio-scene-tray__track {
    flex-direction: row !important;
  }

  .studio-architectural-rail,
  .wh-world__directory.studio-architectural-rail {
    left: 0 !important;
    right: auto !important;
    top: 52px !important;
    bottom: 72px !important;
    flex-direction: column !important;
    writing-mode: horizontal-tb !important;
    width: 52px !important;
  }

  .studio-architectural-rail__list {
    flex-direction: column !important;
  }
}
`;
