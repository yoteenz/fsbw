import { useMemo, useState, type ReactNode } from 'react';
import {
  createInitialPresenceState,
  createStudioWorldExperienceEngine,
  type ExperienceProfile,
  type PresenceEngineState,
} from '../../../../studio-os-core/studio-world-experience';
import { PROGRESSIVE_PRESENCE_STYLES } from '../progressive-presence';
import { GLOBAL_EXPERIENCE_STYLES } from './globalExperienceTheme';
import { StudioWorldExperienceContextProvider } from './StudioWorldExperienceContext';

type Props = {
  profile: ExperienceProfile;
  children: ReactNode;
};

/**
 * Global Experience System™ — every immersive department inherits this provider.
 * Departments declare Experience Profile metadata only; the engine owns behavior.
 */
export function StudioWorldExperienceProvider({ profile, children }: Props) {
  const [presenceState, setPresenceState] = useState<PresenceEngineState>(() =>
    createInitialPresenceState(profile)
  );

  const engine = useMemo(
    () => createStudioWorldExperienceEngine(profile, presenceState, setPresenceState),
    [profile, presenceState]
  );

  return (
    <StudioWorldExperienceContextProvider value={engine}>
      <style>{GLOBAL_EXPERIENCE_STYLES}</style>
      <style>{PROGRESSIVE_PRESENCE_STYLES}</style>
      {children}
    </StudioWorldExperienceContextProvider>
  );
}
