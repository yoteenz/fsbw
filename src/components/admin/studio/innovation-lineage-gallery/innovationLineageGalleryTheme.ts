/** Innovation Lineage Gallery™ — Museum Wing exhibit styles */

export const INNOVATION_LINEAGE_GALLERY_STYLES = `
body.innovation-lineage-gallery-active {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.lineage-gallery {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 45% at 50% 12%, rgba(232, 168, 76, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse 100% 70% at 50% 65%, #12100c 0%, #060504 55%, #020201 100%);
  color: #f0e6d8;
  font-family: "Futura PT", sans-serif;
  text-transform: uppercase;
}

.lineage-gallery * { box-sizing: border-box; text-transform: uppercase; }

.lineage-gallery__veins {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(135deg, transparent 48%, rgba(232,168,76,0.06) 49%, rgba(232,168,76,0.06) 51%, transparent 52%),
    linear-gradient(45deg, transparent 48%, rgba(201,169,98,0.04) 49%, rgba(201,169,98,0.04) 51%, transparent 52%);
  background-size: 80px 80px;
  opacity: 0.6;
}

.lineage-gallery__hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: max(10px, env(safe-area-inset-top)) 10px 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%);
}

.lineage-gallery__back {
  width: 32px; height: 32px;
  border: 1px solid rgba(232, 168, 76, 0.45);
  background: rgba(0,0,0,0.55);
  color: #e8c878;
  font-size: 14px;
  cursor: pointer;
}

.lineage-gallery__title-block { flex: 1; min-width: 0; }
.lineage-gallery__eyebrow { margin: 0; font-size: 6px; letter-spacing: 0.18em; color: #c9a962; }
.lineage-gallery__title {
  margin: 2px 0 0;
  font-family: "Covered By Your Grace", cursive;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #f0e6d8;
  text-transform: none;
}

.lineage-gallery__orb-badge {
  padding: 5px 8px;
  font-size: 5px;
  letter-spacing: 0.12em;
  border: 1px solid rgba(232, 168, 76, 0.4);
  color: #e8c878;
  background: rgba(0,0,0,0.5);
}

.lineage-gallery__stats {
  position: absolute;
  top: 52px;
  left: 8px;
  right: 8px;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.lineage-gallery__stat {
  padding: 8px 6px;
  border: 1px solid rgba(201, 169, 98, 0.25);
  background: rgba(0,0,0,0.45);
  text-align: center;
}

.lineage-gallery__stat-val {
  display: block;
  font-family: "Covered By Your Grace", cursive;
  font-size: 16px;
  color: #e8c878;
  text-transform: none;
}

.lineage-gallery__stat-label {
  display: block;
  margin-top: 2px;
  font-size: 5px;
  letter-spacing: 0.1em;
  color: rgba(240, 230, 216, 0.65);
}

.lineage-gallery__scroll {
  position: absolute;
  top: 118px;
  left: 8px;
  right: 8px;
  bottom: 100px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 10;
}

.lineage-gallery__section-title {
  margin: 0 0 6px;
  font-size: 6px;
  letter-spacing: 0.14em;
  color: #c9a962;
}

.lineage-gallery__exhibit-btn {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  padding: 10px;
  text-align: left;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(18, 14, 10, 0.75);
  color: #f0e6d8;
  cursor: pointer;
}

.lineage-gallery__exhibit-btn.is-active {
  border-color: #e8a84c;
  background: rgba(232, 168, 76, 0.12);
}

.lineage-gallery__exhibit-title {
  margin: 0 0 4px;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.lineage-gallery__exhibit-meta {
  margin: 0;
  font-size: 6px;
  color: rgba(240, 230, 216, 0.7);
  text-transform: none;
}

.lineage-gallery__timeline {
  margin: 8px 0;
  padding-left: 12px;
  border-left: 2px solid rgba(232, 168, 76, 0.35);
}

.lineage-gallery__timeline-step {
  position: relative;
  margin-bottom: 10px;
  padding-left: 8px;
}

.lineage-gallery__timeline-step::before {
  content: '';
  position: absolute;
  left: -17px;
  top: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e8a84c;
}

.lineage-gallery__step-label {
  margin: 0;
  font-size: 7px;
  letter-spacing: 0.06em;
  color: #f0e6d8;
}

.lineage-gallery__step-detail {
  margin: 2px 0 0;
  font-size: 6px;
  color: rgba(240, 230, 216, 0.65);
  text-transform: none;
  line-height: 1.4;
}

.lineage-gallery__equity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 8px;
}

.lineage-gallery__equity-cell {
  padding: 6px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  font-size: 5px;
  text-align: center;
}

.lineage-gallery__equity-val {
  display: block;
  font-family: "Covered By Your Grace", cursive;
  font-size: 12px;
  color: #e8c878;
  text-transform: none;
}

.lineage-gallery__historian {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 25;
  padding: 10px;
  border: 1px solid rgba(201, 169, 98, 0.3);
  background: rgba(0,0,0,0.82);
  font-size: 6px;
  line-height: 1.45;
  letter-spacing: 0.05em;
  color: rgba(232, 200, 120, 0.9);
  text-transform: none;
}

.lineage-gallery__footer-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.lineage-gallery__action-btn {
  flex: 1;
  padding: 8px;
  font-size: 5px;
  letter-spacing: 0.1em;
  border: 1px solid rgba(201, 169, 98, 0.35);
  background: rgba(201, 169, 98, 0.1);
  color: #e8c878;
  cursor: pointer;
}
`;
