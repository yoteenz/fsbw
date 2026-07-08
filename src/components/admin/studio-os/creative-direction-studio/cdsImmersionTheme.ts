/** CDS workspace immersion — depth, idle life, diegetic furniture UI, cinematic camera. */

export const CDS_IMMERSION_STYLES = `
/* ── Cinematic camera (active zone) ── */
.cds-genesis__zone-panel.is-active .cds-stack__viewport {
  animation: cds-camera-breathe 14s ease-in-out infinite;
}

/* Freeze camera + parallax while Scene Stack pipeline runs — stops "page refresh" feel */
.cds-stack__viewport.is-pipeline-active {
  animation: none !important;
  transform: none !important;
}

.cds-stack__viewport.is-pipeline-active .cds-stack__depth-plane {
  transition: none !important;
  transform: none !important;
  will-change: auto;
}

.cds-stack__idle-life.is-frozen,
.cds-stack__idle-life.is-frozen::before,
.cds-stack__idle-life.is-frozen::after {
  animation: none !important;
}

@keyframes cds-camera-breathe {
  0%, 100% {
    transform: scale(1) translate3d(
      calc(var(--cds-px, 0) * 3px),
      calc(var(--cds-py, 0) * 2px + var(--cds-breath, 0) * -1px),
      0
    );
  }
  50% {
    transform: scale(1.012) translate3d(
      calc(var(--cds-px, 0) * 4px),
      calc(var(--cds-py, 0) * 3px + var(--cds-breath, 0) * -2px),
      0
    );
  }
}

/* ── Scene Stack depth planes (parallax per layer group) ── */
.cds-stack__depth-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.cds-stack__depth-plane {
  position: absolute;
  inset: -2%;
  will-change: transform;
  transition: transform 0.4s ease-out;
}

.cds-stack__depth-plane--rear {
  z-index: 1;
  transform: translate3d(
    calc(var(--cds-px, 0) * -6px),
    calc(var(--cds-py, 0) * -3px),
    -40px
  ) scale(1.03);
}

.cds-stack__depth-plane--mid {
  z-index: 2;
  transform: translate3d(
    calc(var(--cds-px, 0) * -2px),
    calc(var(--cds-py, 0) * -1px),
    0
  );
}

.cds-stack__depth-plane--fore {
  z-index: 3;
  transform: translate3d(
    calc(var(--cds-px, 0) * 8px),
    calc(var(--cds-py, 0) * 5px),
    24px
  ) scale(1.01);
}

/* ── Idle Life™ — room never frozen ── */
.cds-stack__idle-life {
  position: absolute;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  overflow: hidden;
}

.cds-stack__idle-life::before {
  content: '';
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    ellipse 55% 40% at calc(68% + var(--cds-px, 0) * 4%) calc(22% + var(--cds-breath, 0) * 3%),
    rgba(255, 220, 160, 0.07) 0%,
    transparent 55%
  );
  animation: cds-sun-shift 28s ease-in-out infinite;
}

.cds-stack__idle-life::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(201, 169, 98, 0.04) 0%, transparent 0.4%),
    radial-gradient(circle at 45% 60%, rgba(255, 255, 255, 0.03) 0%, transparent 0.35%),
    radial-gradient(circle at 72% 40%, rgba(201, 169, 98, 0.035) 0%, transparent 0.3%),
    radial-gradient(circle at 88% 70%, rgba(255, 255, 255, 0.025) 0%, transparent 0.25%);
  background-size: 100% 100%;
  animation: cds-dust-drift 40s linear infinite;
  opacity: 0.7;
}

@keyframes cds-sun-shift {
  0%, 100% { opacity: 0.55; transform: translateX(0); }
  50% { opacity: 0.9; transform: translateX(2%); }
}

@keyframes cds-dust-drift {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-3%, -2%, 0); }
}

.cds-stack__idle-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  top: 30%;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.12), transparent);
  animation: cds-holo-flicker 6s ease-in-out infinite;
  opacity: 0.4;
}

@keyframes cds-holo-flicker {
  0%, 92%, 100% { opacity: 0.15; }
  94% { opacity: 0.55; }
}

/* Story Table foreground props (CSS — not a web card) */
.cds-stack__foreground-props {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
}

.cds-stack__foreground-props::before {
  content: '';
  position: absolute;
  left: -2%;
  bottom: 0;
  width: 38%;
  height: 22%;
  background: linear-gradient(165deg, rgba(18, 14, 10, 0.85) 0%, transparent 72%);
  transform: translate3d(calc(var(--cds-px, 0) * 14px), calc(var(--cds-py, 0) * 8px), 48px);
  filter: blur(0.5px);
}

.cds-stack__foreground-props::after {
  content: '';
  position: absolute;
  right: 6%;
  bottom: 14%;
  width: 28px;
  height: 28px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 35% 30%, rgba(80, 50, 30, 0.9), rgba(20, 12, 8, 0.95));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  transform: translate3d(calc(var(--cds-px, 0) * 18px), calc(var(--cds-py, 0) * 10px), 56px);
  animation: cds-mug-steam 5s ease-in-out infinite;
}

@keyframes cds-mug-steam {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.08); }
}

/* ── Studio Orb™ host ── */
.cds-orb-host {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  padding-top: 4%;
}

.cds-orb-host__orbit-ring {
  position: absolute;
  top: 8%;
  width: 72px;
  height: 72px;
  border: 1px solid rgba(201, 169, 98, 0.15);
  border-radius: 50%;
  animation: cds-orb-orbit 24s linear infinite;
}

@keyframes cds-orb-orbit {
  to { transform: rotate(360deg); }
}

.cds-orb-host__sphere {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.55);
  background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4) 0%, rgba(201,169,98,0.25) 42%, rgba(12,10,8,0.92) 100%);
  box-shadow:
    0 0 32px rgba(201, 169, 98, 0.35),
    0 0 64px rgba(201, 169, 98, 0.12);
  animation: cds-orb-breathe 4.5s ease-in-out infinite;
  z-index: 2;
}

@keyframes cds-orb-breathe {
  0%, 100% { transform: scale(1); box-shadow: 0 0 28px rgba(201, 169, 98, 0.3); }
  50% { transform: scale(1.06); box-shadow: 0 0 42px rgba(201, 169, 98, 0.45); }
}

.cds-orb-host__core-glow {
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 240, 200, 0.5) 0%, transparent 70%);
  animation: cds-orb-pulse 3s ease-in-out infinite;
}

@keyframes cds-orb-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.95; }
}

.cds-orb-host__progress-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(
    rgba(201, 169, 98, 0.85) var(--orb-progress, 10%),
    rgba(255, 255, 255, 0.06) 0
  );
  mask: radial-gradient(circle, transparent 62%, #000 63%);
  -webkit-mask: radial-gradient(circle, transparent 62%, #000 63%);
  animation: cds-orb-orbit 3s linear infinite;
}

.cds-orb-host__hologram {
  margin-top: 10px;
  max-width: 92%;
  text-align: center;
  padding: 6px 8px;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.06) 0%, transparent 100%);
  border: none;
  box-shadow: none;
  animation: cds-holo-float 6s ease-in-out infinite;
}

@keyframes cds-holo-float {
  0%, 100% { transform: translateY(0); opacity: 0.92; }
  50% { transform: translateY(-2px); opacity: 1; }
}

.cds-orb-host__speech {
  margin: 0 0 4px;
  font-size: 6px;
  line-height: 1.5;
  color: #f5f0e8;
  text-shadow: 0 0 12px rgba(201, 169, 98, 0.4);
}

.cds-orb-host__guidance {
  margin: 0 0 3px;
  font-size: 5px;
  opacity: 0.65;
  line-height: 1.4;
}

.cds-orb-host__insight {
  margin: 0;
  font-size: 5px;
  color: rgba(201, 169, 98, 0.95);
  line-height: 1.4;
}

.cds-orb-host__pipeline {
  margin: 4px 0 0;
  font-size: 5px;
  color: rgba(201, 169, 98, 0.85);
  animation: cds-stack-pipeline-blink 1.4s ease-in-out infinite;
}

.cds-orb-host__glance-beam {
  position: absolute;
  top: 42%;
  left: 50%;
  width: 2px;
  height: 28%;
  background: linear-gradient(180deg, rgba(201, 169, 98, 0.25), transparent);
  transform: translateX(-50%) rotate(12deg);
  transform-origin: top center;
  animation: cds-orb-glance 8s ease-in-out infinite;
  opacity: 0.35;
}

@keyframes cds-orb-glance {
  0%, 70%, 100% { opacity: 0.1; transform: translateX(-50%) rotate(8deg); }
  78% { opacity: 0.45; transform: translateX(-50%) rotate(18deg); }
}

/* ── Story Table™ surface (furniture = UI) ── */
.cds-story-table__surface {
  position: relative;
  width: 100%;
  height: 100%;
  transform: perspective(900px) rotateX(34deg) rotateZ(-1deg);
  transform-origin: 50% 80%;
  pointer-events: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 6px 8px;
  padding: 4% 6% 8%;
  box-sizing: border-box;
}

.cds-story-table__surface-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    125deg,
    transparent 30%,
    rgba(255, 255, 255, 0.04) 48%,
    transparent 62%
  );
  animation: cds-table-shimmer 9s ease-in-out infinite;
  pointer-events: none;
}

@keyframes cds-table-shimmer {
  0%, 100% { opacity: 0.35; transform: translateX(-4%); }
  50% { opacity: 0.75; transform: translateX(4%); }
}

.cds-story-table__surface-grid {
  position: absolute;
  inset: 8%;
  background-image:
    linear-gradient(rgba(201, 169, 98, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 169, 98, 0.04) 1px, transparent 1px);
  background-size: 18px 18px;
  opacity: 0.35;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%);
}

.cds-story-table__card {
  position: relative;
  padding: 6px 8px;
  background: linear-gradient(145deg, rgba(22, 18, 14, 0.72) 0%, rgba(12, 10, 8, 0.55) 100%);
  border: 1px solid rgba(201, 169, 98, 0.12);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transform: translateZ(12px);
  animation: cds-paper-settle 12s ease-in-out infinite;
}

@keyframes cds-paper-settle {
  0%, 100% { transform: translateZ(12px) rotate(-0.4deg); }
  50% { transform: translateZ(14px) rotate(0.3deg); }
}

.cds-story-table__card--branch { grid-column: 1; grid-row: 1; }
.cds-story-table__card--approval { grid-column: 2; grid-row: 1; }
.cds-story-table__card--hologram {
  grid-column: 1 / -1;
  grid-row: 3;
  border-color: rgba(201, 169, 98, 0.28);
  background: linear-gradient(145deg, rgba(201, 169, 98, 0.08) 0%, rgba(12, 10, 8, 0.5) 100%);
  animation: cds-holo-card 3s ease-in-out infinite;
}

@keyframes cds-holo-card {
  0%, 100% { opacity: 0.88; }
  50% { opacity: 1; }
}

.cds-story-table__card-kicker {
  margin: 0 0 3px;
  font-size: 4px;
  letter-spacing: 0.14em;
  color: rgba(201, 169, 98, 0.7);
}

.cds-story-table__card-title {
  margin: 0 0 2px;
  font-size: 7px;
  letter-spacing: 0.06em;
  color: #f5f0e8;
  line-height: 1.25;
}

.cds-story-table__card-sub {
  margin: 0;
  font-size: 5px;
  opacity: 0.55;
}

.cds-story-table__card-status {
  margin: 3px 0 0;
  font-size: 5px;
  color: rgba(201, 169, 98, 0.9);
}

.cds-story-table__tone-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 5px;
}

.cds-story-table__tone-tag {
  padding: 2px 4px;
  font-size: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
}

.cds-story-table__holo-bar {
  height: 2px;
  margin-top: 5px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.cds-story-table__holo-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(201, 169, 98, 0.4), rgba(201, 169, 98, 0.95));
  transition: width 0.5s ease-out;
}

.cds-story-table__card-row {
  grid-column: 1 / -1;
  grid-row: 3;
  display: flex;
  gap: 5px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.cds-story-table__mini-card {
  flex: 1;
  min-width: 42px;
  padding: 4px 5px;
  font-size: 4px;
  letter-spacing: 0.05em;
  background: rgba(14, 12, 10, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transform: rotate(var(--card-rot, 0deg)) translateZ(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

.cds-story-table__mini-card.is-approved {
  border-color: rgba(201, 169, 98, 0.35);
  color: rgba(201, 169, 98, 0.9);
}

.cds-story-table__mini-card.is-live {
  animation: cds-mini-live 2s ease-in-out infinite;
}

@keyframes cds-mini-live {
  0%, 100% { box-shadow: 0 0 0 rgba(201, 169, 98, 0); }
  50% { box-shadow: 0 0 8px rgba(201, 169, 98, 0.25); }
}

.cds-story-table__polaroids {
  position: absolute;
  right: 4%;
  bottom: 18%;
  display: flex;
  gap: 4px;
  transform: translateZ(20px);
}

.cds-story-table__polaroid {
  width: 36px;
  padding: 3px 3px 8px;
  font-size: 3px;
  line-height: 1.2;
  background: rgba(240, 235, 227, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: rotate(var(--pol-rot, 0deg));
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
  animation: cds-paper-settle 14s ease-in-out infinite;
}

.cds-story-table__paper-edge {
  position: absolute;
  left: 8%;
  bottom: 6%;
  width: 22%;
  height: 8%;
  background: linear-gradient(180deg, rgba(240, 230, 210, 0.08), rgba(18, 14, 10, 0.4));
  transform: rotate(-8deg) translateZ(24px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cds-story-table__mug {
  position: absolute;
  right: 12%;
  bottom: 10%;
  width: 16px;
  height: 14px;
  border-radius: 40% 40% 35% 35%;
  background: rgba(50, 32, 20, 0.8);
  transform: translateZ(30px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
}

/* Parallel Futures™ on Story Table™ */
.cds-story-table__pf {
  grid-column: 1 / -1;
  grid-row: 2;
  padding: 6px 8px;
  background: rgba(8, 7, 6, 0.55);
  border: 1px solid rgba(120, 200, 255, 0.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transform: translateZ(16px);
  max-height: 42%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cds-story-table__pf--approved {
  border-color: rgba(201, 169, 98, 0.35);
}
.cds-story-table__pf-kicker {
  font-size: 4px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.65;
  margin: 0;
}
.cds-story-table__pf-title {
  font-size: 6px;
  margin: 2px 0 0;
  color: #c9a962;
}
.cds-story-table__pf-sub,
.cds-story-table__pf-meta {
  font-size: 4px;
  opacity: 0.75;
  margin: 2px 0 0;
}
.cds-story-table__pf-scroll {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.cds-story-table__pf-card {
  flex: 0 0 auto;
  min-width: 72px;
  padding: 4px 6px;
  text-align: left;
  border: 1px solid rgba(80, 200, 255, 0.22);
  background: rgba(0, 0, 0, 0.35);
  color: #e8e0d4;
  cursor: pointer;
  font-family: inherit;
  font-size: 4px;
  line-height: 1.35;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cds-story-table__pf-card.is-active {
  border-color: rgba(201, 169, 98, 0.55);
  background: rgba(201, 169, 98, 0.1);
}
.cds-story-table__pf-card.is-merged {
  border-color: rgba(120, 200, 255, 0.45);
}
.cds-story-table__pf-metrics {
  opacity: 0.6;
  font-size: 3px;
}
.cds-story-table__pf-merge {
  font-size: 3px;
  opacity: 0.7;
  line-height: 1.4;
  max-height: 28px;
  overflow-y: auto;
}
.cds-story-table__pf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.cds-story-table__pf-btn {
  font-size: 3px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 6px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0, 0, 0, 0.4);
  color: #c9a962;
  cursor: pointer;
}
.cds-story-table__pf-btn.is-primary {
  border-color: rgba(201, 169, 98, 0.55);
  color: #f0e6d0;
}
.cds-story-table__pf-card.is-eliminated {
  opacity: 0.35;
  text-decoration: line-through;
  pointer-events: none;
}

/* Review Chamber™ */
.cds-review-chamber__embed {
  overflow-y: auto;
  pointer-events: auto;
}
.cds-review-chamber {
  width: 100%;
  height: 100%;
  padding: 8px 10px;
  box-sizing: border-box;
  color: #e8e0d4;
  font-size: 4px;
  letter-spacing: 0.06em;
  line-height: 1.45;
}
.cds-review-chamber__kicker {
  text-transform: uppercase;
  opacity: 0.6;
  margin: 0 0 4px;
}
.cds-review-chamber__title {
  color: #c9a962;
  font-size: 6px;
  margin: 0 0 8px;
}
.cds-review-chamber__holo-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  min-height: 120px;
}
.cds-review-chamber__holo {
  flex: 1;
  position: relative;
  padding: 10px;
  border: 1px solid rgba(120, 200, 255, 0.35);
  background: rgba(0, 0, 0, 0.5);
  transform: perspective(800px) rotateY(var(--holo-rot, 0deg)) translateZ(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
}
.cds-review-chamber__holo.is-active {
  border-color: rgba(201, 169, 98, 0.6);
}
.cds-review-chamber__holo-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(ellipse at 50% 0%, rgba(120, 200, 255, 0.2), transparent 70%);
  pointer-events: none;
}
.cds-review-chamber__holo-tag {
  color: #c9a962;
  font-size: 7px;
  margin: 0 0 4px;
}
.cds-review-chamber__holo-label,
.cds-review-chamber__holo-mood,
.cds-review-chamber__holo-detail {
  margin: 2px 0;
  opacity: 0.85;
}
.cds-review-chamber__btn {
  margin-top: 4px;
  margin-right: 4px;
  font-size: 3px;
  text-transform: uppercase;
  padding: 3px 6px;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(0, 0, 0, 0.45);
  color: #c9a962;
  cursor: pointer;
}
.cds-review-chamber__btn.is-primary {
  border-color: rgba(201, 169, 98, 0.6);
}
.cds-review-chamber__championship {
  margin: 8px 0;
  padding: 6px 8px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(201, 169, 98, 0.06);
}
.cds-review-chamber__championship.is-merge {
  border-color: rgba(120, 200, 255, 0.4);
}
.cds-review-chamber__champ-title {
  color: #c9a962;
  margin: 0 0 4px;
}
.cds-review-chamber__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.cds-review-chamber__bracket {
  margin-top: 8px;
  max-height: 48px;
  overflow-y: auto;
  opacity: 0.75;
}
.cds-review-chamber__round {
  margin-bottom: 4px;
}
.cds-review-chamber__orb-panel {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(201, 169, 98, 0.15);
}
.cds-review-chamber__orb-line {
  margin: 2px 0;
  opacity: 0.88;
}
.cds-pipeline-vision-gate {
  border-color: rgba(120, 200, 255, 0.35) !important;
  color: rgba(200, 220, 255, 0.9) !important;
}

/* Diegetic wall/shelf surfaces (other zones — not floating web cards) */
.cds-diegetic__wall-embed,
.cds-diegetic__shelf-embed,
.cds-diegetic__desk-embed {
  width: 100%;
  height: 100%;
  padding: 6px 8px;
  background: transparent;
  border: none;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cds-diegetic__wall-embed .cds-genesis__label,
.cds-diegetic__shelf-embed .cds-genesis__label,
.cds-diegetic__desk-embed .cds-genesis__label {
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
}

.cds-diegetic__wall-embed .cds-genesis__input,
.cds-diegetic__desk-embed .cds-genesis__input,
.cds-diegetic__desk-embed textarea {
  background: rgba(8, 7, 6, 0.55);
  border-color: rgba(201, 169, 98, 0.15);
}

/* Hide generic glass panel look in immersive room */
.cds-stack .cds-genesis__glass-panel {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  padding: 0;
}

.cds-stack__layer-strip {
  opacity: 0.72;
  background: rgba(8, 7, 6, 0.35);
  border-color: rgba(201, 169, 98, 0.12);
}

.cds-stack__pipeline-hud {
  background: rgba(8, 7, 6, 0.38);
  border-color: rgba(201, 169, 98, 0.18);
  backdrop-filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) {
  .cds-genesis__zone-panel.is-active .cds-stack__viewport,
  .cds-orb-host__sphere,
  .cds-orb-host__orbit-ring,
  .cds-stack__idle-life::before,
  .cds-stack__idle-life::after,
  .cds-story-table__surface-sheen,
  .cds-story-table__card {
    animation: none !important;
  }
}
`;
