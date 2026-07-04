import { useEffect } from 'react';
import type { VisionTransitionKind } from '../../../studio-os-core/vision-engine/types';

type Props = { kind: VisionTransitionKind };

export function VisionEngineTransitionLayer({ kind }: Props) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      /* parent phase advances via navigation timing */
    }, 1400);
    return () => window.clearTimeout(t);
  }, [kind]);

  return <div className={`vision-engine-transition vision-engine-transition--${kind}`} aria-hidden />;
}
