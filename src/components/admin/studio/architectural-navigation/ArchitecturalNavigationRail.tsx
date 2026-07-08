import { useNavigate } from 'react-router-dom';
import { useGlobalAtlasLayerOptional } from '../global-atlas';
import {
  ATLAS_DESTINATION,
  PRIMARY_ARCHITECTURAL_DESTINATIONS,
  getDistrictIdentity,
  districtCssClass,
  type ArchitecturalContextualWing,
  type ArchitecturalFrameStatus,
  type ArchitecturalLocationStack,
  type DistrictThemeId,
} from '../../../../studio-os-core/architectural-navigation';
import type { ArchitecturalNavRailMode } from '../../../../studio-os-core/architectural-navigation';
import { districtForContextualWing } from '../../../../studio-os-core/living-architecture';
import type { LivingArchitectureSnapshot } from '../../../../studio-os-core/living-architecture';
import type { LivingDistrictEcologySnapshot } from '../../../../studio-os-core/living-district-ecology';
import { railWidthForMode } from '../../../../hooks/useArchitecturalNavigationRail';

type Props = {
  mode: ArchitecturalNavRailMode;
  districtThemeId: DistrictThemeId;
  location: ArchitecturalLocationStack;
  frameStatus: ArchitecturalFrameStatus;
  contextualWings: ArchitecturalContextualWing[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onCycleMode: () => void;
  showPrimaryDestinations?: boolean;
  livingArchitecture?: LivingArchitectureSnapshot | null;
  livingEcology?: LivingDistrictEcologySnapshot | null;
};

function EcologyHealthBlock({ ecology }: { ecology: LivingDistrictEcologySnapshot }) {
  const topMetrics = [...ecology.worldHealth]
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  return (
    <div className="sw-nav-rail__ecology-health" aria-label="World Health">
      <p className="sw-nav-rail__ecology-health-title">World Health™</p>
      {topMetrics.map((metric) => (
        <div key={metric.id} className="sw-nav-rail__health-row">
          <span>{metric.label.replace('™', '')}</span>
          <div className="sw-nav-rail__health-bar" aria-hidden>
            <div
              className={`sw-nav-rail__health-fill${metric.trend === 'rising' ? ' is-rising' : metric.trend === 'stagnant' ? ' is-stagnant' : ''}`}
              style={{ width: `${metric.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FrameStatusBlock({ status }: { status: ArchitecturalFrameStatus }) {
  const rows: Array<[string, string | undefined]> = [
    ['Ecosystem', status.ecosystemSummary],
    ['Campus', status.growthSummary],
    ['Generation', status.generationStatus],
    ['World Graph', status.worldGraphStatus],
    ['Orb', status.connectedOrb],
    ['Blueprint', status.blueprint],
    ['Workspace', status.workspace],
  ];

  return (
    <div className="sw-nav-rail__frame-status" aria-label="Frame status">
      {rows
        .filter(([, v]) => v)
        .map(([label, value]) => (
          <div key={label} className="sw-nav-rail__status-row">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
    </div>
  );
}

function LocationStack({ location }: { location: ArchitecturalLocationStack }) {
  return (
    <div className="sw-nav-rail__location" aria-label="You are here">
      <p className="sw-nav-rail__location-line is-headquarters">{location.headquarters}</p>
      {location.wing ? (
        <>
          <span className="sw-nav-rail__location-arrow" aria-hidden>
            ↓
          </span>
          <p className="sw-nav-rail__location-line is-wing">{location.wing}</p>
        </>
      ) : null}
      {location.room ? (
        <>
          <span className="sw-nav-rail__location-arrow" aria-hidden>
            ↓
          </span>
          <p className="sw-nav-rail__location-line is-room">{location.room}</p>
        </>
      ) : null}
    </div>
  );
}

/**
 * Architectural Navigation Rail™ — permanent campus signage, not a software sidebar.
 */
export function ArchitecturalNavigationRail({
  mode,
  districtThemeId,
  location,
  frameStatus,
  contextualWings,
  activeRoomId,
  onSelectRoom,
  onCycleMode,
  showPrimaryDestinations = false,
  livingArchitecture,
  livingEcology,
}: Props) {
  const navigate = useNavigate();
  const atlas = useGlobalAtlasLayerOptional();
  const district = getDistrictIdentity(districtThemeId);
  const districtClass = districtCssClass(districtThemeId);

  const railClass =
    mode === 'hidden'
      ? 'sw-nav-rail is-hidden'
      : mode === 'compact'
        ? 'sw-nav-rail is-compact'
        : 'sw-nav-rail is-expanded';

  if (mode === 'hidden') {
    return (
      <div className={districtClass}>
        <button
          type="button"
          className="sw-nav-rail__reveal"
          onClick={onCycleMode}
          aria-label="Reveal navigation rail"
          title="Navigation Rail"
        >
          NAV
        </button>
      </div>
    );
  }

  return (
    <div className={districtClass}>
      <nav
        className={railClass}
        aria-label={`Architectural Navigation Rail — ${district.campusName}`}
        style={{ width: railWidthForMode(mode) }}
      >
      <header className="sw-nav-rail__header">
        {mode === 'expanded' ? (
          <span className="sw-nav-rail__section-title" style={{ margin: 0 }}>
            Navigation Rail™
          </span>
        ) : null}
        <button
          type="button"
          className="sw-nav-rail__mode-btn"
          onClick={onCycleMode}
          aria-label="Cycle rail mode"
          title="Expanded · Compact · Hidden"
        >
          ≡
        </button>
      </header>

      <div className="sw-nav-rail__scroll">
        <button
          type="button"
          className="sw-nav-rail__atlas"
          onClick={() => (atlas ? atlas.toggleAtlas() : navigate(ATLAS_DESTINATION.path))}
          title="Studio World universal transportation"
        >
          <span className="sw-nav-rail__atlas-icon" aria-hidden>
            {ATLAS_DESTINATION.icon}
          </span>
          <span className="sw-nav-rail__atlas-label">{ATLAS_DESTINATION.label}</span>
        </button>

        <LocationStack location={location} />
        <FrameStatusBlock status={frameStatus} />

        <div className="sw-nav-rail__section">
          <p className="sw-nav-rail__section-title">Rooms in this Wing</p>
          {contextualWings.map((wing) => {
            const wingDistrict = districtForContextualWing(wing.id);
            const ecologyState = wingDistrict && livingEcology ? livingEcology.districts[wingDistrict] : undefined;
            const wingTier = ecologyState?.effectiveTier ?? (wingDistrict && livingArchitecture
                ? livingArchitecture.districts[wingDistrict]?.tier
                : undefined);
            const wingTierLabel =
              wingDistrict && livingArchitecture
                ? livingArchitecture.districts[wingDistrict]?.tierLabel
                : undefined;
            const hasSpillover = (ecologyState?.spilloverFrom.length ?? 0) > 0;

            return (
            <div key={wing.id} className="sw-nav-rail__wing">
              <p className="sw-nav-rail__wing-label">
                {wing.label}
                {wingTier !== undefined && wingTier > 0 ? (
                  <span
                    className={`sw-nav-rail__wing-tier${wingTier >= 2 ? ' is-growing' : ''}`}
                    title={`${wingTierLabel} — earned + ecology influence`}
                  >
                    T{wingTier}
                  </span>
                ) : null}
                {hasSpillover ? (
                  <span className="sw-nav-rail__wing-synergy is-spillover" title="Receiving cross-district influence">
                    ↗
                  </span>
                ) : null}
              </p>
              <ul className="sw-nav-rail__rooms">
                {wing.rooms.map((room) => {
                  const isActive = activeRoomId === room.id;
                  const label = mode === 'compact' ? room.shortLabel ?? room.label.slice(0, 3) : room.label;
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        className={`sw-nav-rail__room-btn${isActive ? ' is-active' : ''}`}
                        onClick={() => onSelectRoom(room.id)}
                        disabled={room.locked}
                        title={room.label}
                        aria-current={isActive ? 'location' : undefined}
                      >
                        <span className="sw-nav-rail__room-dot" aria-hidden>
                          •
                        </span>
                        <span className="sw-nav-rail__room-label">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </div>

        {showPrimaryDestinations ? (
          <div className="sw-nav-rail__section">
            <p className="sw-nav-rail__section-title">Campus Destinations</p>
            {PRIMARY_ARCHITECTURAL_DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                type="button"
                className="sw-nav-rail__dest-btn"
                onClick={() => navigate(dest.path)}
                title={dest.label}
              >
                <span className="sw-nav-rail__dest-icon" aria-hidden>
                  {dest.icon}
                </span>
                <span className="sw-nav-rail__dest-label">{dest.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {mode === 'expanded' ? (
          <>
            {livingEcology ? <EcologyHealthBlock ecology={livingEcology} /> : null}
            <footer className="sw-nav-rail__atmosphere" aria-label="Environmental identity">
              <p className="sw-nav-rail__atmosphere-feeling">{district.feeling}</p>
            </footer>
          </>
        ) : null}
      </div>
    </nav>
    </div>
  );
}
