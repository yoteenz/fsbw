/** Architectural frame system — every panel is a bounded, non-spilling container. */

export const WAREHOUSE_FRAME_STYLES = `
/* ── Frame insets (respect HUD, directory, teaching, safe areas) ── */
.wh-world {
  --wh-frame-dir-w: 52px;
  --wh-frame-hud-h: max(48px, calc(38px + env(safe-area-inset-top)));
  --wh-frame-teach-h: max(56px, calc(48px + env(safe-area-inset-bottom)));
  --wh-frame-pad: 6px;
  --wh-frame-border: 1px solid rgba(201, 169, 98, 0.22);
  --wh-frame-bg: rgba(0, 0, 0, 0.48);
}

/* ── Global containment — nothing escapes the world shell ── */
.wh-world__interaction-layer {
  overflow: hidden;
  box-sizing: border-box;
}

.wh-world__hotspot {
  box-sizing: border-box;
  overflow: hidden;
  max-width: 100%;
  max-height: 100%;
}

.wh-world__glass-embed {
  box-sizing: border-box;
  max-width: 100%;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ── HUD frame ── */
.wh-world__hud {
  box-sizing: border-box;
  overflow: hidden;
  max-width: 100vw;
}

.wh-world__identity {
  overflow: hidden;
  min-width: 0;
}

.wh-world__title,
.wh-world__sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.wh-world__pill-btn {
  flex-shrink: 0;
  max-width: 42vw;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Navigation directory frame ── */
.wh-world__directory {
  box-sizing: border-box;
  width: var(--wh-frame-dir-w);
  max-width: var(--wh-frame-dir-w);
  top: var(--wh-frame-hud-h);
  bottom: var(--wh-frame-teach-h);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.wh-world__directory-btn,
.wh-world__directory-btn__label {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.wh-world__directory-wing {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* ── Teaching strip frame ── */
.wh-world__teaching {
  box-sizing: border-box;
  max-width: min(calc(100vw - var(--wh-frame-dir-w) - 16px), 360px);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-word;
  padding: 0 8px;
}

/* ── Orb courier — tuck inside HUD lane on gallery; never overlap inspector ── */
.wh-world--campus-gallery .wh-world__orb-courier {
  top: var(--wh-frame-hud-h);
  right: max(8px, env(safe-area-inset-right));
  max-width: min(120px, 28vw);
  overflow: hidden;
}

.wh-world--inspector-open .wh-world__orb-courier {
  display: none;
}

.wh-world__orb-courier-quote {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

/* ── Workspace bar frame ── */
.wh-world__workspace-bar {
  box-sizing: border-box;
  max-width: min(160px, 38vw);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  bottom: var(--wh-frame-teach-h);
}

/* ── Shared frame primitives ── */
.wh-frame {
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
  contain: layout style;
}

.wh-frame__body {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
  position: relative;
}

.wh-frame__scroll-y {
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  max-height: 100%;
}

/* Prototype vault / wing panels */
.wh-wing-panel {
  position: absolute;
  inset: var(--wh-frame-hud-h) max(8px, env(safe-area-inset-right)) var(--wh-frame-teach-h) var(--wh-frame-dir-w);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--wh-frame-pad);
  padding: var(--wh-frame-pad);
  pointer-events: none;
}

.wh-wing-panel > * {
  pointer-events: auto;
}

.wh-wing-panel__frame {
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  border: var(--wh-frame-border);
  background: var(--wh-frame-bg);
  padding: 8px 10px;
}

.wh-wing-panel__frame--compact {
  flex: 0 0 auto;
  max-height: 32%;
}

.wh-wing-panel__scroll {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Innovation / Prototype vault — grid pods inside frame */
.wh-innovation__bay {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.wh-innovation__pod {
  position: relative;
  top: auto;
  width: auto;
  min-height: 72px;
  padding: 8px 6px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  background: rgba(0, 0, 0, 0.48);
  overflow: hidden;
}

.wh-expansion__frames {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  overflow: hidden;
}

.wh-expansion__frame {
  flex: 0 0 48px;
}
`;
