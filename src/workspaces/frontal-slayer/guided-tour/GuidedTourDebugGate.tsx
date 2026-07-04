import { useEffect, useState, type ReactNode } from 'react';
import { GUIDED_TOUR_CHANGED_EVENT } from './constants';
import { isGuidedTourPresentationActive } from './mode';

/** Hide mansion debug chrome while guided tour presentation is active. */
export function GuidedTourDebugGate({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(isGuidedTourPresentationActive());

  useEffect(() => {
    const sync = () => setHidden(isGuidedTourPresentationActive());
    window.addEventListener(GUIDED_TOUR_CHANGED_EVENT, sync);
    return () => window.removeEventListener(GUIDED_TOUR_CHANGED_EVENT, sync);
  }, []);

  if (hidden) return null;
  return <>{children}</>;
}
