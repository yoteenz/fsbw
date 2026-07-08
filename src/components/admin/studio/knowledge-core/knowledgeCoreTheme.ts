/** Knowledge Core Observatory™ — institutional memory chamber styles */

export const KNOWLEDGE_CORE_STYLES = `
body.knowledge-core-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.kc-room {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 50% 15%, rgba(201, 169, 98, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 100% 70% at 50% 60%, #12100e 0%, #060504 55%, #020201 100%);
  color: #e8e0d4;
  font-family: "Futura PT", sans-serif;
}

.kc-room * { box-sizing: border-box; }

.kc-room__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%);
}

.kc-room__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(0,0,0,0.55);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.kc-room__title-block { flex: 1; min-width: 0; }
.kc-room__eyebrow {
  margin: 0;
  font-size: 6px;
  letter-spacing: 0.18em;
  color: #c9a962;
  text-transform: uppercase;
}
.kc-room__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #e8dcc8;
  text-transform: none;
}

.kc-room__archivist-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(212, 196, 160, 0.45);
  color: #d4c4a0;
  background: rgba(0,0,0,0.5);
  text-transform: uppercase;
}

/* Domain shelves — left */
.kc-room__domains {
  position: absolute;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 36%;
  max-width: 210px;
  z-index: 12;
  overflow-y: auto;
  padding: 8px 6px 90px;
  -webkit-overflow-scrolling: touch;
}

.kc-room__domain {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 5px;
  padding: 7px 8px;
  border: 1px solid rgba(201, 169, 98, 0.18);
  background: linear-gradient(135deg, rgba(20,17,13,0.88) 0%, rgba(8,6,4,0.82) 100%);
  color: #b8a888;
  cursor: pointer;
  font-family: inherit;
  font-size: 7px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: border-color 0.2s, background 0.2s;
}

.kc-room__domain.is-active {
  border-color: rgba(201, 169, 98, 0.55);
  background: linear-gradient(135deg, rgba(40,32,20,0.95) 0%, rgba(16,12,8,0.9) 100%);
  color: #e8dcc8;
}

.kc-room__domain-count {
  display: block;
  margin-top: 3px;
  font-size: 5px;
  color: #8a7a62;
  letter-spacing: 0.1em;
}

/* Central memory monument */
.kc-room__monument {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  z-index: 10;
  text-align: center;
  width: min(280px, 52vw);
  pointer-events: none;
}

.kc-room__memory-ring {
  width: 120px;
  height: 120px;
  margin: 0 auto 10px;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 40%, rgba(201,169,98,0.12) 0%, rgba(0,0,0,0.6) 70%);
  box-shadow: 0 0 40px rgba(201, 169, 98, 0.08);
}

.kc-room__memory-val {
  font-size: 28px;
  font-family: "Covered By Your Grace", cursive;
  color: #e8dcc8;
  line-height: 1;
}

.kc-room__memory-label {
  font-size: 5px;
  letter-spacing: 0.14em;
  color: #c9a962;
  margin-top: 4px;
  text-transform: uppercase;
}

.kc-room__status {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.1em;
  color: #a89878;
  text-transform: uppercase;
}

/* Search dock — bottom */
.kc-room__dock {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 25;
  padding: 10px 12px max(12px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%);
}

.kc-room__search-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.kc-room__search {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0,0,0,0.6);
  color: #e8e0d4;
  font-family: inherit;
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: none;
}

.kc-room__search::placeholder { color: #6a5a48; text-transform: uppercase; font-size: 7px; letter-spacing: 0.08em; }

.kc-room__archivist-ticker {
  margin: 0;
  font-size: 6px;
  letter-spacing: 0.08em;
  color: #8a7a62;
  line-height: 1.5;
  text-transform: uppercase;
}

/* Entry detail — right panel */
.kc-room__detail {
  position: absolute;
  right: 0;
  top: 56px;
  bottom: 0;
  width: 38%;
  max-width: 240px;
  z-index: 14;
  overflow-y: auto;
  padding: 8px 10px 100px;
  background: linear-gradient(270deg, rgba(0,0,0,0.75) 0%, transparent 100%);
  -webkit-overflow-scrolling: touch;
}

.kc-room__detail-eyebrow {
  margin: 0 0 4px;
  font-size: 5px;
  letter-spacing: 0.14em;
  color: #c9a962;
  text-transform: uppercase;
}

.kc-room__detail-title {
  margin: 0 0 8px;
  font-family: "Covered By Your Grace", cursive;
  font-size: 12px;
  color: #e8dcc8;
  text-transform: none;
  line-height: 1.3;
}

.kc-room__detail-status {
  display: inline-block;
  padding: 3px 6px;
  margin-bottom: 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.35);
  color: #d4c4a0;
  text-transform: uppercase;
}

.kc-room__detail-status.is-canon {
  border-color: rgba(201, 169, 98, 0.7);
  color: #c9a962;
  background: rgba(201, 169, 98, 0.08);
}

.kc-room__detail-copy {
  margin: 0 0 10px;
  font-size: 7px;
  line-height: 1.55;
  color: #a89878;
  text-transform: none;
  letter-spacing: 0.02em;
}

.kc-room__detail-section {
  margin-bottom: 10px;
}

.kc-room__detail-section-title {
  margin: 0 0 4px;
  font-size: 5px;
  letter-spacing: 0.12em;
  color: #8a7a62;
  text-transform: uppercase;
}

.kc-room__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.kc-room__chip {
  padding: 3px 5px;
  font-size: 5px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255,255,255,0.08);
  color: #9a8a72;
  background: rgba(0,0,0,0.4);
  text-transform: uppercase;
}

.kc-room__version-line {
  margin: 0 0 3px;
  font-size: 6px;
  color: #7a6a58;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Search results overlay */
.kc-room__results {
  position: absolute;
  left: 50%;
  bottom: 72px;
  transform: translateX(-50%);
  width: min(360px, 88vw);
  max-height: 140px;
  overflow-y: auto;
  z-index: 20;
  background: rgba(8,6,4,0.92);
  border: 1px solid rgba(201, 169, 98, 0.25);
  -webkit-overflow-scrolling: touch;
}

.kc-room__result {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: transparent;
  color: #c9b896;
  cursor: pointer;
  font-family: inherit;
  font-size: 7px;
  letter-spacing: 0.04em;
}

.kc-room__result:hover { background: rgba(201, 169, 98, 0.06); }

.kc-room__result-meta {
  display: block;
  margin-top: 2px;
  font-size: 5px;
  color: #6a5a48;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kc-presence-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.kc-presence-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
`;
