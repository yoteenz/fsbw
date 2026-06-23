import { useSyncExternalStore } from 'react';
import { ParticleField } from './ParticleField';
import {
  getDesktopRoomParticleDensity,
  isDesktopRoomAmbientEffectsActive,
} from '../../utils/desktopRoomAmbientEffects';

function subscribeAmbient(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function getAmbientSnapshot(): boolean {
  return isDesktopRoomAmbientEffectsActive();
}

type Props = {
  active: boolean;
};

/** Vignette + floating crystal diamonds over desktop/tablet room heroes. */
export function DesktopRoomAmbientOverlay({ active }: Props) {
  const effectsEnabled = useSyncExternalStore(subscribeAmbient, getAmbientSnapshot, () => true);

  if (!active || !effectsEnabled) return null;

  return (
    <div className="desktop-zone-room-scene__ambient" aria-hidden>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.1) 100%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <ParticleField particleCount={getDesktopRoomParticleDensity()} />
      </div>
    </div>
  );
}
