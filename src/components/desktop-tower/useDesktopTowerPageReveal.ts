import { useEffect, useState, type CSSProperties } from 'react';

const ARRIVE_KEY = 'baw-desktop-tower-arrive';

export function markDesktopTowerArrival(): void {
  try {
    sessionStorage.setItem(ARRIVE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function useDesktopTowerPageReveal(): { pageStyle: CSSProperties } {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(ARRIVE_KEY);
  });

  useEffect(() => {
    if (!sessionStorage.getItem(ARRIVE_KEY)) {
      setRevealed(true);
      return;
    }
    sessionStorage.removeItem(ARRIVE_KEY);
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return {
    pageStyle: {
      opacity: revealed ? 1 : 0,
      transition: 'opacity 0.45s ease',
      willChange: 'opacity',
    },
  };
}
