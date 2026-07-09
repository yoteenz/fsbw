import { RuntimeSafeMode } from './RuntimeSafeMode';

/** Scene rendering disabled — Runtime Safe Mode diagnostics only until boot is stable. */
export function ExperienceLabWorkspace() {
  return <RuntimeSafeMode />;
}
