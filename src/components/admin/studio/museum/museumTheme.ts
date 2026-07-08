import { STUDIO_MUSEUM_ACCENT } from '../../../../studio-os-core/studio-museum';

export const SM_VISUAL = {
  accent: STUDIO_MUSEUM_ACCENT,
  black: '#08070a',
  warm: '#f0ebe4',
  muted: 'rgba(240, 235, 227, 0.5)',
  panel: 'rgba(14, 12, 18, 0.82)',
  border: 'rgba(155, 123, 184, 0.32)',
  glow: 'rgba(155, 123, 184, 0.14)',
  orb: 'radial-gradient(circle at 35% 30%, rgba(200,170,255,0.45), rgba(80,50,120,0.2) 55%, transparent 70%)',
};

export const MUSEUM_STYLES = `
.sm-root {
  color: ${SM_VISUAL.warm};
  font-family: "Futura PT", system-ui, sans-serif;
}
.sm-hero {
  padding: 12px 14px;
  background: ${SM_VISUAL.panel};
  border: 1px solid ${SM_VISUAL.border};
  margin-bottom: 10px;
}
.sm-hero__title {
  font-size: 18px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${SM_VISUAL.accent};
  font-family: "Covered By Your Grace", cursive;
}
.sm-hero__sub {
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.62;
  margin-top: 4px;
  line-height: 1.5;
}
.sm-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}
.sm-tab {
  padding: 5px 9px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid ${SM_VISUAL.border};
  background: rgba(0,0,0,0.4);
  color: ${SM_VISUAL.warm};
  cursor: pointer;
}
.sm-tab.is-active {
  border-color: ${SM_VISUAL.accent};
  background: ${SM_VISUAL.glow};
  color: ${SM_VISUAL.accent};
}
.sm-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 32%);
  gap: 10px;
  align-items: start;
}
@media (max-width: 900px) {
  .sm-layout { grid-template-columns: 1fr; }
}
.sm-exhibit-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.sm-exhibit-btn {
  text-align: left;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.35);
  cursor: pointer;
  color: ${SM_VISUAL.warm};
}
.sm-exhibit-btn.is-active {
  border-color: ${SM_VISUAL.accent};
  box-shadow: inset 0 0 16px ${SM_VISUAL.glow};
}
.sm-exhibit-btn__title {
  font-size: 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${SM_VISUAL.accent};
}
.sm-exhibit-btn__sub {
  font-size: 4px;
  opacity: 0.55;
  margin-top: 3px;
  letter-spacing: 0.05em;
}
.sm-hero-env {
  min-height: 200px;
  border: 1px solid ${SM_VISUAL.border};
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}
.sm-hero-env__plate {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.sm-hero-env__label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  right: 10px;
  padding: 8px;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.45;
}
.sm-rooms {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.sm-room-chip {
  padding: 4px 7px;
  font-size: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(155,123,184,0.25);
  background: rgba(155,123,184,0.08);
}
.sm-panel {
  border: 1px solid ${SM_VISUAL.border};
  background: ${SM_VISUAL.panel};
  padding: 10px;
  margin-bottom: 8px;
}
.sm-section-title {
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${SM_VISUAL.accent};
  margin-bottom: 6px;
}
.sm-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 4px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 3px;
}
.sm-orb-host {
  border: 1px solid ${SM_VISUAL.border};
  background: ${SM_VISUAL.panel};
  padding: 12px;
  text-align: center;
  position: sticky;
  top: 8px;
}
.sm-orb-sphere {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 10px;
  background: ${SM_VISUAL.orb};
  border: 1px solid rgba(200,170,255,0.35);
  animation: sm-orb-breathe 4s ease-in-out infinite;
}
@keyframes sm-orb-breathe {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50% { transform: scale(1.06); opacity: 1; }
}
.sm-orb-speech {
  font-size: 5px;
  letter-spacing: 0.06em;
  line-height: 1.55;
  opacity: 0.88;
  font-style: italic;
}
.sm-timeline {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 10px 0;
  overflow-x: auto;
  padding-bottom: 4px;
}
.sm-timeline__node {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.35);
  cursor: pointer;
  position: relative;
}
.sm-timeline__node.is-active {
  border-color: ${SM_VISUAL.accent};
  color: ${SM_VISUAL.accent};
}
.sm-timeline__arrow {
  flex-shrink: 0;
  opacity: 0.35;
  font-size: 8px;
  padding: 0 2px;
}
.sm-timeline-scrub {
  width: 100%;
  margin: 8px 0;
  accent-color: ${SM_VISUAL.accent};
}
.sm-legacy-hall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.sm-legacy-frame {
  aspect-ratio: 3/4;
  border: 2px solid rgba(201,169,98,0.35);
  background: rgba(0,0,0,0.45);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.sm-legacy-frame:hover {
  transform: translateY(-3px);
}
.sm-legacy--gold { border-color: rgba(201,169,98,0.55); }
.sm-legacy--launch { border-color: rgba(100,160,255,0.45); }
.sm-legacy--diamond { border-color: rgba(180,140,255,0.5); }
.sm-legacy-frame__icon { font-size: 22px; margin-bottom: auto; }
.sm-legacy-frame__title {
  font-size: 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${SM_VISUAL.accent};
}
.sm-legacy-frame__caption {
  font-size: 4px;
  opacity: 0.55;
  margin-top: 4px;
  line-height: 1.4;
}
.sm-replay-track {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 10px 0;
}
.sm-replay-step {
  padding: 6px 8px;
  font-size: 4px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.35);
}
.sm-replay-step.is-active {
  border-color: ${SM_VISUAL.accent};
  background: ${SM_VISUAL.glow};
}
.sm-replay-step.is-done {
  opacity: 0.45;
}
.sm-action {
  padding: 4px 7px;
  font-size: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid ${SM_VISUAL.border};
  background: rgba(0,0,0,0.35);
  color: ${SM_VISUAL.accent};
  cursor: pointer;
}
.sm-bullet {
  font-size: 4px;
  letter-spacing: 0.05em;
  line-height: 1.5;
  opacity: 0.78;
  margin-bottom: 3px;
}
`;

export const smSectionTitle = {
  fontSize: '6px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: SM_VISUAL.accent,
  marginBottom: '6px',
};
