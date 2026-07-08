/** Industrial Design Campus™ — architectural frame grid (hero, shelf, inspector) */

export const WAREHOUSE_CAMPUS_STYLES = `
/* ── Campus shell — bounded between directory, HUD, teaching, safe areas ── */
.wh-campus {
  position: absolute;
  left: var(--wh-frame-dir-w, 52px);
  right: max(0px, env(safe-area-inset-right));
  top: var(--wh-frame-hud-h, 48px);
  bottom: var(--wh-frame-teach-h, 56px);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "command"
    "stage"
    "shelf";
  gap: var(--wh-frame-pad, 6px);
  padding: var(--wh-frame-pad, 6px);
  overflow: hidden;
  pointer-events: none;
  z-index: 6;
}

.wh-campus.is-inspector-open {
  grid-template-columns: minmax(0, 1fr) minmax(0, min(220px, 34vw));
  grid-template-areas:
    "command inspector"
    "stage inspector"
    "shelf inspector";
}

.wh-campus * { box-sizing: border-box; }

/* ── Frame panels ── */
.wh-campus__frame {
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
  border: var(--wh-frame-border, 1px solid rgba(201, 169, 98, 0.22));
  background: var(--wh-frame-bg, rgba(0, 0, 0, 0.48));
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.wh-campus__frame--command { grid-area: command; flex: 0 0 auto; }
.wh-campus__frame--stage { grid-area: stage; flex: 1; }
.wh-campus__frame--shelf { grid-area: shelf; flex: 0 0 auto; max-height: min(38vh, 200px); }
.wh-campus__frame--inspector {
  grid-area: inspector;
  display: none;
  border-left: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(10px);
}

.wh-campus.is-inspector-open .wh-campus__frame--inspector {
  display: flex;
}

.wh-campus__frame-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
  position: relative;
}

/* ── Command bar (search + tools) ── */
.wh-campus__command {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  min-width: 0;
}

.wh-campus__search-input {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0, 0, 0, 0.45);
  color: #f5f0e8;
  font-family: inherit;
}

.wh-campus__toolbar {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
}

.wh-campus__toolbar-btn {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0, 0, 0, 0.55);
  color: rgba(245, 240, 232, 0.85);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.wh-campus__toolbar-btn.is-active {
  border-color: rgba(201, 169, 98, 0.85);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.14);
}

/* ── Hero Inspection Stage ── */
.wh-campus__stage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse 70% 55% at 50% 62%, rgba(28, 24, 20, 0.72) 0%, rgba(0, 0, 0, 0.35) 100%);
  transition: box-shadow 0.6s ease;
}

.wh-campus__stage.is-inspecting {
  box-shadow: inset 0 0 80px rgba(201, 169, 98, 0.08);
}

.wh-campus__stage-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 85% 70% at 50% 55%, transparent 35%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

.wh-campus__stage-spotlight {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: min(55%, 100%);
  height: 65%;
  background: radial-gradient(ellipse at 50% 30%, rgba(201, 169, 98, 0.18) 0%, transparent 68%);
  pointer-events: none;
  animation: wh-campus-spotlight 4s ease-in-out infinite alternate;
}

@keyframes wh-campus-spotlight {
  from { opacity: 0.65; }
  to { opacity: 1; }
}

.wh-campus__stage-hero {
  position: relative;
  width: min(72%, 100%);
  max-width: 320px;
  height: min(52%, 280px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  flex-shrink: 1;
  min-height: 0;
}

.wh-campus__stage-object {
  width: 78%;
  height: 72%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 6px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55), 0 0 40px rgba(201, 169, 98, 0.12);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  background-size: cover;
  background-position: center;
}

.wh-campus__stage.is-inspecting .wh-campus__stage-object {
  animation: wh-campus-hero-arrive 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes wh-campus-hero-arrive {
  from { opacity: 0; transform: scale(0.88) translateY(24px); }
  to { opacity: 1; }
}

.wh-campus__stage-plinth {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 88%;
  height: 12%;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.22), rgba(201, 169, 98, 0.05));
  border: 1px solid rgba(201, 169, 98, 0.28);
  border-radius: 4px 4px 0 0;
}

.wh-campus__stage-pedestal--empty {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  width: min(40%, 200px);
  height: 8%;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.12), transparent);
  border: 1px dashed rgba(201, 169, 98, 0.25);
}

.wh-campus__stage-idle-copy {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: min(280px, 90%);
  padding: 0 12px;
  overflow: hidden;
}

.wh-campus__stage-label {
  margin: 0 0 6px;
  font-size: 7px;
  letter-spacing: 0.14em;
  color: #c9a962;
}

.wh-campus__stage-hint {
  margin: 0;
  font-size: 5px;
  letter-spacing: 0.06em;
  opacity: 0.6;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.wh-campus__stage-controls {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  z-index: 3;
  max-width: 100%;
  overflow: hidden;
}

.wh-campus__stage-btn {
  padding: 4px 7px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0, 0, 0, 0.55);
  color: rgba(245, 240, 232, 0.85);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}

.wh-campus__stage-btn--gold {
  border-color: rgba(201, 169, 98, 0.7);
  color: #c9a962;
}

.wh-campus__stage-intelligence {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
  max-width: calc(100% - 16px);
}

.wh-campus__stage-title {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.1em;
  color: #f5f0e8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__stage-sub {
  margin: 2px 0 6px;
  font-size: 5px;
  opacity: 0.6;
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__reuse-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
  overflow: hidden;
}

.wh-campus__reuse-item {
  font-size: 4px;
  letter-spacing: 0.06em;
  padding: 3px 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wh-campus__reuse-item--highlight {
  border-color: rgba(120, 200, 140, 0.45);
  color: rgba(120, 200, 140, 0.95);
}

.wh-campus__reuse-label {
  display: block;
  opacity: 0.55;
  margin-bottom: 1px;
}

/* ── Architectural Asset Shelf — scroll contained inside frame only ── */
.wh-campus__shelf-header {
  flex: 0 0 auto;
  padding: 6px 8px 0;
  font-size: 4px;
  letter-spacing: 0.12em;
  color: rgba(201, 169, 98, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__shelf-body {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0 4px 6px;
}

.wh-campus__shelf-track {
  display: flex;
  gap: 14px;
  height: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 8px 4px 4px;
  -webkit-overflow-scrolling: touch;
}

.wh-campus__shelf-track::-webkit-scrollbar { display: none; }

.wh-campus__shelf-empty {
  margin: 0;
  width: 100%;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.65);
  text-align: center;
  padding: 12px 8px;
  overflow: hidden;
}

.wh-campus__pedestal {
  position: relative;
  flex: 0 0 132px;
  max-width: 132px;
  scroll-snap-align: start;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.wh-campus__pedestal.is-selected { transform: translateY(-4px); }

.wh-campus__pedestal.is-rising {
  animation: wh-campus-pedestal-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes wh-campus-pedestal-rise {
  0% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  100% { transform: translateY(-4px); }
}

.wh-campus__pedestal-select {
  position: relative;
  width: 100%;
  height: 88px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
}

.wh-campus__pedestal-light {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 32px;
  background: radial-gradient(ellipse at 50% 100%, rgba(201, 169, 98, 0.35) 0%, transparent 72%);
  opacity: 0.5;
  pointer-events: none;
}

.wh-campus__pedestal.is-selected .wh-campus__pedestal-light { opacity: 1; }

.wh-campus__pedestal-preview {
  position: absolute;
  inset: 6px 10px 18px;
  border-radius: 4px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background-size: cover;
  background-position: center;
}

.wh-campus__pedestal.is-selected .wh-campus__pedestal-preview {
  border-color: rgba(201, 169, 98, 0.85);
  box-shadow: 0 0 16px rgba(201, 169, 98, 0.22);
}

.wh-campus__pedestal-plinth {
  position: absolute;
  bottom: 0;
  left: 8%;
  right: 8%;
  height: 12px;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.2), rgba(201, 169, 98, 0.05));
  border: 1px solid rgba(201, 169, 98, 0.22);
}

.wh-campus__pedestal-meta {
  padding: 4px 2px 0;
  overflow: hidden;
  max-width: 100%;
}

.wh-campus__pedestal-name {
  margin: 0 0 2px;
  font-size: 5px;
  letter-spacing: 0.06em;
  color: #f5f0e8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__pedestal-category {
  margin: 0 0 3px;
  font-size: 4px;
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__pedestal-stats,
.wh-campus__pedestal-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  font-size: 3.5px;
  opacity: 0.75;
  overflow: hidden;
  max-width: 100%;
}

.wh-campus__pedestal-savings { color: rgba(120, 200, 140, 0.9); }

.wh-campus__pedestal-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 3px;
  overflow: hidden;
}

.wh-campus__badge {
  font-size: 3.5px;
  padding: 1px 3px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.wh-campus__badge--gold { border-color: rgba(201, 169, 98, 0.5); color: #c9a962; }
.wh-campus__badge--green { border-color: rgba(120, 200, 140, 0.4); color: rgba(120, 200, 140, 0.95); }

.wh-campus__compare-toggle {
  width: 100%;
  margin-top: 3px;
  padding: 2px;
  font-size: 4px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0, 0, 0, 0.4);
  color: rgba(245, 240, 232, 0.75);
  cursor: pointer;
  font-family: inherit;
}

.wh-campus__compare-toggle.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
}

/* ── Inspector (grid column — not floating overlay) ── */
.wh-campus__inspector-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.wh-campus__inspector-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.wh-campus__inspector-title-wrap {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.wh-campus__inspector-title {
  margin: 0;
  font-size: 6px;
  letter-spacing: 0.1em;
  color: #c9a962;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__inspector-sub {
  margin: 2px 0 0;
  font-size: 4px;
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__inspector-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: transparent;
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.wh-campus__inspector-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
  scrollbar-width: none;
}

.wh-campus__inspector-scroll::-webkit-scrollbar { display: none; }

.wh-campus__inspector-hint {
  margin: 0;
  font-size: 5px;
  opacity: 0.6;
  line-height: 1.45;
  overflow: hidden;
  word-break: break-word;
}

.wh-campus__inspector-section {
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.wh-campus__inspector-section-title {
  font-size: 5px;
  letter-spacing: 0.1em;
  color: #c9a962;
  cursor: pointer;
  padding: 4px 0;
  list-style: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__inspector-section-title::-webkit-details-marker { display: none; }

.wh-campus__inspector-section-body {
  padding-bottom: 6px;
  overflow: hidden;
}

.wh-campus__meta-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 4.5px;
  padding: 3px 0;
  min-width: 0;
}

.wh-campus__meta-row span:first-child {
  flex-shrink: 0;
  opacity: 0.65;
}

.wh-campus__meta-row span:last-child {
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.wh-campus__meta-highlight { color: rgba(120, 200, 140, 0.95); }

.wh-campus__workspace-list {
  margin: 4px 0 0;
  font-size: 4px;
  opacity: 0.65;
  line-height: 1.45;
  overflow: hidden;
  word-break: break-word;
}

.wh-campus__quality-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 5px;
}

.wh-campus__quality-grade {
  font-size: 12px;
  font-family: "Covered By Your Grace", cursive;
  color: #c9a962;
}

.wh-campus__relationship-tree,
.wh-campus__world-graph {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.wh-campus__relationship-node { font-size: 4px; line-height: 1.4; overflow: hidden; }

.wh-campus__relationship-role {
  display: block;
  opacity: 0.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__relationship-link {
  padding: 0;
  border: none;
  background: none;
  color: #f5f0e8;
  font-size: 4px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.wh-campus__relationship-link:disabled { opacity: 0.7; cursor: default; }

.wh-campus__graph-node {
  font-size: 4px;
  padding: 3px 6px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__graph-node.is-current { border-color: rgba(201, 169, 98, 0.75); color: #c9a962; }
.wh-campus__graph-node--blueprint { border-color: rgba(168, 196, 224, 0.35); }
.wh-campus__graph-node--marketplace { border-color: rgba(232, 200, 120, 0.35); }
.wh-campus__graph-node--headquarters { border-color: rgba(184, 212, 168, 0.35); }
.wh-campus__graph-node--simulation { border-color: rgba(139, 164, 196, 0.35); }

.wh-campus__graph-edge {
  margin: 0;
  font-size: 3.5px;
  opacity: 0.55;
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.wh-campus__inspector-actions {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.wh-campus__reuse-banner {
  margin: 0 0 8px;
  padding: 6px;
  font-size: 5px;
  color: rgba(120, 200, 140, 0.95);
  border: 1px solid rgba(120, 200, 140, 0.35);
  background: rgba(120, 200, 140, 0.08);
  overflow: hidden;
  word-break: break-word;
}

/* ── Compare Mode — vertical scroll only, grid columns wrap ── */
.wh-campus__compare {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
}

.wh-campus__compare-header {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  overflow: hidden;
}

.wh-campus__compare-title {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.12em;
  color: #8ba4c4;
}

.wh-campus__compare-sub {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 5px;
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__compare-clear {
  flex-shrink: 0;
  padding: 4px 8px;
  font-size: 5px;
  border: 1px solid rgba(139, 164, 196, 0.4);
  background: transparent;
  color: #8ba4c4;
  cursor: pointer;
  font-family: inherit;
}

.wh-campus__compare-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.wh-campus__compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
  max-width: 100%;
}

.wh-campus__compare-column {
  min-width: 0;
  overflow: hidden;
  text-align: center;
}

.wh-campus__compare-preview {
  height: 64px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  margin-bottom: 4px;
  background-size: cover;
  background-position: center;
}

.wh-campus__compare-name {
  margin: 0 0 4px;
  font-size: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__compare-table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  font-size: 4px;
  table-layout: fixed;
}

.wh-campus__compare-table th {
  text-align: left;
  padding: 4px 4px 4px 0;
  opacity: 0.55;
  font-weight: normal;
  width: 28%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wh-campus__compare-table td {
  padding: 4px 4px 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Wing accents ── */
.wh-world.is-asset-gallery-wing { --wh-accent: #c9a962; }
.wh-world.is-material-library-wing { --wh-accent: #d4c4a0; }
.wh-world.is-blueprint-hall-wing { --wh-accent: #a8c4e0; }
.wh-world.is-prototype-vault-wing { --wh-accent: #8ba4c4; }
.wh-world.is-innovation-gallery-wing { --wh-accent: #b8a0c8; }

.wh-world__directory-wing--campus {
  font-size: 3.5px;
  color: rgba(201, 169, 98, 0.65);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
  text-align: center;
}
`;
