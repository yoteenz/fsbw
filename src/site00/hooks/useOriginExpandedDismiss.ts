import { useEffect } from 'react';
import type { HomeMode } from '../state/types';

const DESKTOP_EXPANDED_MQ = '(min-width: 768px)';

/** Desktop Origin — collapse IDNTY/BLDR expanded panel when pointer down occurs outside it. */
export function useOriginExpandedDismiss(homeMode: HomeMode, onCollapse: () => void) {
  useEffect(() => {
    if (homeMode === 'origin') return;

    const mq = window.matchMedia(DESKTOP_EXPANDED_MQ);
    if (!mq.matches) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const panel = document.querySelector('.site00-home-expanded-column');
      if (panel?.contains(target)) return;

      onCollapse();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [homeMode, onCollapse]);
}
