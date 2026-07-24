import { useEffect, useState } from 'react';
import { FDS_BREAKPOINTS } from '../themes/defaultTheme';
import type { FdsBreakpoint } from '../tokens/types';

function resolveBreakpoint(width: number): FdsBreakpoint {
  if (width >= FDS_BREAKPOINTS['ultra-wide']) return 'ultra-wide';
  if (width >= FDS_BREAKPOINTS.desktop) return 'desktop';
  if (width >= FDS_BREAKPOINTS.laptop) return 'laptop';
  if (width >= FDS_BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

export function useBreakpoint(): FdsBreakpoint {
  const [bp, setBp] = useState<FdsBreakpoint>(() =>
    typeof window !== 'undefined' ? resolveBreakpoint(window.innerWidth) : 'mobile',
  );

  useEffect(() => {
    const onResize = () => setBp(resolveBreakpoint(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return bp;
}
