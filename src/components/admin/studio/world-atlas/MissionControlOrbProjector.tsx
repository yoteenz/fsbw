import type { OrbProjectionState } from '../../../../studio-os-core/mission-control';

type Props = {
  projection: OrbProjectionState;
  onSelectTarget?: (nodeId: string) => void;
};

export function MissionControlOrbProjector({ projection, onSelectTarget }: Props) {
  return (
    <div className="mc-orb-projector" aria-label="Orb projection system">
      <div className="mc-orb-projector__halo" aria-hidden />
      <p className="mc-orb-projector__accent">{projection.accentLine}</p>
      <div className="mc-orb-projector__beams" aria-hidden>
        {projection.beams.map((beam) => (
          <div
            key={beam.id}
            className={`mc-orb-projector__beam is-${beam.kind}`}
            style={{
              left: `${beam.mapX}%`,
              top: `${beam.mapY}%`,
              opacity: beam.intensity,
            }}
          />
        ))}
      </div>
      <div className="mc-orb-projector__cards">
        {projection.cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`mc-orb-projector__card is-${card.priority}`}
            style={{ left: `${card.mapX}%`, top: `${card.mapY}%` }}
            onClick={() => card.targetNodeId && onSelectTarget?.(card.targetNodeId)}
          >
            {card.message}
          </button>
        ))}
      </div>
    </div>
  );
}
