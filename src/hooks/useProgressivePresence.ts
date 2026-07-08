import { useMemo, useState } from 'react';
import {
  createInitialPresenceState,
  createStudioWorldExperienceEngine,
  getExperienceProfile,
  type PresenceEngineState,
} from '../studio-os-core/studio-world-experience';

/**
 * @deprecated Prefer useStudioWorldExperience() inside StudioWorldExperienceProvider.
 * Standalone fallback for isolated tests — not for new department wiring.
 */
export function useProgressivePresence(roomId?: string) {
  const profile = useMemo(() => getExperienceProfile(roomId ?? 'studio-world'), [roomId]);
  const [presenceState, setPresenceState] = useState<PresenceEngineState>(() =>
    createInitialPresenceState(profile)
  );
  const engine = useMemo(
    () => createStudioWorldExperienceEngine(profile, presenceState, setPresenceState),
    [profile, presenceState]
  );
  return engine.presence;
}

export type ProgressivePresenceController = ReturnType<typeof useProgressivePresence>;
