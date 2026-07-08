import type { ReactNode } from 'react';
import type { AtlasAssemblyPhase } from './useAtlasAssembly';
import { AtlasLivingLayers } from './AtlasLivingLayers';

type Props = {
  phase: AtlasAssemblyPhase;
  alive: boolean;
  children: ReactNode;
};

/**
 * Atlas Spatial Experience™ — room dims, Orb projects, marble becomes holographic surface.
 * Wraps the living world model; no dashboard panels live here.
 */
export function AtlasSpatialShell({ phase, alive, children }: Props) {
  const phaseClass = `is-assembly-${phase}`;

  return (
    <div className={`swa__spatial-shell ${phaseClass}${alive ? ' is-assembly-alive' : ''}`}>
      <div className="swa__ambient-veil" aria-hidden />
      <div className="swa__marble-floor" aria-hidden />
      <div className="swa__orb-projector" aria-hidden>
        <div className="swa__orb-projector-sphere" />
        <div className="swa__projection-beam" />
        <div className="swa__projection-splash" />
      </div>
      <AtlasLivingLayers active={alive} showTransit={phase !== 'orb' && phase !== 'beam'} showFog />
      <div className="swa__spatial-content">{children}</div>
    </div>
  );
}
