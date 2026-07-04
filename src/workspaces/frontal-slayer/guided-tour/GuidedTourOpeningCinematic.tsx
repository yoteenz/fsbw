import { useEffect, useState } from 'react';
import { GUIDED_TOUR_OPENING_MS } from './constants';

type Props = { onComplete: () => void };

/** Fade from black · logo reveal · subtle drift — then hand off to tour. */
export function GuidedTourOpeningCinematic({ onComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setVisible(true), 120);
    const t2 = window.setTimeout(() => setLogoVisible(true), 1800);
    const t3 = window.setTimeout(() => onComplete(), GUIDED_TOUR_OPENING_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`guided-tour-cinematic guided-tour-cinematic--opening ${visible ? 'is-visible' : ''}`}>
      <div className="guided-tour-cinematic__vignette" />
      <div className={`guided-tour-cinematic__logo-wrap ${logoVisible ? 'is-visible' : ''}`}>
        <p className="guided-tour-cinematic__logo">FRONTAL SLAYER</p>
        <p className="guided-tour-cinematic__tagline">IMMERSIVE LUXURY BEAUTY</p>
      </div>
      <div className="guided-tour-cinematic__drift" aria-hidden />
    </div>
  );
}
