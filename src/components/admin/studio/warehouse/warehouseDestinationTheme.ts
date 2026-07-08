/** Studio Archives™ — immersive destination shell (not webpage). Reuses Scene Stack compositor classes. */

export const WAREHOUSE_DESTINATION_STYLES = `
body.wh-world-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.wh-world {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f5f0e8;
  font-family: "Futura PT", sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  background: #0a0908;
  text-transform: uppercase;
}

.wh-world * { text-transform: uppercase; }

.wh-world__camera {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.wh-world__camera-track {
  display: flex;
  height: 100%;
  width: max-content;
  will-change: transform;
  transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}

.wh-world__zone-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  overflow: hidden;
}

.wh-world__zone-panel.is-locked {
  filter: brightness(0.35) saturate(0.5);
  pointer-events: none;
}

.wh-world__zone-shell {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #1c1814 0%, #0a0908 74%);
}

.wh-world__interaction-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.wh-world__hotspot {
  position: absolute;
  pointer-events: auto;
}

.wh-world__hotspot--ghost {
  background: transparent;
  border: none;
}

.wh-world__hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.72) 0%, transparent 100%);
  pointer-events: none;
}

.wh-world__hud > * { pointer-events: auto; }

.wh-world__back {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.45);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.wh-world__identity { flex: 1; min-width: 0; }

.wh-world__title {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.14em;
  color: var(--wh-accent, #c9a962);
}

.wh-world__sub {
  margin: 2px 0 0;
  font-size: 5px;
  letter-spacing: 0.08em;
  opacity: 0.55;
}

.wh-world__pill-btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(0,0,0,0.5);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.wh-world__pill-btn.is-building { opacity: 0.7; }
.wh-world__pill-btn:disabled { opacity: 0.4; cursor: default; }

.wh-world__stack-spinner {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  border-top-color: #c9a962;
  border-radius: 50%;
  animation: wh-world-spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes wh-world-spin { to { transform: rotate(360deg); } }

.wh-world__teaching {
  position: absolute;
  left: calc(var(--wh-frame-dir-w, 52px) + 50%);
  bottom: max(8px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(calc(100vw - var(--wh-frame-dir-w, 52px) - 24px), 360px);
  text-align: center;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.75);
  z-index: 16;
  pointer-events: none;
  line-height: 1.5;
  box-sizing: border-box;
  overflow: hidden;
}

.wh-world__nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 18;
  overflow-x: auto;
  padding: 8px 6px max(8px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgba(0,0,0,0.82) 0%, transparent 100%);
  scrollbar-width: none;
  pointer-events: none;
}

.wh-world__nav::-webkit-scrollbar { display: none; }

.wh-world__nav-track {
  display: flex;
  gap: 4px;
  width: max-content;
  margin: 0 auto;
  pointer-events: auto;
}

.wh-world__nav-btn {
  padding: 6px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0,0,0,0.4);
  color: rgba(245, 240, 232, 0.7);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.wh-world__nav-btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.wh-world__nav-btn:disabled { opacity: 0.3; }

.wh-world__enter-btn {
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

.wh-world__label {
  margin: 0 0 6px;
  font-size: 6px;
  letter-spacing: 0.12em;
  color: #c9a962;
}

.wh-world__hint {
  margin: 0 0 8px;
  font-size: 5px;
  letter-spacing: 0.06em;
  opacity: 0.6;
  line-height: 1.45;
}

.wh-world__btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.wh-world__btn {
  padding: 4px 6px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.4);
  color: rgba(245, 240, 232, 0.85);
  cursor: pointer;
  font-family: inherit;
}

.wh-world__btn--gold {
  border-color: rgba(201, 169, 98, 0.7);
  color: #c9a962;
}

.wh-world__glass-embed {
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.58);
  border: 1px solid rgba(201, 169, 98, 0.28);
  backdrop-filter: blur(8px);
  max-height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
}

.wh-world__glass-embed::-webkit-scrollbar { display: none; }

/* ── Gallery floors (physical objects, not cards) ── */
.wh-world__gallery {
  position: absolute;
  inset: 0;
}

.wh-world__gallery-empty {
  position: absolute;
  left: 50%;
  top: 58%;
  transform: translate(-50%, -50%);
  width: min(280px, 80vw);
  text-align: center;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.65);
  line-height: 1.5;
}

.wh-world__pedestal {
  position: absolute;
  padding: 0;
  border: 1px solid rgba(201, 169, 98, 0.22);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.wh-world__pedestal.is-selected {
  border-color: rgba(201, 169, 98, 0.85);
  box-shadow: 0 0 24px rgba(201, 169, 98, 0.25);
}

.wh-world__pedestal.is-capsule {
  border-radius: 50% 50% 14% 14%;
}

.wh-world__pedestal-object {
  position: absolute;
  inset: 8% 8% 22%;
  border-radius: 4px;
  transition: transform 0.35s ease-out;
}

.wh-world__pedestal-label {
  position: relative;
  z-index: 1;
  font-size: 4px;
  letter-spacing: 0.06em;
  padding: 4px;
  color: rgba(245, 240, 232, 0.8);
  text-align: center;
  width: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.75), transparent);
}

/* ── Diegetic inspector (embedded registry, not sidebar) ── */
.wh-world__inspector {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wh-world__inspector--idle {
  justify-content: center;
  text-align: center;
}

.wh-world__inspector-preview {
  flex: 0 0 80px;
  margin-bottom: 8px;
}

.wh-world__inspector-plate {
  width: 100%;
  height: 80px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(201, 169, 98, 0.25);
}

.wh-world__meta-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}

.wh-world__meta-scroll::-webkit-scrollbar { display: none; }

.wh-world__reuse-banner {
  margin: 0 0 6px;
  font-size: 5px;
  color: rgba(120, 200, 140, 0.9);
  letter-spacing: 0.08em;
}

.wh-world__registry-count {
  font-size: 18px;
  font-family: "Covered By Your Grace", cursive;
  color: #c9a962;
  margin: 4px 0;
}

.wh-world__walkway-btn {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  font-size: 6px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(201, 169, 98, 0.6);
  background: linear-gradient(180deg, rgba(201,169,98,0.15), rgba(0,0,0,0.5));
  color: #f5f0e8;
  cursor: pointer;
  font-family: inherit;
}

.wh-world__search-input {
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0,0,0,0.45);
  color: #f5f0e8;
  font-family: inherit;
}

.wh-world__recipe-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 6px;
  font-size: 5px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  align-items: center;
}

/* ── Left architectural directory — departments/wings only (SceneTray™ owns scenes) ── */
.wh-world__directory {
  position: absolute;
  left: 0;
  top: 52px;
  bottom: 72px;
  z-index: 24;
  width: 52px;
  padding: 8px 4px;
  background: linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.35) 80%, transparent);
  border-right: 1px solid rgba(201, 169, 98, 0.18);
  pointer-events: auto;
  overflow-y: auto;
  scrollbar-width: none;
}

.wh-world__directory::-webkit-scrollbar { display: none; }

.wh-world__directory-title {
  margin: 0 0 8px 4px;
  font-size: 4px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.55);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  height: 48px;
}

.wh-world__directory-section {
  margin-bottom: 4px;
}

.wh-world__directory-wing {
  margin: 0 0 2px;
  font-size: 3px;
  letter-spacing: 0.08em;
  color: rgba(201, 169, 98, 0.4);
  text-align: center;
  line-height: 1.1;
}

.wh-world__directory-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wh-world__directory-btn {
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
}

.wh-world__directory-btn.is-active {
  border-color: rgba(201, 169, 98, 0.75);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.12);
}

.wh-world__directory-btn.is-locked,
.wh-world__directory-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.wh-world__directory-btn__label {
  display: block;
}

.wh-world__directory-btn.is-sub {
  padding: 4px 2px;
  font-size: 3.5px;
  opacity: 0.92;
}

/* ── Orb courier (personality shifts by wing) ── */
.wh-world__orb-courier {
  position: absolute;
  right: 8px;
  top: 56px;
  z-index: 23;
  max-width: 140px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(201, 169, 98, 0.28);
  pointer-events: none;
}

.wh-world__orb-courier-role {
  margin: 0 0 4px;
  font-size: 4px;
  letter-spacing: 0.12em;
  color: #c9a962;
}

.wh-world__orb-courier-quote {
  margin: 0;
  font-size: 5px;
  line-height: 1.45;
  letter-spacing: 0.05em;
  opacity: 0.82;
}

.wh-world__directory-btn.is-sub {
  padding-left: 8px;
  font-size: 4.5px;
}

.wh-world__directory-btn.is-sub .wh-world__directory-btn__label {
  opacity: 0.88;
}

.wh-world.is-atrium-wing {
  --wh-accent: #d4c4a0;
}

.wh-world.is-genome-wing {
  --wh-accent: #b8d4a8;
}

.wh-world.is-genome-wing .wh-world__zone-shell {
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #141a14 0%, #0a0908 74%);
}

.wh-world.is-blueprint-wing {
  --wh-accent: #a8c4e0;
}

.wh-world.is-blueprint-wing .wh-world__zone-shell {
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #121820 0%, #0a0908 74%);
}

.wh-world.is-marketplace-wing {
  --wh-accent: #e8c878;
}

.wh-world.is-marketplace-wing .wh-world__zone-shell {
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #1a1810 0%, #0a0908 74%);
}

.wh-world__glass-embed--genome {
  border-color: rgba(184, 212, 168, 0.35);
}

.wh-world__glass-embed--blueprint {
  border-color: rgba(168, 196, 224, 0.35);
}

.wh-world__glass-embed--marketplace {
  border-color: rgba(232, 200, 120, 0.35);
}

.wh-world__trait-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.wh-world__trait-chip {
  font-size: 4px;
  padding: 2px 4px;
  border: 1px solid rgba(184, 212, 168, 0.3);
  border-radius: 2px;
  opacity: 0.85;
}

.wh-world__blueprint-row {
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.wh-world.is-legacy-wing {
  --wh-accent: #9b7bb8;
}

.wh-world.is-legacy-wing .wh-world__zone-shell {
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #1a1428 0%, #0a0908 74%);
}

.wh-world.is-innovation-wing .wh-world__zone-shell {
  background: radial-gradient(ellipse 82% 58% at 50% 54%, #141c28 0%, #0a0908 74%);
}

/* ── Museum Wing™ installations ── */
.wh-museum__legacy-hall {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.wh-museum__installation {
  position: absolute;
  width: 18%;
  min-height: 72px;
  padding: 0;
  border: 1px solid rgba(155, 123, 184, 0.35);
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.wh-museum__installation:nth-child(1) { left: 2%; top: 8%; }
.wh-museum__installation:nth-child(2) { left: 22%; top: 14%; }
.wh-museum__installation:nth-child(3) { left: 42%; top: 6%; }
.wh-museum__installation:nth-child(4) { left: 62%; top: 12%; }
.wh-museum__installation:nth-child(5) { left: 80%; top: 8%; }

.wh-museum__installation.is-selected {
  border-color: rgba(155, 123, 184, 0.9);
  box-shadow: 0 0 20px rgba(155, 123, 184, 0.25);
}

.wh-museum__installation-plate {
  height: 48px;
  width: 100%;
}

.wh-museum__installation-title {
  margin: 0;
  padding: 4px;
  font-size: 4px;
  letter-spacing: 0.06em;
  color: #e8dff0;
}

.wh-museum__installation-sub {
  margin: 0;
  padding: 0 4px 4px;
  font-size: 4px;
  opacity: 0.55;
}

.wh-museum__legacy-wall {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 6px;
  padding: 8px 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.wh-museum__legacy-wall::-webkit-scrollbar { display: none; }

.wh-museum__legacy-frame {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 6px;
  border: 1px solid rgba(155, 123, 184, 0.3);
  background: rgba(0,0,0,0.45);
  color: #e8dff0;
  font-size: 4px;
  cursor: pointer;
  font-family: inherit;
}

.wh-museum__legacy-frame-title {
  display: block;
  margin-top: 4px;
  letter-spacing: 0.06em;
}

.wh-museum__historian { text-align: center; }

.wh-museum__orb-glow {
  width: 36px;
  height: 36px;
  margin: 6px auto;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(155,123,184,0.55), transparent 70%);
}

.wh-museum__historian-quote {
  margin: 0 0 8px;
  font-size: 5px;
  line-height: 1.5;
  letter-spacing: 0.05em;
  font-style: italic;
  color: #d8c8e8;
}

.wh-museum__exhibit-room { max-height: 100%; overflow-y: auto; scrollbar-width: none; }
.wh-museum__exhibit-room::-webkit-scrollbar { display: none; }

.wh-museum__hologram {
  margin: 8px 0;
  border: 1px solid rgba(155, 123, 184, 0.35);
}

.wh-museum__hologram-plate {
  height: 64px;
}

.wh-museum__hologram-caption {
  margin: 0;
  padding: 6px;
  font-size: 5px;
  opacity: 0.75;
  line-height: 1.4;
}

.wh-museum__rooms {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.wh-museum__room-chip {
  font-size: 4px;
  padding: 3px 6px;
  border: 1px solid rgba(155, 123, 184, 0.25);
  opacity: 0.8;
}

.wh-museum__timeline-scrub {
  width: 100%;
  margin: 6px 0;
}

.wh-museum__recipe-line,
.wh-museum__note-line {
  margin: 0 0 4px;
  font-size: 4px;
  opacity: 0.72;
  line-height: 1.4;
}

/* ── Hall of Innovation™ ── */
.wh-innovation__storyteller .wh-innovation__quote {
  margin: 8px 0 0;
  font-size: 5px;
  line-height: 1.5;
  color: #b8cce0;
  font-style: italic;
}

.wh-innovation__bay {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 160px;
}

.wh-innovation__pod {
  position: absolute;
  top: 12%;
  width: 20%;
  min-height: 80px;
  padding: 8px 6px;
  border: 1px solid rgba(139, 164, 196, 0.35);
  background: rgba(0, 0, 0, 0.48);
}

.wh-innovation__pod-glow {
  height: 32px;
  margin-bottom: 6px;
  background: linear-gradient(180deg, rgba(139,164,196,0.35), transparent);
}

.wh-innovation__pod-title {
  margin: 0 0 4px;
  font-size: 4px;
  color: #c9d8ea;
}

.wh-innovation__pod-sub {
  margin: 0 0 6px;
  font-size: 4px;
  opacity: 0.6;
  line-height: 1.35;
}

.wh-innovation__pod-status {
  font-size: 4px;
  letter-spacing: 0.1em;
  color: #8ba4c4;
}

.wh-expansion__bays { text-align: center; }

.wh-expansion__manifest {
  margin: 8px 0;
  font-size: 5px;
  line-height: 1.5;
  color: #d4af7a;
  font-style: italic;
}

.wh-expansion__frames {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.wh-expansion__frame {
  width: 48px;
  height: 72px;
  border: 1px dashed rgba(212, 175, 122, 0.45);
  background: rgba(0,0,0,0.35);
}

.wh-expansion__frame--ghost {
  opacity: 0.35;
}

/* Bottom bar — workspace-specific functions only (not zone navigation) */
.wh-world__workspace-bar {
  position: absolute;
  right: 8px;
  bottom: 72px;
  z-index: 22;
  max-width: 160px;
  padding: 8px;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(201,169,98,0.35);
  font-size: 5px;
  pointer-events: auto;
}
`;
