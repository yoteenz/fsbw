import { StudioBootGate } from '../studio-boot/StudioBootGate';
import { ExperienceLabModeShell } from './ExperienceLabModeShell';
import { useEffect } from 'react';
import { emitStudioOsRuntimeEvent } from '../../../../studio-os/diagnostics/runtime-emit';

/** Experience Lab — dual-mode validation (runtime QA + creative intelligence preview). */
export function ExperienceLabWorkspace() {
  useEffect(() => {
    emitStudioOsRuntimeEvent('EXPERIENCE_LAB_STARTED', 'ExperienceLabWorkspace');
    return () => {
      emitStudioOsRuntimeEvent('EXPERIENCE_LAB_DESTROYED', 'ExperienceLabWorkspace');
    };
  }, []);

  return (
    <StudioBootGate through="experience-runtime" diagnosticsWhenReady={false}>
      <ExperienceLabModeShell />
    </StudioBootGate>
  );
}
