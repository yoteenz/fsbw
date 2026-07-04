import { useEffect, useState } from 'react';
import { GUIDED_TOUR_ENDING_HOLD_MS, GUIDED_TOUR_TAGLINE } from './constants';

type Props = { onComplete: () => void };

export function GuidedTourEndingCinematic({ onComplete }: Props) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'fade'>('logo');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('tagline'), 1200);
    const t2 = window.setTimeout(() => setPhase('fade'), 1200 + GUIDED_TOUR_ENDING_HOLD_MS);
    const t3 = window.setTimeout(() => onComplete(), 1200 + GUIDED_TOUR_ENDING_HOLD_MS + 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`guided-tour-cinematic guided-tour-cinematic--ending is-visible phase-${phase}`}>
      <div className="guided-tour-cinematic__vignette" />
      <div className="guided-tour-cinematic__logo-wrap is-visible">
        <p className="guided-tour-cinematic__logo">FRONTAL SLAYER</p>
        {phase !== 'logo' ? <p className="guided-tour-cinematic__finale">{GUIDED_TOUR_TAGLINE}</p> : null}
      </div>
    </div>
  );
}
