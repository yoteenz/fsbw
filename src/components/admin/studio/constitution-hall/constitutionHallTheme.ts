/** Constitution Hall™ — monumental governance chamber styles */

export const CONSTITUTION_HALL_STYLES = `
body.constitution-hall-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.const-hall {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 90% 60% at 50% 20%, rgba(201, 169, 98, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse 120% 80% at 50% 55%, #14110d 0%, #060504 50%, #020201 100%);
  color: #e8e0d4;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.const-hall * { box-sizing: border-box; text-transform: uppercase; }

.const-hall__marble-pillars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(201,169,98,0.06) 0%, transparent 8%, transparent 92%, rgba(201,169,98,0.06) 100%),
    repeating-linear-gradient(90deg, transparent 0, transparent 48px, rgba(255,255,255,0.02) 48px, rgba(255,255,255,0.02) 49px);
  opacity: 0.7;
}

.const-hall__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
}

.const-hall__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(201, 169, 98, 0.45);
  background: rgba(0,0,0,0.55);
  color: #c9a962;
  font-size: 14px;
  cursor: pointer;
}

.const-hall__title-block { flex: 1; min-width: 0; }
.const-hall__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.18em; color: #c9a962; }
.const-hall__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #e8dcc8;
  text-transform: none;
}

.const-hall__keeper-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(212, 196, 160, 0.45);
  color: #d4c4a0;
  background: rgba(0,0,0,0.5);
}

/* Law tablets — left */
.const-hall__laws {
  position: absolute;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 34%;
  max-width: 200px;
  z-index: 12;
  overflow-y: auto;
  padding: 8px 6px 80px;
  -webkit-overflow-scrolling: touch;
}

.const-hall__law {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
  padding: 8px 8px;
  border: 1px solid rgba(201, 169, 98, 0.22);
  background: linear-gradient(135deg, rgba(20,17,13,0.9) 0%, rgba(8,6,4,0.85) 100%);
  color: #c9b896;
  cursor: pointer;
  font-family: inherit;
}
.const-hall__law.is-active {
  border-color: rgba(201, 169, 98, 0.65);
  box-shadow: 0 0 12px rgba(201, 169, 98, 0.15);
}
.const-hall__law-num { font-size: 5px; color: #c9a962; letter-spacing: 0.14em; display: block; }
.const-hall__law-title { font-size: 6px; letter-spacing: 0.08em; margin-top: 3px; display: block; line-height: 1.35; }

/* Scores — right */
.const-hall__scores {
  position: absolute;
  right: 0;
  top: 56px;
  bottom: 0;
  width: 34%;
  max-width: 200px;
  z-index: 12;
  padding: 8px 6px 80px;
  overflow-y: auto;
}

.const-hall__score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 5px;
  letter-spacing: 0.08em;
}
.const-hall__score-bar {
  height: 3px;
  background: rgba(255,255,255,0.08);
  margin-top: 2px;
  margin-bottom: 6px;
}
.const-hall__score-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7355, #c9a962);
  transition: width 0.4s ease;
}
.const-hall__score-fill.is-low { background: linear-gradient(90deg, #6b3030, #eb1c24); }

/* Central monument */
.const-hall__monument {
  position: absolute;
  left: 50%;
  top: 44%;
  transform: translate(-50%, -50%);
  width: min(78vw, 320px);
  z-index: 10;
  text-align: center;
}

.const-hall__compliance-ring {
  width: min(52vw, 200px);
  height: min(52vw, 200px);
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid rgba(201, 169, 98, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(0,0,0,0.55) 0%, transparent 70%);
  box-shadow: 0 0 40px rgba(201, 169, 98, 0.12);
}

.const-hall__compliance-val {
  font-family: "Covered By Your Grace", cursive;
  font-size: 40px;
  color: #c9a962;
  line-height: 1;
  text-transform: none;
}
.const-hall__compliance-val.is-fail { color: #eb1c24; }
.const-hall__compliance-label { font-size: 6px; letter-spacing: 0.14em; margin-top: 4px; opacity: 0.75; }

.const-hall__status {
  margin-top: 10px;
  font-size: 6px;
  letter-spacing: 0.1em;
  color: #d4c4a0;
}

/* Review dock — bottom */
.const-hall__dock {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 25;
  padding: 8px 10px max(10px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 70%, transparent 100%);
}

.const-hall__form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  margin: 0 auto;
}

.const-hall__input,
.const-hall__textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 7px;
  letter-spacing: 0.06em;
  font-family: inherit;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0,0,0,0.6);
  color: #e8e0d4;
  text-transform: none;
}
.const-hall__textarea { min-height: 52px; resize: vertical; }

.const-hall__review-btn {
  padding: 10px 14px;
  font-size: 6px;
  letter-spacing: 0.14em;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.12);
  color: #c9a962;
  cursor: pointer;
  font-family: inherit;
}
.const-hall__review-btn:disabled { opacity: 0.45; cursor: wait; }

.const-hall__keeper-ticker {
  margin-top: 6px;
  font-size: 5px;
  letter-spacing: 0.08em;
  color: #a89878;
  line-height: 1.5;
  max-height: 36px;
  overflow: hidden;
}

.const-hall__law-detail {
  position: absolute;
  left: 34%;
  right: 34%;
  top: 58px;
  z-index: 11;
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.06em;
  line-height: 1.45;
  text-align: center;
  color: #b8a888;
  pointer-events: none;
}

@media (max-width: 400px) {
  .const-hall__laws, .const-hall__scores { width: 30%; }
  .const-hall__law-detail { left: 30%; right: 30%; font-size: 4px; }
}
`;
