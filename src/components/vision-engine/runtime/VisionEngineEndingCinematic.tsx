import { useEffect, useState } from 'react';
import { VISION_ENDING_HOLD_MS } from '../../../studio-os-core/vision-engine/constants';

type Props = { onComplete: () => void; logoText: string; endingTagline: string };

export function VisionEngineEndingCinematic({ onComplete, logoText, endingTagline }: Props) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'fade'>('logo');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('tagline'), 1200);
    const t2 = window.setTimeout(() => setPhase('fade'), 1200 + VISION_ENDING_HOLD_MS);
    const t3 = window.setTimeout(() => onComplete(), 1200 + VISION_ENDING_HOLD_MS + 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`vision-engine-cinematic vision-engine-cinematic--ending is-visible phase-${phase}`}>
      <div className="vision-engine-cinematic__vignette" />
      <div className="vision-engine-cinematic__logo-wrap is-visible">
        <p className="vision-engine-cinematic__logo">{logoText}</p>
        {phase !== 'logo' ? <p className="vision-engine-cinematic__finale">{endingTagline}</p> : null}
      </div>
    </div>
  );
}
