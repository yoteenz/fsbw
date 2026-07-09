import { StudioBootGate } from '../studio-boot/StudioBootGate';

/** Experience Lab boots through StudioBootstrap — diagnostics only (no scene render). */
export function ExperienceLabWorkspace() {
  return (
    <StudioBootGate through="experience-runtime">
      {null}
    </StudioBootGate>
  );
}
