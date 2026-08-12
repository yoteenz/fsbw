import { useEffect, useRef, useState, type ReactNode } from 'react';

export type ExploreFranchiseId =
  | 'trend-reports'
  | 'slay-forecast'
  | 'slay-cam'
  | 'product-reveals'
  | 'brand-films'
  | 'behind-brand'
  | 'the-archive';

type ExploreFranchiseSectionProps = {
  franchise: ExploreFranchiseId;
  ariaLabel: string;
  children: ReactNode;
};

/** Franchise zone wrapper — distinct transition + composition context per programming block. */
export function ExploreFranchiseSection({ franchise, ariaLabel, children }: ExploreFranchiseSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
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
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`lounge-tv-explore-franchise lounge-tv-explore-franchise--${franchise}${visible ? ' is-visible' : ''}`}
      data-franchise={franchise}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}
