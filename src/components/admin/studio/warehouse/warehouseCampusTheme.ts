/** Industrial Design Campus™ — hero stage, asset shelf, inspector, compare mode */

export const WAREHOUSE_CAMPUS_STYLES = `
/* ── Industrial Design Campus layout shell ── */
.wh-campus {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  pointer-events: none;
  z-index: 6;
}

.wh-campus * { pointer-events: auto; }

.wh-campus__workspace {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 52px 8px 0 56px;
}

.wh-campus__toolbar {
  position: absolute;
  top: 52px;
  right: 8px;
  z-index: 8;
  display: flex;
  gap: 4px;
  pointer-events: auto;
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
}

.wh-campus__toolbar-btn.is-active {
  border-color: rgba(201, 169, 98, 0.85);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.14);
}

.wh-campus__search {
  position: absolute;
  top: 52px;
  left: 56px;
  right: 160px;
  z-index: 7;
  padding: 0 8px;
  pointer-events: auto;
}

.wh-campus__search-input {
  width: 100%;
  max-width: 280px;
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0, 0, 0, 0.45);
  color: #f5f0e8;
  font-family: inherit;
}

/* ── Hero Inspection Stage (~70%) ── */
.wh-campus__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 28px 8px 8px;
  border: 1px solid rgba(201, 169, 98, 0.12);
  background: radial-gradient(ellipse 70% 55% at 50% 62%, rgba(28, 24, 20, 0.72) 0%, rgba(0, 0, 0, 0.35) 100%);
  overflow: hidden;
  transition: box-shadow 0.6s ease, border-color 0.6s ease;
}

.wh-campus__stage.is-inspecting {
  border-color: rgba(201, 169, 98, 0.45);
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
  width: 55%;
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
  width: min(72%, 320px);
  height: min(52vh, 280px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.wh-campus__stage-object {
  width: 78%;
  height: 72%;
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
  box-shadow: 0 8px 24px rgba(201, 169, 98, 0.15);
}

.wh-campus__stage-pedestal--empty {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 8%;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.12), transparent);
  border: 1px dashed rgba(201, 169, 98, 0.25);
}

.wh-campus__stage-idle-copy {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 280px;
  padding: 0 12px;
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
}

.wh-campus__stage-controls {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  z-index: 3;
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
}

.wh-campus__stage-title {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.1em;
  color: #f5f0e8;
}

.wh-campus__stage-sub {
  margin: 2px 0 6px;
  font-size: 5px;
  opacity: 0.6;
  letter-spacing: 0.06em;
}

.wh-campus__reuse-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.wh-campus__reuse-item {
  font-size: 4px;
  letter-spacing: 0.06em;
  padding: 3px 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.45);
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

/* ── Architectural Asset Shelf™ ── */
.wh-campus__shelf {
  position: relative;
  flex: 0 0 auto;
  padding: 0 8px max(8px, env(safe-area-inset-bottom)) 56px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.55) 60%, transparent 100%);
  pointer-events: auto;
}

.wh-campus__shelf-rail {
  position: absolute;
  top: 0;
  left: 56px;
  right: 8px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.45), transparent);
}

.wh-campus__shelf-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 14px 8px 8px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.wh-campus__shelf-track::-webkit-scrollbar { display: none; }

.wh-campus__shelf-empty {
  margin: 0 auto;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.65);
  text-align: center;
  padding: 12px;
}

.wh-campus__pedestal {
  position: relative;
  flex: 0 0 148px;
  scroll-snap-align: start;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}

.wh-campus__pedestal.is-selected {
  transform: translateY(-6px);
}

.wh-campus__pedestal.is-rising {
  animation: wh-campus-pedestal-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes wh-campus-pedestal-rise {
  0% { transform: translateY(0); }
  40% { transform: translateY(-14px); }
  100% { transform: translateY(-6px); }
}

.wh-campus__pedestal-select {
  position: relative;
  width: 100%;
  height: 96px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

.wh-campus__pedestal-light {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 40px;
  background: radial-gradient(ellipse at 50% 100%, rgba(201, 169, 98, 0.35) 0%, transparent 72%);
  opacity: 0.5;
  transition: opacity 0.35s ease;
}

.wh-campus__pedestal.is-selected .wh-campus__pedestal-light {
  opacity: 1;
}

.wh-campus__pedestal-preview {
  position: absolute;
  inset: 8px 12px 20px;
  border-radius: 4px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background-size: cover;
  background-position: center;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.wh-campus__pedestal.is-selected .wh-campus__pedestal-preview {
  border-color: rgba(201, 169, 98, 0.85);
  box-shadow: 0 0 20px rgba(201, 169, 98, 0.25);
}

.wh-campus__pedestal-plinth {
  position: absolute;
  bottom: 0;
  left: 8%;
  right: 8%;
  height: 14px;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.2), rgba(201, 169, 98, 0.05));
  border: 1px solid rgba(201, 169, 98, 0.22);
}

.wh-campus__pedestal-meta {
  padding: 6px 2px 0;
}

.wh-campus__pedestal-name {
  margin: 0 0 2px;
  font-size: 5px;
  letter-spacing: 0.06em;
  color: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wh-campus__pedestal-category {
  margin: 0 0 4px;
  font-size: 4px;
  opacity: 0.55;
  letter-spacing: 0.06em;
}

.wh-campus__pedestal-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 3.5px;
  opacity: 0.75;
  margin-bottom: 3px;
}

.wh-campus__pedestal-savings {
  color: rgba(120, 200, 140, 0.9);
}

.wh-campus__pedestal-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 3.5px;
  opacity: 0.5;
}

.wh-campus__pedestal-badges {
  display: flex;
  gap: 3px;
  margin-top: 4px;
}

.wh-campus__badge {
  font-size: 3.5px;
  padding: 1px 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  opacity: 0.8;
}

.wh-campus__badge--gold {
  border-color: rgba(201, 169, 98, 0.5);
  color: #c9a962;
}

.wh-campus__badge--green {
  border-color: rgba(120, 200, 140, 0.4);
  color: rgba(120, 200, 140, 0.95);
}

.wh-campus__compare-toggle {
  width: 100%;
  margin-top: 4px;
  padding: 3px;
  font-size: 4px;
  letter-spacing: 0.08em;
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

.wh-campus__pedestal.is-compare .wh-campus__pedestal-preview {
  outline: 2px solid rgba(139, 164, 196, 0.65);
}

/* ── Collapsible Inspector ── */
.wh-campus__inspector {
  position: absolute;
  top: 52px;
  right: 0;
  bottom: 0;
  width: min(240px, 42vw);
  z-index: 26;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.82);
  border-left: 1px solid rgba(201, 169, 98, 0.35);
  backdrop-filter: blur(10px);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: auto;
}

.wh-campus__inspector--open {
  transform: translateX(0);
}

.wh-campus__inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.wh-campus__inspector-title {
  margin: 0;
  font-size: 6px;
  letter-spacing: 0.1em;
  color: #c9a962;
}

.wh-campus__inspector-sub {
  margin: 2px 0 0;
  font-size: 4px;
  opacity: 0.55;
}

.wh-campus__inspector-close {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: transparent;
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.wh-campus__inspector-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  scrollbar-width: none;
}

.wh-campus__inspector-scroll::-webkit-scrollbar { display: none; }

.wh-campus__inspector-hint {
  margin: 0;
  padding: 10px;
  font-size: 5px;
  opacity: 0.6;
  line-height: 1.45;
}

.wh-campus__inspector-section {
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.wh-campus__inspector-section-title {
  font-size: 5px;
  letter-spacing: 0.1em;
  color: #c9a962;
  cursor: pointer;
  padding: 4px 0;
  list-style: none;
}

.wh-campus__inspector-section-title::-webkit-details-marker { display: none; }

.wh-campus__inspector-section-body {
  padding-bottom: 8px;
}

.wh-campus__meta-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 4.5px;
  padding: 3px 0;
  opacity: 0.85;
}

.wh-campus__meta-highlight {
  color: rgba(120, 200, 140, 0.95);
}

.wh-campus__workspace-list {
  margin: 4px 0 0;
  font-size: 4px;
  opacity: 0.65;
  line-height: 1.45;
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

.wh-campus__relationship-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wh-campus__relationship-node {
  font-size: 4px;
  line-height: 1.4;
}

.wh-campus__relationship-role {
  display: block;
  opacity: 0.5;
  margin-bottom: 1px;
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
}

.wh-campus__relationship-link:disabled {
  opacity: 0.7;
  cursor: default;
}

.wh-campus__world-graph {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wh-campus__graph-node {
  font-size: 4px;
  padding: 3px 6px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: rgba(0, 0, 0, 0.35);
}

.wh-campus__graph-node.is-current {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
}

.wh-campus__graph-node--blueprint { border-color: rgba(168, 196, 224, 0.35); }
.wh-campus__graph-node--marketplace { border-color: rgba(232, 200, 120, 0.35); }
.wh-campus__graph-node--headquarters { border-color: rgba(184, 212, 168, 0.35); }
.wh-campus__graph-node--simulation { border-color: rgba(139, 164, 196, 0.35); }

.wh-campus__graph-edge {
  margin: 0;
  font-size: 3.5px;
  opacity: 0.55;
  line-height: 1.35;
}

.wh-campus__inspector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.wh-campus__reuse-banner {
  margin: 0 0 8px;
  padding: 6px;
  font-size: 5px;
  color: rgba(120, 200, 140, 0.95);
  letter-spacing: 0.06em;
  border: 1px solid rgba(120, 200, 140, 0.35);
  background: rgba(120, 200, 140, 0.08);
}

/* ── Compare Mode™ ── */
.wh-campus__compare {
  position: absolute;
  inset: 52px 8px 140px 56px;
  z-index: 9;
  padding: 10px;
  background: rgba(0, 0, 0, 0.78);
  border: 1px solid rgba(139, 164, 196, 0.35);
  overflow-y: auto;
  scrollbar-width: none;
}

.wh-campus__compare::-webkit-scrollbar { display: none; }

.wh-campus__compare-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
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
  font-size: 5px;
  opacity: 0.6;
}

.wh-campus__compare-clear {
  padding: 4px 8px;
  font-size: 5px;
  border: 1px solid rgba(139, 164, 196, 0.4);
  background: transparent;
  color: #8ba4c4;
  cursor: pointer;
  font-family: inherit;
}

.wh-campus__compare-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.wh-campus__compare-column {
  flex: 0 0 100px;
  text-align: center;
}

.wh-campus__compare-preview {
  height: 72px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  margin-bottom: 4px;
  background-size: cover;
  background-position: center;
}

.wh-campus__compare-name {
  margin: 0 0 4px;
  font-size: 4px;
}

.wh-campus__compare-remove {
  padding: 2px 6px;
  font-size: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(245, 240, 232, 0.7);
  cursor: pointer;
  font-family: inherit;
}

.wh-campus__compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 4px;
}

.wh-campus__compare-table th {
  text-align: left;
  padding: 4px 6px 4px 0;
  opacity: 0.55;
  font-weight: normal;
  vertical-align: top;
  white-space: nowrap;
}

.wh-campus__compare-table td {
  padding: 4px 8px 4px 0;
  color: #f5f0e8;
}

/* ── Wing accent modifiers ── */
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
