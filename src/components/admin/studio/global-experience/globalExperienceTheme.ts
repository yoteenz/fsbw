import { experienceTokensAsCssVars } from '../../../../studio-os-core/studio-world-experience';

const cssVars = experienceTokensAsCssVars();
const varBlock = Object.entries(cssVars)
  .map(([k, v]) => `${k}: ${v};`)
  .join('\n  ');

/** Experience Tokens™ as global CSS variables — inherited by every Studio World room */
export const GLOBAL_EXPERIENCE_STYLES = `
:root {
  ${varBlock}
}

.gb-immersive-portal,
.wh-world,
.cds-stack,
.cds-genesis,
.scc-world {
  transition-duration: var(--sw-exp-layer-transition, 350ms);
}

.sw-world-health-ambient__panel {
  transition: opacity var(--sw-exp-reveal-speed, 280ms) ease-out,
    transform var(--sw-exp-reveal-speed, 280ms) ease-out;
}

.studio-scene-tray__btn {
  min-height: var(--sw-exp-scene-tray-touch, 32px);
}
`;
