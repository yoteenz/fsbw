import { useEffect, useState } from 'react';
import { VISION_OPENING_MS } from '../../../studio-os-core/vision-engine/constants';
import { VisionEngineOpeningBackdrop } from './VisionEngineOpeningBackdrop';

type Props = { onComplete: () => void; logoText: string; tagline: string };

export function VisionEngineOpeningCinematic({ onComplete, logoText, tagline }: Props) {
  const [visible, setVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setVisible(true), 120);
    const t2 = window.setTimeout(() => setLogoVisible(true), 2400);
    const t3 = window.setTimeout(() => onComplete(), VISION_OPENING_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`vision-engine-cinematic vision-engine-cinematic--opening ${visible ? 'is-visible' : ''}`}>
      <VisionEngineOpeningBackdrop />
      <div className="vision-engine-cinematic__vignette" />
      <div className={`vision-engine-cinematic__logo-wrap ${logoVisible ? 'is-visible' : ''}`}>
        <p className="vision-engine-cinematic__logo">{logoText}</p>
        <p className="vision-engine-cinematic__tagline">{tagline}</p>
      </div>
    </div>
  );
}
