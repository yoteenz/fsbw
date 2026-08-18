import { useEffect, useState } from 'react';

/** Pick status strip layout: desktop artboard + wide viewports use desktop; phone /origin uses mobile. */
export function useOriginStatusStripLayout(isDesktopArtboardRoute: boolean): 'desktop' | 'mobile' {
  const [mobileViewport, setMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    if (isDesktopArtboardRoute) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMobileViewport(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [isDesktopArtboardRoute]);

  if (isDesktopArtboardRoute) return 'desktop';
  return mobileViewport ? 'mobile' : 'desktop';
}
