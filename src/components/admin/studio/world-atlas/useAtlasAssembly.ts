import { useEffect, useState } from 'react';

/** The World Assembles™ — staged holographic reveal sequence */
export const ATLAS_ASSEMBLY_PHASES = [
  'orb',
  'beam',
  'grid',
  'terrain',
  'foundations',
  'buildings',
  'roads',
  'transit',
  'labels',
  'overlays',
  'collaborators',
  'alive',
] as const;

export type AtlasAssemblyPhase = (typeof ATLAS_ASSEMBLY_PHASES)[number];

const PHASE_DELAYS_MS: Record<AtlasAssemblyPhase, number> = {
  orb: 0,
  beam: 320,
  grid: 680,
  terrain: 1100,
  foundations: 1550,
  buildings: 2100,
  roads: 2700,
  transit: 3300,
  labels: 3900,
  overlays: 4500,
  collaborators: 5100,
  alive: 5800,
};

export function useAtlasAssembly() {
  const [phase, setPhase] = useState<AtlasAssemblyPhase>('orb');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timers = ATLAS_ASSEMBLY_PHASES.map((p) =>
      window.setTimeout(() => {
        setPhase(p);
        if (p === 'alive') setComplete(true);
      }, PHASE_DELAYS_MS[p])
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const phaseIndex = ATLAS_ASSEMBLY_PHASES.indexOf(phase);

  return { phase, phaseIndex, complete, isAlive: complete };
}
