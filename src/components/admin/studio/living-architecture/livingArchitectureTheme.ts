/** Living Architecture™ — tier evolution, construction pulse, milestone monuments */

export const LIVING_ARCHITECTURE_STYLES = `
/* ── Campus tier data attributes ── */
.wh-world[data-living-tier] {
  --sw-living-intensity: calc(var(--sw-living-tier, 0) * 0.18);
}

.wh-world[data-living-tier="1"] { --sw-living-tier: 1; }
.wh-world[data-living-tier="2"] { --sw-living-tier: 2; }
.wh-world[data-living-tier="3"] { --sw-living-tier: 3; }
.wh-world[data-living-tier="4"] { --sw-living-tier: 4; }

/* District-specific tier atmospheres */
.wh-world.sw-living--warehouse-tier-1::after,
.wh-world.sw-living--warehouse-tier-2::after,
.wh-world.sw-living--warehouse-tier-3::after,
.wh-world.sw-living--warehouse-tier-4::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background:
    radial-gradient(ellipse 40% 30% at 72% 68%, rgba(201, 169, 98, calc(0.06 + var(--sw-living-intensity, 0))), transparent 70%),
    linear-gradient(180deg, transparent 60%, rgba(201, 169, 98, calc(0.03 + var(--sw-living-intensity, 0) * 0.5)) 100%);
}

.wh-world.sw-living--museum-tier-1::after,
.wh-world.sw-living--museum-tier-2::after,
.wh-world.sw-living--museum-tier-3::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(ellipse 50% 40% at 28% 55%, rgba(155, 123, 184, calc(0.05 + var(--sw-living-intensity, 0))), transparent 72%);
}

.wh-world.sw-living--knowledge-library-tier-1::after,
.wh-world.sw-living--knowledge-library-tier-2::after,
.wh-world.sw-living--knowledge-library-tier-3::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(ellipse 45% 35% at 18% 42%, rgba(184, 212, 168, calc(0.05 + var(--sw-living-intensity, 0))), transparent 70%);
}

.wh-world.sw-living--marketplace-tier-1::after,
.wh-world.sw-living--marketplace-tier-2::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(ellipse 38% 32% at 82% 38%, rgba(232, 200, 120, calc(0.06 + var(--sw-living-intensity, 0))), transparent 68%);
}

.wh-world.sw-living--innovation-district-tier-1::after,
.wh-world.sw-living--innovation-district-tier-2::after,
.wh-world.sw-living--innovation-district-tier-3::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(ellipse 42% 38% at 55% 30%, rgba(139, 164, 196, calc(0.06 + var(--sw-living-intensity, 0))), transparent 70%);
}

/* ── Living Architecture overlay layer ── */
.sw-living-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 24;
}

.sw-living-layer__skyline {
  position: absolute;
  top: calc(var(--wh-frame-hud-h, 48px) + 4px);
  right: max(8px, env(safe-area-inset-right));
  max-width: min(280px, 38vw);
  padding: 6px 10px;
  border: 1px solid rgba(201, 169, 98, 0.28);
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);
  font-size: 8px;
  line-height: 1.45;
  letter-spacing: 0.06em;
  color: rgba(212, 196, 160, 0.92);
  text-transform: uppercase;
}

.sw-living-layer__construction {
  position: absolute;
  left: 50%;
  top: calc(var(--wh-frame-hud-h, 48px) + 8px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid rgba(139, 164, 196, 0.45);
  background: rgba(0, 0, 0, 0.72);
  font-size: 8px;
  letter-spacing: 0.08em;
  color: #8ba4c4;
  text-transform: uppercase;
  animation: sw-living-pulse 2.4s ease-in-out infinite;
}

.sw-living-layer__construction-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8ba4c4;
  box-shadow: 0 0 8px rgba(139, 164, 196, 0.8);
}

@keyframes sw-living-pulse {
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
}

.sw-living-layer__monument {
  position: absolute;
  left: calc(var(--sw-rail-w, 168px) + 12px);
  bottom: calc(var(--wh-frame-teach-h, 56px) + 12px);
  max-width: min(320px, 42vw);
  padding: 10px 12px;
  border-left: 3px solid var(--sw-rail-accent, #c9a962);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.45) 100%);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

.sw-living-layer__monument-label {
  margin: 0 0 4px;
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sw-rail-accent, #c9a962);
}

.sw-living-layer__monument-title {
  margin: 0 0 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.04em;
}

.sw-living-layer__monument-cause {
  margin: 0;
  font-size: 8px;
  line-height: 1.5;
  color: rgba(212, 196, 160, 0.78);
}

/* ── Rail growth badges ── */
.sw-nav-rail__wing-tier {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  padding: 1px 4px;
  border: 1px solid var(--sw-rail-accent-dim, rgba(201, 169, 98, 0.35));
  font-size: 7px;
  letter-spacing: 0.06em;
  color: var(--sw-rail-accent);
  text-transform: uppercase;
  vertical-align: middle;
}

.sw-nav-rail__wing-tier.is-growing {
  animation: sw-living-pulse 3s ease-in-out infinite;
}

/* ── Expansion bays (Prototype Vault / Future Expansion) ── */
.wh-expansion__frames.is-tier-1 .wh-expansion__frame:nth-child(3),
.wh-expansion__frames.is-tier-2 .wh-expansion__frame:nth-child(3),
.wh-expansion__frames.is-tier-2 .wh-expansion__frame:nth-child(4),
.wh-expansion__frames.is-tier-3 .wh-expansion__frame:nth-child(3),
.wh-expansion__frames.is-tier-3 .wh-expansion__frame:nth-child(4),
.wh-expansion__frames.is-tier-3 .wh-expansion__frame:nth-child(5),
.wh-expansion__frames.is-tier-4 .wh-expansion__frame {
  opacity: 1;
  border-color: rgba(201, 169, 98, 0.55);
  box-shadow: inset 0 0 24px rgba(201, 169, 98, 0.12);
}

.wh-expansion__frames {
  flex-wrap: wrap;
}

.wh-expansion__frames.is-tier-1 .wh-expansion__frame:nth-child(3),
.wh-expansion__frames.is-tier-2 .wh-expansion__frame:nth-child(4),
.wh-expansion__frames.is-tier-3 .wh-expansion__frame:nth-child(5) {
  opacity: 1;
}

.wh-expansion__frame--commissioned {
  opacity: 1 !important;
  border-color: rgba(139, 164, 196, 0.6) !important;
  position: relative;
}

.wh-expansion__frame--commissioned::after {
  content: 'COMMISSIONED';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 6px;
  letter-spacing: 0.1em;
  color: #8ba4c4;
}

.wh-innovation__pod.is-unlocked {
  border-color: rgba(139, 164, 196, 0.55);
}

.wh-innovation__pod.is-unlocked .wh-innovation__pod-status {
  color: #8ba4c4;
}
`;
