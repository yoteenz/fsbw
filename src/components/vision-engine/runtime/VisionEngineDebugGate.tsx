import { useEffect, useState, type ReactNode } from 'react';
import { VISION_CHANGED_EVENT } from '../../../studio-os-core/vision-engine/constants';
import { isVisionPresentationActive } from '../../../studio-os-core/vision-engine/session';

/** Hide mansion debug chrome while Vision Engine presentation is active. */
export function VisionEngineDebugGate({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(isVisionPresentationActive());

  useEffect(() => {
    const sync = () => setHidden(isVisionPresentationActive());
    window.addEventListener(VISION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(VISION_CHANGED_EVENT, sync);
  }, []);

  if (hidden) return null;
  return <>{children}</>;
}
