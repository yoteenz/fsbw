import { StudioOrbProvider } from './StudioOrbProvider';
import { StudioOrbMount } from './StudioOrbMount';

/** Studio Orb™ system — replaces permanently visible Command Dock bar. */
export function StudioOrbShell() {
  return (
    <StudioOrbProvider>
      <StudioOrbMount />
    </StudioOrbProvider>
  );
}

export { StudioOrbProvider, useStudioOrb, useStudioOrbEnvironmentActive } from './StudioOrbProvider';
export { StudioOrbMount } from './StudioOrbMount';
