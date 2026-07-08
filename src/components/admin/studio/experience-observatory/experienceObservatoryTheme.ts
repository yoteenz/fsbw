/** Experience Observatory™ — living creative director environment */

export const EXPERIENCE_OBSERVATORY_STYLES = `
body.exp-observatory-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.exp-obs {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 90% 60% at 50% 35%, rgba(120, 80, 160, 0.12) 0%, transparent 55%),
    radial-gradient(ellipse 70% 50% at 20% 80%, rgba(201, 169, 98, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #0a0810 0%, #040306 100%);
  color: #f0ebe3;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.exp-obs * { text-transform: uppercase; box-sizing: border-box; }

.exp-obs__aurora {
  position: absolute;
  inset: -20%;
  background: conic-gradient(from 200deg at 50% 40%, transparent, rgba(180, 140, 220, 0.06), transparent, rgba(201, 169, 98, 0.05), transparent);
  animation: exp-aurora-drift 24s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes exp-aurora-drift { to { transform: rotate(360deg); } }

.exp-obs__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.88) 0%, transparent 100%);
}

.exp-obs__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(180, 140, 220, 0.4);
  background: rgba(0,0,0,0.5);
  color: #d4b8f0;
  font-size: 14px;
  cursor: pointer;
}

.exp-obs__title-block { flex: 1; min-width: 0; }
.exp-obs__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.16em; color: #d4b8f0; }
.exp-obs__title { margin: 2px 0 0; font-size: 7px; letter-spacing: 0.12em; opacity: 0.75; }

.exp-obs__sense-btn {
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(180, 140, 220, 0.45);
  background: rgba(0,0,0,0.55);
  color: #d4b8f0;
  cursor: pointer;
  font-family: inherit;
}

/* Magic Core — wonder sculpture */
.exp-obs__magic-core {
  position: absolute;
  left: 50%;
  top: 44%;
  transform: translate(-50%, -50%);
  width: min(68vw, 260px);
  height: min(68vw, 260px);
  z-index: 10;
}

.exp-obs__magic-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(180, 140, 220, 0.2);
  animation: exp-orbit 18s linear infinite;
}
.exp-obs__magic-orbit--b { inset: 14%; animation-duration: 12s; animation-direction: reverse; border-color: rgba(201, 169, 98, 0.25); }
.exp-obs__magic-orbit--c { inset: 28%; animation-duration: 8s; border-color: rgba(235, 28, 36, 0.2); }

@keyframes exp-orbit { to { transform: rotate(360deg); } }

.exp-obs__magic-readout {
  position: absolute;
  inset: 32%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.exp-obs__magic-val {
  font-family: "Covered By Your Grace", cursive;
  font-size: 38px;
  color: #e8d4ff;
  line-height: 1;
  margin: 0;
  text-shadow: 0 0 24px rgba(180, 140, 220, 0.45);
}
.exp-obs__magic-val.is-glow { color: #c9a962; text-shadow: 0 0 20px rgba(201, 169, 98, 0.5); }
.exp-obs__magic-val.is-dim { color: #eb1c24; text-shadow: 0 0 16px rgba(235, 28, 36, 0.35); }

.exp-obs__magic-label {
  margin: 6px 0 0;
  font-size: 5px;
  letter-spacing: 0.14em;
  opacity: 0.75;
}

.exp-obs__magic-sub {
  margin: 6px 0 0;
  font-size: 4px;
  letter-spacing: 0.08em;
  color: rgba(212, 184, 240, 0.8);
}

/* Installation columns */
.exp-obs__column {
  position: absolute;
  z-index: 12;
  width: 30%;
  max-height: 50%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.exp-obs__column--left { left: 3%; top: 20%; }
.exp-obs__column--right { right: 3%; top: 20%; align-items: flex-end; }

.exp-obs__installation {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid rgba(180, 140, 220, 0.18);
  background: rgba(0,0,0,0.42);
  backdrop-filter: blur(6px);
}

.exp-obs__inst-label {
  display: block;
  font-size: 4px;
  letter-spacing: 0.1em;
  opacity: 0.55;
  margin-bottom: 3px;
}

.exp-obs__inst-val {
  font-family: "Covered By Your Grace", cursive;
  font-size: 16px;
  color: #d4b8f0;
  line-height: 1;
}

.exp-obs__inst-beam {
  height: 2px;
  margin-top: 5px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.exp-obs__inst-beam-fill {
  height: 100%;
  background: linear-gradient(90deg, #7b5ea7, #d4b8f0);
  transition: width 0.7s ease;
}
.exp-obs__inst-beam-fill.is-warm { background: linear-gradient(90deg, #c9a962, #f5e6c8); }

.exp-obs__deck {
  position: absolute;
  left: 50%;
  bottom: max(10px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(96vw, 420px);
  z-index: 14;
  max-height: 30%;
  overflow-y: auto;
  scrollbar-width: none;
}
.exp-obs__deck::-webkit-scrollbar { display: none; }

.exp-obs__upgrade-line {
  font-size: 4px;
  letter-spacing: 0.07em;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  opacity: 0.82;
  line-height: 1.45;
}

.exp-obs__whisper {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(180, 140, 220, 0.12);
  font-size: 4px;
  letter-spacing: 0.08em;
  color: rgba(212, 184, 240, 0.75);
  line-height: 1.5;
  font-style: italic;
}
`;
