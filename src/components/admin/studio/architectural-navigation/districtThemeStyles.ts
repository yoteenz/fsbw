/**
 * District Environmental Identity™ — thematic materials for Navigation Rail + Frame.
 * Layout identical · atmosphere evolves per district.
 */

export const DISTRICT_THEME_STYLES = `
/* ── Universal rail tokens (themed per district) ── */
.sw-nav-rail,
.sw-nav-rail__reveal,
.sw-frame-status-chip {
  --sw-rail-accent: #c9a962;
  --sw-rail-accent-dim: rgba(201, 169, 98, 0.55);
  --sw-rail-accent-glow: rgba(201, 169, 98, 0.12);
  --sw-rail-border: rgba(201, 169, 98, 0.28);
  --sw-rail-border-subtle: rgba(201, 169, 98, 0.12);
  --sw-rail-bg: linear-gradient(90deg, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.62) 88%, transparent 100%);
  --sw-rail-surface: rgba(0, 0, 0, 0.4);
  --sw-rail-text: rgba(245, 240, 232, 0.85);
  --sw-rail-text-muted: rgba(245, 240, 232, 0.65);
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(201, 169, 98, 0.12), rgba(0, 0, 0, 0.55));
  --sw-rail-texture: none;
  --sw-rail-glow: none;
}

/* ── WAREHOUSE · Industrial Design Campus™ ── */
.sw-district--warehouse .sw-nav-rail,
.sw-district--warehouse .sw-nav-rail__reveal {
  --sw-rail-accent: #b8c4d0;
  --sw-rail-accent-dim: rgba(168, 180, 192, 0.55);
  --sw-rail-accent-glow: rgba(140, 180, 220, 0.14);
  --sw-rail-border: rgba(168, 180, 192, 0.38);
  --sw-rail-border-subtle: rgba(120, 140, 160, 0.18);
  --sw-rail-bg: linear-gradient(92deg, rgba(18, 20, 24, 0.92) 0%, rgba(28, 30, 34, 0.78) 72%, transparent 100%);
  --sw-rail-surface: rgba(24, 28, 32, 0.55);
  --sw-rail-text: #e4e8ec;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(168, 180, 192, 0.14), rgba(18, 20, 24, 0.72));
  --sw-rail-texture:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 11px,
      rgba(100, 140, 180, 0.045) 11px,
      rgba(100, 140, 180, 0.045) 12px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 11px,
      rgba(100, 140, 180, 0.035) 11px,
      rgba(100, 140, 180, 0.035) 12px
    );
}

.sw-district--warehouse .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
  border-right-color: var(--sw-rail-border);
  box-shadow: inset -1px 0 0 rgba(200, 210, 220, 0.08);
}

.sw-district--warehouse .sw-nav-rail__room-btn.is-active {
  box-shadow: inset 0 0 12px rgba(140, 180, 220, 0.08);
}

/* ── MUSEUM · Innovation Museum™ ── */
.sw-district--museum .sw-nav-rail,
.sw-district--museum .sw-nav-rail__reveal {
  --sw-rail-accent: #c9a962;
  --sw-rail-accent-dim: rgba(201, 169, 98, 0.5);
  --sw-rail-accent-glow: rgba(201, 169, 98, 0.1);
  --sw-rail-border: rgba(201, 169, 98, 0.32);
  --sw-rail-border-subtle: rgba(201, 169, 98, 0.14);
  --sw-rail-bg: linear-gradient(92deg, rgba(28, 26, 24, 0.94) 0%, rgba(36, 34, 32, 0.82) 72%, transparent 100%);
  --sw-rail-surface: rgba(32, 30, 28, 0.5);
  --sw-rail-text: #f5f0e8;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(201, 169, 98, 0.16), rgba(28, 26, 24, 0.7));
  --sw-rail-texture: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245, 240, 232, 0.04) 0%, transparent 70%);
}

.sw-district--museum .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
  border-right-color: var(--sw-rail-border);
}

.sw-district--museum .sw-nav-rail__location {
  border-color: rgba(201, 169, 98, 0.22);
  background: rgba(245, 240, 232, 0.03);
}

/* ── KNOWLEDGE LIBRARY · Living Knowledge Archive™ ── */
.sw-district--knowledge-library .sw-nav-rail,
.sw-district--knowledge-library .sw-nav-rail__reveal {
  --sw-rail-accent: #d4a574;
  --sw-rail-accent-dim: rgba(212, 165, 116, 0.55);
  --sw-rail-accent-glow: rgba(212, 165, 116, 0.12);
  --sw-rail-border: rgba(180, 140, 100, 0.35);
  --sw-rail-border-subtle: rgba(140, 100, 70, 0.15);
  --sw-rail-bg: linear-gradient(92deg, rgba(22, 16, 12, 0.93) 0%, rgba(32, 24, 18, 0.8) 72%, transparent 100%);
  --sw-rail-surface: rgba(40, 28, 20, 0.48);
  --sw-rail-text: #f0e6dc;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(212, 165, 116, 0.14), rgba(22, 16, 12, 0.72));
  --sw-rail-texture: repeating-linear-gradient(
    180deg,
    transparent,
    transparent 24px,
    rgba(120, 80, 50, 0.04) 24px,
    rgba(120, 80, 50, 0.04) 25px
  );
}

.sw-district--knowledge-library .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
}

/* ── MARKETPLACE · Marketplace Pavilion™ ── */
.sw-district--marketplace .sw-nav-rail,
.sw-district--marketplace .sw-nav-rail__reveal {
  --sw-rail-accent: #e8c878;
  --sw-rail-accent-dim: rgba(232, 200, 120, 0.55);
  --sw-rail-accent-glow: rgba(232, 200, 120, 0.14);
  --sw-rail-border: rgba(232, 200, 120, 0.38);
  --sw-rail-border-subtle: rgba(200, 170, 100, 0.15);
  --sw-rail-bg: linear-gradient(92deg, rgba(16, 14, 10, 0.92) 0%, rgba(24, 20, 14, 0.78) 72%, transparent 100%);
  --sw-rail-surface: rgba(20, 18, 12, 0.52);
  --sw-rail-text: #faf6ee;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(232, 200, 120, 0.18), rgba(16, 14, 10, 0.7));
  --sw-rail-texture: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 40%);
}

.sw-district--marketplace .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
  box-shadow: inset -2px 0 16px rgba(232, 200, 120, 0.04);
}

/* ── CREATIVE DIRECTION · Creative Campus™ ── */
.sw-district--creative-direction .sw-nav-rail,
.sw-district--creative-direction .sw-nav-rail__reveal {
  --sw-rail-accent: #eb1c24;
  --sw-rail-accent-dim: rgba(235, 28, 36, 0.55);
  --sw-rail-accent-glow: rgba(235, 28, 36, 0.1);
  --sw-rail-border: rgba(235, 28, 36, 0.28);
  --sw-rail-border-subtle: rgba(235, 28, 36, 0.1);
  --sw-rail-bg: linear-gradient(92deg, rgba(248, 248, 248, 0.08) 0%, rgba(12, 12, 12, 0.88) 72%, transparent 100%);
  --sw-rail-surface: rgba(255, 255, 255, 0.04);
  --sw-rail-text: #f5f0e8;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(235, 28, 36, 0.12), rgba(12, 12, 12, 0.72));
}

/* ── COMMAND CENTER · Mission Control™ ── */
.sw-district--command-center .sw-nav-rail,
.sw-district--command-center .sw-nav-rail__reveal {
  --sw-rail-accent: #4ecdc4;
  --sw-rail-accent-dim: rgba(78, 205, 196, 0.55);
  --sw-rail-accent-glow: rgba(78, 205, 196, 0.1);
  --sw-rail-border: rgba(78, 205, 196, 0.28);
  --sw-rail-border-subtle: rgba(78, 205, 196, 0.1);
  --sw-rail-bg: linear-gradient(92deg, rgba(4, 6, 8, 0.96) 0%, rgba(8, 12, 16, 0.85) 72%, transparent 100%);
  --sw-rail-surface: rgba(0, 0, 0, 0.55);
  --sw-rail-text: #d8ece8;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(78, 205, 196, 0.12), rgba(4, 6, 8, 0.75));
  --sw-rail-texture: linear-gradient(180deg, rgba(78, 205, 196, 0.02) 0%, transparent 30%);
}

.sw-district--command-center .sw-nav-rail__status-row span:last-child {
  color: rgba(78, 205, 196, 0.85);
}

/* ── INNOVATION DISTRICT · Experimental Campus™ ── */
.sw-district--innovation-district .sw-nav-rail,
.sw-district--innovation-district .sw-nav-rail__reveal {
  --sw-rail-accent: #8ba4c4;
  --sw-rail-accent-dim: rgba(139, 164, 196, 0.55);
  --sw-rail-accent-glow: rgba(139, 164, 196, 0.14);
  --sw-rail-border: rgba(139, 164, 196, 0.35);
  --sw-rail-border-subtle: rgba(100, 130, 180, 0.12);
  --sw-rail-bg: linear-gradient(92deg, rgba(12, 16, 28, 0.94) 0%, rgba(16, 22, 36, 0.82) 72%, transparent 100%);
  --sw-rail-surface: rgba(16, 22, 36, 0.5);
  --sw-rail-text: #dce4f0;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(139, 164, 196, 0.16), rgba(12, 16, 28, 0.72));
  --sw-rail-texture: radial-gradient(circle at 20% 50%, rgba(139, 164, 196, 0.06) 0%, transparent 50%);
}

.sw-district--innovation-district .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
}

/* ── ATLAS · Transportation Hub™ ── */
.sw-district--atlas .sw-nav-rail,
.sw-district--atlas .sw-nav-rail__reveal {
  --sw-rail-accent: #a8b8ff;
  --sw-rail-accent-dim: rgba(168, 184, 255, 0.55);
  --sw-rail-accent-glow: rgba(168, 184, 255, 0.16);
  --sw-rail-border: rgba(168, 184, 255, 0.35);
  --sw-rail-border-subtle: rgba(120, 140, 220, 0.12);
  --sw-rail-bg: linear-gradient(92deg, rgba(8, 10, 24, 0.94) 0%, rgba(12, 16, 32, 0.82) 72%, transparent 100%);
  --sw-rail-surface: rgba(12, 16, 32, 0.52);
  --sw-rail-text: #e8ecff;
  --sw-rail-atlas-bg: linear-gradient(135deg, rgba(168, 184, 255, 0.22), rgba(8, 10, 24, 0.72));
  --sw-rail-texture: radial-gradient(ellipse 100% 60% at 50% 100%, rgba(168, 184, 255, 0.08) 0%, transparent 60%);
}

.sw-district--atlas .sw-nav-rail {
  background: var(--sw-rail-bg), var(--sw-rail-texture);
}

/* ── District frame + campus atmosphere hooks ── */
.sw-district--warehouse.wh-world {
  --wh-frame-border: 1px solid rgba(168, 180, 192, 0.22);
  --wh-accent: #b8c4d0;
}

.sw-district--museum.wh-world {
  --wh-frame-border: 1px solid rgba(201, 169, 98, 0.22);
  --wh-accent: #c9a962;
}

.sw-district--knowledge-library.wh-world {
  --wh-frame-border: 1px solid rgba(180, 140, 100, 0.22);
  --wh-accent: #d4a574;
}

.sw-district--marketplace.wh-world {
  --wh-frame-border: 1px solid rgba(232, 200, 120, 0.22);
  --wh-accent: #e8c878;
}

.sw-district--innovation-district.wh-world {
  --wh-frame-border: 1px solid rgba(139, 164, 196, 0.22);
  --wh-accent: #8ba4c4;
}

.sw-district--warehouse .wh-campus__frame {
  border-color: rgba(168, 180, 192, 0.22);
  background: rgba(18, 20, 24, 0.62);
}

.sw-district--museum .wh-campus__frame {
  border-color: rgba(201, 169, 98, 0.2);
  background: rgba(28, 26, 24, 0.58);
}

.sw-district--knowledge-library .wh-campus__frame {
  border-color: rgba(180, 140, 100, 0.2);
  background: rgba(22, 16, 12, 0.58);
}

.sw-district--marketplace .wh-campus__frame {
  border-color: rgba(232, 200, 120, 0.22);
  background: rgba(16, 14, 10, 0.58);
}

.sw-district--innovation-district .wh-campus__frame {
  border-color: rgba(139, 164, 196, 0.22);
  background: rgba(12, 16, 28, 0.58);
}

.sw-district--warehouse .wh-campus__stage-spotlight {
  background: radial-gradient(ellipse at 50% 30%, rgba(168, 180, 192, 0.16) 0%, transparent 68%);
}

.sw-district--museum .wh-campus__stage-spotlight {
  background: radial-gradient(ellipse at 50% 30%, rgba(201, 169, 98, 0.2) 0%, transparent 68%);
}

.sw-district--knowledge-library .wh-campus__stage-spotlight {
  background: radial-gradient(ellipse at 50% 30%, rgba(212, 165, 116, 0.18) 0%, transparent 68%);
}

.sw-district--marketplace .wh-campus__stage-spotlight {
  background: radial-gradient(ellipse at 50% 30%, rgba(232, 200, 120, 0.2) 0%, transparent 68%);
}

.sw-district--innovation-district .wh-campus__stage-spotlight {
  background: radial-gradient(ellipse at 50% 30%, rgba(139, 164, 196, 0.18) 0%, transparent 68%);
}

/* Environmental storytelling label (compact, rail footer) */
.sw-nav-rail__atmosphere {
  flex: 0 0 auto;
  padding: 6px;
  margin-top: 4px;
  border-top: 1px solid var(--sw-rail-border-subtle);
  overflow: hidden;
}

.sw-nav-rail__atmosphere-feeling {
  margin: 0;
  font-size: 3.5px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  opacity: 0.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sw-nav-rail.is-compact .sw-nav-rail__atmosphere {
  display: none;
}
`;
