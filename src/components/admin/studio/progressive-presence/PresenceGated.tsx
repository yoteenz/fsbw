import type { ReactNode } from 'react';
import type { ProgressivePresenceController } from '../../../../hooks/useProgressivePresence';

type Props = {
  elementId: string;
  presence: ProgressivePresenceController;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Gates children through Progressive Presence Engine™ visibility. */
export function PresenceGated({ elementId, presence, children, fallback = null }: Props) {
  if (!presence.isVisible(elementId)) return <>{fallback}</>;
  return <>{children}</>;
}
