import { useEffect, useState } from 'react';
import type { GuidedTourHotspot as Hotspot } from './types';

type Props = { hotspots: Hotspot[] };

/** Soft pulse once — guides attention without instructional chrome. */
export function GuidedTourHotspots({ hotspots }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2800);
    return () => window.clearTimeout(t);
  }, [hotspots]);

  if (!visible) return null;

  return (
    <div className="guided-tour-hotspots" aria-hidden>
      {hotspots.map((h) => (
        <div
          key={h.id}
          className="guided-tour-hotspot"
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
        >
          <span className="guided-tour-hotspot__pulse" />
          <span className="guided-tour-hotspot__label">{h.label}</span>
        </div>
      ))}
    </div>
  );
}
