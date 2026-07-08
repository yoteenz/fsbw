import type { MissionControlMode, MissionControlTravelOption } from '../../../../studio-os-core/mission-control';

type Props = {
  missionModes: readonly MissionControlMode[];
  modeLabels: Record<MissionControlMode, string>;
  activeMode: MissionControlMode;
  onSelectMode: (mode: MissionControlMode) => void;
  travelOptions: readonly MissionControlTravelOption[];
  travelLabels: Record<MissionControlTravelOption, string>;
  activeTravel: MissionControlTravelOption;
  onSelectTravel: (option: MissionControlTravelOption) => void;
};

export function MissionControlHolographicNav({
  missionModes,
  modeLabels,
  activeMode,
  onSelectMode,
  travelOptions,
  travelLabels,
  activeTravel,
  onSelectTravel,
}: Props) {
  return (
    <div className="mc-holographic-nav" role="navigation" aria-label="Holographic civilization navigation">
      <div className="mc-holographic-nav__ring" aria-hidden />
      <div className="mc-holographic-nav__modes" role="tablist" aria-label="Visualization modes">
        {missionModes.map((mode, idx) => {
          const angle = (idx / missionModes.length) * 360;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={activeMode === mode}
              className={`mc-holographic-nav__mode${activeMode === mode ? ' is-active' : ''}`}
              style={{ transform: `rotate(${angle}deg) translateY(-118px) rotate(${-angle}deg)` }}
              onClick={() => onSelectMode(mode)}
            >
              {modeLabels[mode]}
            </button>
          );
        })}
      </div>
      <div className="mc-holographic-nav__travel" role="group" aria-label="Architectural travel">
        {travelOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`mc-holographic-nav__travel-pill${activeTravel === option ? ' is-active' : ''}`}
            onClick={() => onSelectTravel(option)}
          >
            {travelLabels[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
