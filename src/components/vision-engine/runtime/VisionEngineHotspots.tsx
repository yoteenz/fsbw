import { useEffect, useState } from 'react';
import type { VisionHotspot } from '../../../studio-os-core/vision-engine/types';

type Props = { hotspots: VisionHotspot[] };

export function VisionEngineHotspots({ hotspots }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2800);
    return () => window.clearTimeout(t);
  }, [hotspots]);

  if (!visible) return null;

  return (
    <div className="vision-engine-hotspots" aria-hidden>
      {hotspots.map((h) => (
        <div key={h.id} className="vision-engine-hotspot" style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}>
          <span className="vision-engine-hotspot__pulse" />
          <span className="vision-engine-hotspot__label">{h.label}</span>
        </div>
      ))}
    </div>
  );
}
