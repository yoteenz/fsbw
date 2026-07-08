import type { ReactNode } from 'react';
import { useStudioWorldExperienceOptional } from '../global-experience';
import type { PresenceController } from '../../../../studio-os-core/studio-world-experience';

type Props = {
  elementId: string;
  children: ReactNode;
  fallback?: ReactNode;
  /** Override for tests only — production uses Global Experience System™ context */
  presence?: PresenceController;
};

/** Gates children through Experience Engine™ Progressive Presence visibility. */
export function PresenceGated({ elementId, children, fallback = null, presence: presenceOverride }: Props) {
  const experience = useStudioWorldExperienceOptional();
  const presence = presenceOverride ?? experience?.presence;
  if (!presence?.isVisible(elementId)) return <>{fallback}</>;
  return <>{children}</>;
}
