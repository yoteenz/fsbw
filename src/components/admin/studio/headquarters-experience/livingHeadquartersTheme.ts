/** Living Headquarters™ environmental CSS — seasons, atmosphere, earned moments. */
export const LIVING_HQ_STYLES = `
.living-hq-root {
  position: relative;
  --lhq-warmth: 0;
  --lhq-daylight: 1;
  --lhq-crystal-glow: 0;
  transition: --lhq-warmth 1.2s ease, --lhq-daylight 1.2s ease;
}

.living-hq-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
}

/* Seasonal daylight */
.living-hq-root[data-lhq-season="winter"] {
  --lhq-daylight: 0.88;
}
.living-hq-root[data-lhq-season="spring"] {
  --lhq-daylight: 1.05;
}
.living-hq-root[data-lhq-season="summer"] {
  --lhq-daylight: 1.08;
}
.living-hq-root[data-lhq-season="autumn"] {
  --lhq-warmth: 0.15;
  --lhq-daylight: 0.96;
}

.living-hq-root[data-lhq-season="winter"] .hq-lobby-ambient {
  background:
    radial-gradient(ellipse 70% 45% at 15% 0%, rgba(220,235,255,0.55) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 90% 15%, rgba(180,200,230,0.08) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255,255,255,0.85) 0%, transparent 55%);
}
.living-hq-root[data-lhq-season="spring"] .hq-lobby-ambient {
  background:
    radial-gradient(ellipse 85% 55% at 25% 0%, rgba(255,255,255,0.95) 0%, transparent 58%),
    radial-gradient(ellipse 45% 35% at 80% 25%, rgba(120,180,120,0.06) 0%, transparent 50%);
}
.living-hq-root[data-lhq-season="summer"] .hq-lobby-ambient {
  background:
    radial-gradient(ellipse 90% 60% at 30% 0%, rgba(255,252,240,0.92) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 20%, rgba(235,28,36,0.05) 0%, transparent 48%);
}
.living-hq-root[data-lhq-season="autumn"] .hq-lobby-ambient {
  background:
    radial-gradient(ellipse 75% 50% at 20% 0%, rgba(255,248,235,0.9) 0%, transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 18%, rgba(146,112,74,0.1) 0%, transparent 50%);
}

/* Frost accent — winter windows */
.living-hq-root[data-lhq-frost="true"] .living-hq-atmosphere::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 28%),
    linear-gradient(225deg, rgba(230,240,255,0.25) 0%, transparent 22%);
  opacity: 0.45;
}

/* Floral accent — spring / celebration */
.living-hq-root[data-lhq-floral="true"] .living-hq-atmosphere::after {
  content: '';
  position: absolute;
  bottom: 8%;
  right: 6%;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,220,180,0.2) 0%, transparent 70%);
  animation: hq-ambient-float 10s ease-in-out infinite;
}

/* Celebration & anniversary warmth */
.living-hq-root[data-lhq-atmosphere="celebration"],
.living-hq-root[data-lhq-atmosphere="anniversary"],
.living-hq-root[data-lhq-atmosphere="launch-day"] {
  --lhq-warmth: 0.25;
  --lhq-crystal-glow: 1;
}
.living-hq-root[data-lhq-atmosphere="celebration"] .hq-lobby-ambient,
.living-hq-root[data-lhq-atmosphere="anniversary"] .hq-lobby-ambient {
  background:
    radial-gradient(ellipse 80% 50% at 25% 0%, rgba(255,250,245,0.95) 0%, transparent 58%),
    radial-gradient(ellipse 50% 40% at 85% 25%, rgba(235,28,36,0.08) 0%, transparent 50%);
}

.living-hq-root[data-lhq-crystal="true"] .hq-crystal-ring {
  filter: drop-shadow(0 0 8px rgba(235,28,36,0.15));
}

.living-hq-commemorative {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(146,112,74,0.2);
}
.living-hq-memory {
  margin-top: 8px;
  padding: 8px 12px;
  border-left: 2px solid rgba(146,112,74,0.45);
  background: rgba(255,255,255,0.35);
}

/* Legacy Wall™ — engraved marble */
.living-hq-legacy-wall {
  position: relative;
  padding: 16px 18px;
  border-radius: 10px;
  background:
    linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(245,242,238,0.88) 100%);
  border: 1px solid rgba(146,112,74,0.15);
  box-shadow: inset 0 2px 12px rgba(0,0,0,0.03);
}
.living-hq-legacy-engraving {
  position: relative;
  padding: 10px 0 10px 14px;
  border-left: 2px solid rgba(146,112,74,0.35);
}
.living-hq-legacy-engraving + .living-hq-legacy-engraving {
  margin-top: 6px;
}

/* Executive Collection™ */
.living-hq-collection {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: thin;
}
.living-hq-artifact {
  flex: 0 0 auto;
  min-width: 88px;
  text-align: center;
  padding: 10px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.85);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}
.living-hq-artifact-icon {
  font-size: 22px;
  line-height: 1;
  margin-bottom: 6px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
}
`;

export const ARTIFACT_ICONS: Record<string, string> = {
  'crystal-trophy': '◇',
  sculpture: '◆',
  award: '★',
  monument: '▣',
  'innovation-display': '◎',
  'founder-recognition': '◈',
};
