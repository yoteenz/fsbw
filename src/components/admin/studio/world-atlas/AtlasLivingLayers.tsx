/** Live Civilization™ — ambient motion embedded in the holographic projection */

type Props = {
  active: boolean;
  showTransit: boolean;
  showFog: boolean;
};

export function AtlasLivingLayers({ active, showTransit, showFog }: Props) {
  if (!active) return null;

  return (
    <div className="swa__living-layers" aria-hidden>
      <div className="swa__particle-field">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={`p-${i}`}
            className="swa__particle"
            style={{
              left: `${8 + ((i * 37) % 84)}%`,
              top: `${12 + ((i * 23) % 76)}%`,
              animationDelay: `${(i % 8) * 0.35}s`,
            }}
          />
        ))}
      </div>
      {showTransit ? (
        <div className="swa__energy-ribbons">
          <span className="swa__ribbon swa__ribbon--a" />
          <span className="swa__ribbon swa__ribbon--b" />
          <span className="swa__ribbon swa__ribbon--c" />
        </div>
      ) : null}
      {showFog ? (
        <>
          <div className="swa__crystal-fog swa__crystal-fog--nw" />
          <div className="swa__crystal-fog swa__crystal-fog--se" />
        </>
      ) : null}
      <div className="swa__elevation-lines" />
      <div className="swa__floor-projection-ring" />
    </div>
  );
}
