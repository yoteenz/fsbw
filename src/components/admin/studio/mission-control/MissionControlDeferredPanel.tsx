import { useEffect, useRef, useState, type ReactNode } from 'react';

type MissionControlDeferredPanelProps = {
  children: ReactNode;
  /** Expand viewport so panels begin loading slightly before scroll reaches them. */
  rootMargin?: string;
};

/**
 * Defers mounting heavy Mission Control panels until they approach the viewport.
 * Avoids 40+ simultaneous store reads/syncs on initial Mission Control load.
 */
export function MissionControlDeferredPanel({
  children,
  rootMargin = '400px',
}: MissionControlDeferredPanelProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || visible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return <div ref={hostRef}>{visible ? children : null}</div>;
}
