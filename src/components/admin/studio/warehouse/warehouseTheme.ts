import { STUDIO_WAREHOUSE_ACCENT } from '../../../../studio-os-core/studio-warehouse';

export const WH_VISUAL = {
  accent: STUDIO_WAREHOUSE_ACCENT,
  black: '#0a0908',
  warm: '#f5f0e8',
  muted: 'rgba(245, 240, 232, 0.55)',
  panel: 'rgba(12, 11, 9, 0.72)',
  border: 'rgba(201, 169, 98, 0.28)',
  glow: 'rgba(201, 169, 98, 0.12)',
  floor: 'linear-gradient(180deg, #141210 0%, #0a0908 100%)',
};

export const WAREHOUSE_STYLES = `
.wh-root {
  color: ${WH_VISUAL.warm};
  font-family: "Futura PT", system-ui, sans-serif;
  min-height: 100%;
}
.wh-hero {
  padding: 12px 14px;
  background: ${WH_VISUAL.panel};
  border: 1px solid ${WH_VISUAL.border};
  margin-bottom: 10px;
}
.wh-hero__title {
  font-size: 18px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${WH_VISUAL.accent};
  font-family: "Covered By Your Grace", cursive;
}
.wh-hero__sub {
  font-size: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-top: 4px;
  line-height: 1.5;
}
.wh-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}
.wh-tab {
  padding: 5px 9px;
  font-size: 5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid ${WH_VISUAL.border};
  background: rgba(0,0,0,0.35);
  color: ${WH_VISUAL.warm};
  cursor: pointer;
}
.wh-tab.is-active {
  border-color: ${WH_VISUAL.accent};
  background: ${WH_VISUAL.glow};
  color: ${WH_VISUAL.accent};
}
.wh-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 34%);
  gap: 10px;
  align-items: start;
}
@media (max-width: 900px) {
  .wh-layout { grid-template-columns: 1fr; }
}
.wh-district-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.wh-district-btn {
  padding: 6px 8px;
  font-size: 5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.4);
  color: ${WH_VISUAL.warm};
  cursor: pointer;
  text-align: left;
}
.wh-district-btn.is-active {
  border-color: ${WH_VISUAL.accent};
  box-shadow: inset 0 0 12px ${WH_VISUAL.glow};
}
.wh-district-stage {
  position: relative;
  min-height: 280px;
  padding: 12px;
  background: ${WH_VISUAL.floor};
  border: 1px solid ${WH_VISUAL.border};
  overflow: hidden;
}
.wh-district-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201,169,98,0.08), transparent 70%);
  pointer-events: none;
}
.wh-district-label {
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${WH_VISUAL.accent};
  margin-bottom: 8px;
}
.wh-district-tagline {
  font-size: 5px;
  opacity: 0.6;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
  max-width: 420px;
  line-height: 1.5;
}
.wh-asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 8px;
  position: relative;
  z-index: 1;
}
.wh-district--lighting .wh-asset-grid {
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
}
.wh-district--lighting .wh-asset-card {
  border-radius: 50%;
  aspect-ratio: 1;
}
.wh-district--materials .wh-asset-grid {
  grid-template-columns: repeat(3, 1fr);
}
.wh-district--materials .wh-asset-card {
  min-height: 72px;
}
.wh-asset-card {
  border: 1px solid ${WH_VISUAL.border};
  background: rgba(0,0,0,0.45);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.wh-asset-card:hover, .wh-asset-card.is-selected {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px ${WH_VISUAL.accent};
}
.wh-asset-card__preview {
  height: 64px;
  background-size: cover;
  background-position: center;
  position: relative;
}
.wh-district--lighting .wh-asset-card__preview {
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(201,169,98,0.25);
}
.wh-asset-card__meta {
  padding: 5px 6px;
}
.wh-asset-card__name {
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.35;
}
.wh-asset-card__ver {
  font-size: 4px;
  opacity: 0.55;
  margin-top: 2px;
}
.wh-inspector {
  border: 1px solid ${WH_VISUAL.border};
  background: ${WH_VISUAL.panel};
  padding: 10px;
  position: sticky;
  top: 8px;
}
.wh-preview-stage {
  height: 140px;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}
.wh-preview-object {
  width: 72%;
  height: 72%;
  background-size: cover;
  background-position: center;
  transition: transform 0.15s ease;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}
.wh-preview-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 8px;
}
.wh-action {
  padding: 4px 6px;
  font-size: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid ${WH_VISUAL.border};
  background: rgba(0,0,0,0.35);
  color: ${WH_VISUAL.accent};
  cursor: pointer;
}
.wh-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 4px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 3px;
}
.wh-recipe {
  border: 1px solid ${WH_VISUAL.border};
  background: rgba(0,0,0,0.35);
  padding: 10px;
  margin-bottom: 10px;
}
.wh-recipe__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.wh-search {
  width: 100%;
  padding: 7px 8px;
  font-size: 6px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${WH_VISUAL.border};
  background: rgba(0,0,0,0.5);
  color: ${WH_VISUAL.warm};
  margin-bottom: 8px;
}
.wh-search::placeholder { opacity: 0.45; }
.wh-recommend {
  padding: 6px 8px;
  border: 1px solid rgba(201,169,98,0.15);
  background: rgba(201,169,98,0.06);
  margin-bottom: 6px;
  font-size: 4px;
  letter-spacing: 0.05em;
  line-height: 1.5;
}
.wh-reuse-banner {
  padding: 8px;
  border: 1px solid rgba(72, 160, 96, 0.35);
  background: rgba(72, 160, 96, 0.08);
  margin-bottom: 8px;
  font-size: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.wh-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.wh-modal__card {
  width: min(520px, 96vw);
  max-height: 80vh;
  overflow: auto;
  border: 1px solid ${WH_VISUAL.border};
  background: #12100e;
  padding: 12px;
}
.wh-marketplace-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
`;

export const whSectionTitle = {
  fontSize: '6px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: WH_VISUAL.accent,
  marginBottom: '6px',
};
