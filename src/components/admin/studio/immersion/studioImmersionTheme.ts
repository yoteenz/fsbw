/** Studio OS organizational immersion — shared ambient life · depth · microinteractions. */

export const SI_VISUAL = {
  champagne: '#92704A',
  champagneSoft: 'rgba(146,112,74,0.12)',
  glass: 'rgba(255,255,255,0.78)',
  glow: 'rgba(235,28,36,0.08)',
  live: '#059669',
  thinking: '#CA8A04',
  busy: '#2563EB',
} as const;

export const STUDIO_IMMERSION_CSS = `
@media (prefers-reduced-motion: reduce) {
  .studio-ambient-layer,
  .studio-ambient-layer *,
  .studio-living-panel,
  .studio-living-card,
  .studio-presence-dot,
  .studio-cinema-enter,
  .studio-activity-entry,
  .studio-progress-shimmer,
  .studio-glass-sheen::after {
    animation: none !important;
    transition: none !important;
  }
}

@keyframes studio-ambient-drift {
  0%, 100% { opacity: 0.35; transform: translate3d(0, 0, 0); }
  50% { opacity: 0.55; transform: translate3d(0, -4px, 0); }
}
@keyframes studio-daylight {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.65; }
}
@keyframes studio-panel-breathe {
  0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.75); }
  50% { box-shadow: 0 6px 28px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9); }
}
@keyframes studio-presence-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.88); }
}
@keyframes studio-fade-rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes studio-cinema-dim {
  from { filter: brightness(1.08); }
  to { filter: brightness(0.92); }
}
@keyframes studio-progress-shimmer {
  0% { background-position: -120% 0; }
  100% { background-position: 220% 0; }
}
@keyframes studio-glass-sheen-move {
  0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  40% { opacity: 0.12; }
  100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
}
@keyframes studio-particle-float {
  0%, 100% { transform: translate(0, 0); opacity: 0.15; }
  50% { transform: translate(6px, -10px); opacity: 0.35; }
}

.studio-ambient-layer { pointer-events: none; }
.studio-ambient-drift { animation: studio-ambient-drift 9s ease-in-out infinite; }
.studio-daylight-shift { animation: studio-daylight 14s ease-in-out infinite; }

.studio-living-panel {
  animation: studio-panel-breathe 8s ease-in-out infinite;
  transition: box-shadow 0.35s ease, transform 0.35s ease;
}
.studio-living-card {
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}
.studio-living-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.07);
}
.studio-glass-depth {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.82);
}
.studio-glass-sheen {
  position: relative;
  overflow: hidden;
}
.studio-glass-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%);
  animation: studio-glass-sheen-move 12s ease-in-out infinite;
  pointer-events: none;
}

.studio-presence-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  animation: studio-presence-pulse 2.4s ease-in-out infinite;
}
.studio-presence-dot--available { background: ${SI_VISUAL.live}; }
.studio-presence-dot--thinking { background: ${SI_VISUAL.thinking}; }
.studio-presence-dot--busy { background: ${SI_VISUAL.busy}; }
.studio-presence-dot--completed { background: ${SI_VISUAL.champagne}; opacity: 0.7; animation: none; }

.studio-activity-entry { animation: studio-fade-rise 0.55s ease-out both; }
.studio-wing-section { animation: studio-fade-rise 0.45s ease-out both; }

.studio-cinema-enter { animation: studio-cinema-dim 1.4s ease-out forwards; }

.studio-progress-shimmer {
  background: linear-gradient(90deg, rgba(14,165,233,0.2) 0%, rgba(56,189,248,0.55) 50%, rgba(14,165,233,0.2) 100%);
  background-size: 200% 100%;
  animation: studio-progress-shimmer 3s linear infinite;
}

.studio-room-headquarters .studio-ambient-warm { background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(146,112,74,0.14) 0%, transparent 70%); }
.studio-room-production-floor .studio-ambient-warm { background: radial-gradient(ellipse 85% 55% at 50% 10%, rgba(14,165,233,0.12) 0%, transparent 65%); }
.studio-room-cinema .studio-ambient-warm { background: radial-gradient(ellipse 90% 60% at 50% 30%, rgba(201,169,98,0.08) 0%, transparent 70%); }
.studio-room-editorial .studio-ambient-warm { background: radial-gradient(ellipse 85% 55% at 50% 15%, rgba(201,169,98,0.16) 0%, transparent 60%); }
.studio-room-publishing-wing .studio-ambient-warm { background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(235,28,36,0.06) 0%, transparent 70%); }

.studio-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(146,112,74,0.35);
  animation: studio-particle-float 11s ease-in-out infinite;
}
.studio-particle:nth-child(2) { animation-delay: -3s; left: 22%; top: 18%; }
.studio-particle:nth-child(3) { animation-delay: -6s; left: 78%; top: 24%; }
.studio-particle:nth-child(4) { animation-delay: -2s; left: 55%; top: 8%; }

.studio-moment-strip {
  border-left: 3px solid ${SI_VISUAL.champagne};
  background: ${SI_VISUAL.champagneSoft};
}

/* M82.5 — time-based ambient presence (subtle, no visual noise) */
.studio-time-morning .studio-daylight-shift { opacity: 0.55; }
.studio-time-afternoon .studio-daylight-shift { opacity: 0.5; }
.studio-time-evening .studio-daylight-shift { opacity: 0.42; filter: sepia(0.08); }
.studio-time-night .studio-daylight-shift { opacity: 0.32; filter: sepia(0.12); }
`;

export function presenceDotClass(state: string): string {
  return `studio-presence-dot studio-presence-dot--${state}`;
}
