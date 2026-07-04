import { useEffect } from 'react';
import type { GuidedTourTransitionKind } from './types';

type Props = { kind: GuidedTourTransitionKind };

export function GuidedTourTransitionLayer({ kind }: Props) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      /* parent phase advances via navigation timing */
    }, 1400);
    return () => window.clearTimeout(t);
  }, [kind]);

  return <div className={`guided-tour-transition guided-tour-transition--${kind}`} aria-hidden />;
}
