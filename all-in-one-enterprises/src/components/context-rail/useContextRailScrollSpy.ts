import { useEffect, useState } from 'react';
import type { ContextRailItem } from './types';

/** Lightweight section highlight for scroll-target rail items. */
export function useContextRailScrollSpy(items: ContextRailItem[] | undefined, enabled: boolean) {
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled || !items?.length) return;

    const targets = items
      .filter((i) => i.scrollTarget)
      .map((i) => document.getElementById(i.scrollTarget!))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          const match = items.find((i) => i.scrollTarget === visible.target.id);
          if (match) setActiveId(match.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled, items]);

  return activeId;
}
