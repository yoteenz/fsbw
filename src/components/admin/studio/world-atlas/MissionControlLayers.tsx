import type { ConstellationStar, MissionControlActivationState, WorldHealthSignal } from '../../../../studio-os-core/mission-control';

type Props = {
  activation: MissionControlActivationState;
  navigationReady: boolean;
  constellationStars: ConstellationStar[];
  worldHealth: WorldHealthSignal[];
  modeTableClass: string;
  modeAmbientClass: string;
};

export function MissionControlLayers({
  activation,
  navigationReady,
  constellationStars,
  worldHealth,
  modeTableClass,
  modeAmbientClass,
}: Props) {
  const phase = activation.phase;

  return (
    <>
      <div
        className={`mc-room-darken${navigationReady ? ' is-ready' : ''}${phase === 'darkening' ? ' is-active' : ''}`}
        aria-hidden
      />
      <div className={`mc-ambient ${modeAmbientClass}`} aria-hidden />
      <div className={`mc-beam${phase === 'light-beam' || !navigationReady ? ' is-active' : ''}`} aria-hidden />
      <div
        className={`mc-particles${phase === 'glass-particles' || phase === 'light-ribbons' ? ' is-active' : ' is-idle'}`}
        aria-hidden
      />
      <div
        className={`mc-ribbons${phase === 'light-ribbons' || phase === 'holographic-grid' ? ' is-active' : ''}`}
        aria-hidden
      />

      {!navigationReady ? (
        <div className="mc-activation-hud" aria-live="polite">
          <p className="mc-activation-eyebrow">ACTIVATION SEQUENCE™</p>
          <p className="mc-activation-title">Mission Control™</p>
          <div className="mc-activation-bar">
            <div className="mc-activation-fill" style={{ width: `${activation.progress}%` }} />
          </div>
          <p className="mc-activation-phase">{activation.progress}%</p>
        </div>
      ) : null}

      <div className={`mc-atlas-table-ring ${modeTableClass}`} aria-hidden />
      <div className="mc-living-particles" aria-hidden />

      {navigationReady ? (
        <div className="mc-constellation-layer" aria-hidden>
          {constellationStars.map((star) => (
            <div
              key={star.id}
              className={`mc-constellation-star${star.headquarters ? ' is-hq' : ''}`}
              style={{
                left: `${star.mapX}%`,
                top: `${star.mapY}%`,
                opacity: star.brightness / 100,
              }}
            >
              <span className="mc-constellation-core" />
              {star.orbitCount > 0 ? (
                <span
                  className="mc-constellation-orbit"
                  style={{ width: 8 + star.orbitCount * 3, height: 8 + star.orbitCount * 3 }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {navigationReady
        ? worldHealth
            .filter((s) => s.health === 'opportunity' || s.health === 'strained')
            .slice(0, 6)
            .map((s) => (
              <div
                key={s.nodeId}
                className={`mc-health-whisper mc-health-${s.health}`}
                style={{ opacity: s.glowIntensity / 100 }}
                aria-hidden
              />
            ))
        : null}
    </>
  );
}
