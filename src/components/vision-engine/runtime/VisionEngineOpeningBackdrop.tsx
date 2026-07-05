import { useMemo, type CSSProperties } from 'react';

type PetalSpec = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  width: number;
  height: number;
  blur: number;
  drift: number;
  rotate: number;
};

type FacetSpec = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
};

const PETAL_COUNT = 18;
const FACET_COUNT = 7;

function buildPetals(): PetalSpec[] {
  return Array.from({ length: PETAL_COUNT }, (_, id) => ({
    id,
    left: `${(id * 19 + 4) % 96}%`,
    delay: `${(id * 0.55) % 4.2}s`,
    duration: `${7.5 + (id % 6) * 1.1}s`,
    width: 10 + (id % 5) * 5,
    height: 14 + (id % 4) * 6,
    blur: 3 + (id % 4) * 2,
    drift: (id % 2 === 0 ? 1 : -1) * (18 + (id % 5) * 14),
    rotate: 25 + (id % 7) * 18,
  }));
}

function buildFacets(): FacetSpec[] {
  return Array.from({ length: FACET_COUNT }, (_, id) => ({
    id,
    left: `${8 + id * 13}%`,
    top: `${12 + (id % 4) * 18}%`,
    size: 28 + (id % 3) * 16,
    delay: `${id * 0.9}s`,
    duration: `${9 + (id % 3) * 2.5}s`,
  }));
}

export function VisionEngineOpeningBackdrop() {
  const petals = useMemo(buildPetals, []);
  const facets = useMemo(buildFacets, []);

  return (
    <div className="vision-engine-opening__backdrop" aria-hidden>
      <div className="vision-engine-opening__depth" />
      <div className="vision-engine-opening__rose-glow" />

      <div className="vision-engine-opening__petals">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="vision-engine-opening__petal"
            style={
              {
                left: petal.left,
                '--petal-w': `${petal.width}px`,
                '--petal-h': `${petal.height}px`,
                '--petal-blur': `${petal.blur}px`,
                '--petal-delay': petal.delay,
                '--petal-dur': petal.duration,
                '--petal-drift': `${petal.drift}px`,
                '--petal-rotate': `${petal.rotate}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="vision-engine-opening__glass">
        <div className="vision-engine-opening__light-sweep vision-engine-opening__light-sweep--a" />
        <div className="vision-engine-opening__light-sweep vision-engine-opening__light-sweep--b" />
        <div className="vision-engine-opening__light-sweep vision-engine-opening__light-sweep--c" />
        <div className="vision-engine-opening__acrylic-band" />
      </div>

      <div className="vision-engine-opening__facets">
        {facets.map((facet) => (
          <span
            key={facet.id}
            className="vision-engine-opening__facet"
            style={
              {
                left: facet.left,
                top: facet.top,
                width: `${facet.size}px`,
                height: `${facet.size}px`,
                animationDelay: facet.delay,
                animationDuration: facet.duration,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="vision-engine-opening__sparkle-field" />
    </div>
  );
}
