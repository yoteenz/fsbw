import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  findPsaMainCardElement,
  readPsaMainCardBounds,
  type PsaMainCardBounds,
} from '../utils/psaMainCardBounds';

export function usePsaMainCardBounds(active: boolean): PsaMainCardBounds | null {
  const { pathname } = useLocation();
  const [bounds, setBounds] = useState<PsaMainCardBounds | null>(() =>
    active ? readPsaMainCardBounds() : null
  );

  useLayoutEffect(() => {
    if (!active) {
      setBounds(null);
      return;
    }

    let cardEl = findPsaMainCardElement();

    const update = () => {
      setBounds(readPsaMainCardBounds());
    };

    update();

    const observer = new ResizeObserver(update);
    if (cardEl) observer.observe(cardEl);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    const cardPoll = window.setInterval(() => {
      const next = findPsaMainCardElement();
      if (next !== cardEl) {
        if (cardEl) observer.unobserve(cardEl);
        cardEl = next;
        if (cardEl) observer.observe(cardEl);
        update();
      }
    }, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.clearInterval(cardPoll);
    };
  }, [active, pathname]);

  return active ? bounds : null;
}
