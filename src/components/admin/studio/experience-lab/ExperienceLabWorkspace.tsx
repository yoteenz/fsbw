import { StudioBootGate } from '../studio-boot/StudioBootGate';
import { ExperienceLabModeShell } from './ExperienceLabModeShell';

/** Experience Lab — dual-mode validation (runtime QA + creative intelligence preview). */
export function ExperienceLabWorkspace() {
  return (
    <StudioBootGate through="experience-runtime" diagnosticsWhenReady={false}>
      <ExperienceLabModeShell />
    </StudioBootGate>
  );
}
