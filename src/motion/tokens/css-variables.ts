/**
 * FSMS CSS custom properties — inject once on document root or a container.
 */

export const FSMS_CSS_VARS = {
  '--fsms-brand-red': '#EB1C24',
  '--fsms-crystal-edge': 'rgba(255, 255, 255, 0.92)',
  '--fsms-crystal-core': 'rgba(255, 255, 255, 0.55)',
  '--fsms-crystal-shadow': 'rgba(15, 20, 28, 0.08)',
  '--fsms-crystal-specular': 'rgba(255, 255, 255, 0.95)',
  '--fsms-crystal-refract-a': 'rgba(200, 230, 255, 0.35)',
  '--fsms-crystal-refract-b': 'rgba(255, 248, 240, 0.28)',
  '--fsms-bloom': 'rgba(255, 255, 255, 0.35)',
  '--fsms-sweep-highlight': 'rgba(255, 255, 255, 0.85)',
  '--fsms-font-display': 'clamp(2rem, 8vw, 4.5rem)',
  '--fsms-font-title': 'clamp(1.5rem, 5vw, 3rem)',
  '--fsms-font-subtitle': 'clamp(1rem, 3vw, 1.75rem)',
  '--fsms-font-logo': 'clamp(2.25rem, 10vw, 5rem)',
  '--fsms-ease-luxury': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  '--fsms-ease-dissolve': 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export function applyFsmsCssVariables(el: HTMLElement = document.documentElement): void {
  Object.entries(FSMS_CSS_VARS).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}
