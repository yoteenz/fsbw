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
import type { LivingCivilizationSnapshot } from '../../../../studio-os-core/living-civilization';
import type { CivilizationEventsSnapshot } from '../../../../studio-os-core/civilization-events';
import { railWidthForMode } from '../../../../hooks/useArchitecturalNavigationRail';
import { useProgressivePresence } from '../../../../hooks/useProgressivePresence';
import { PresenceGated, WorldHealthAmbientIndicator, PROGRESSIVE_PRESENCE_STYLES } from '../progressive-presence';

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
  livingCivilization?: LivingCivilizationSnapshot | null;
  civilizationEvents?: CivilizationEventsSnapshot | null;
  roomId?: string;
};

function FrameStatusBlock({ status }: { status: ArchitecturalFrameStatus }) {
  const rows: Array<[string, string | undefined]> = [
    ['Events', status.eventsSummary],
    ['Civilization', status.civilizationSummary],
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

function LocationStack({
  location,
  showRoomDetail,
}: {
  location: ArchitecturalLocationStack;
  showRoomDetail: boolean;
}) {
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
      {showRoomDetail && location.room ? (
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
 * Architectural Navigation Rail™ — navigation only (Article K18 Progressive Presence™).
 * Operational dashboards defer to Orb, tap intent, and Scene Tray™.
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
  livingArchitecture: _livingArchitecture,
  livingEcology,
  livingCivilization,
  civilizationEvents: _civilizationEvents,
  roomId = 'studio-archives',
}: Props) {
  const navigate = useNavigate();
  const atlas = useGlobalAtlasLayerOptional();
  const presence = useProgressivePresence(roomId);
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
        <style>{PROGRESSIVE_PRESENCE_STYLES}</style>
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

  const showRoomDetail = presence.isVisible('nav-rail-room-detail');

  return (
    <div className={districtClass}>
      <style>{PROGRESSIVE_PRESENCE_STYLES}</style>
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

        <PresenceGated elementId="nav-rail-location" presence={presence}>
          <LocationStack location={location} showRoomDetail={showRoomDetail} />
        </PresenceGated>

        <PresenceGated elementId="nav-rail-frame-status" presence={presence}>
          <FrameStatusBlock status={frameStatus} />
        </PresenceGated>

        <div className="sw-nav-rail__section">
          <p className="sw-nav-rail__section-title">Architectural Destinations™</p>
          {contextualWings.map((wing) => {
            const wingDistrict = districtForContextualWing(wing.id);
            const ecologyState = wingDistrict && livingEcology ? livingEcology.districts[wingDistrict] : undefined;
            const wingTier = ecologyState?.effectiveTier;
            const wingTierLabel =
              wingDistrict && _livingArchitecture
                ? _livingArchitecture.districts[wingDistrict]?.tierLabel
                : undefined;
            const hasSpillover = (ecologyState?.spilloverFrom.length ?? 0) > 0;
            const showTierBadges = presence.isVisible('nav-rail-wing-tier-badges');

            return (
            <div key={wing.id} className="sw-nav-rail__wing">
              <p className="sw-nav-rail__wing-label">
                {wing.label}
                {showTierBadges && wingTier !== undefined && wingTier > 0 ? (
                  <span
                    className={`sw-nav-rail__wing-tier${wingTier >= 2 ? ' is-growing' : ''}`}
                    title={`${wingTierLabel} — earned + ecology influence`}
                  >
                    T{wingTier}
                  </span>
                ) : null}
                {showTierBadges && hasSpillover ? (
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
          <PresenceGated elementId="nav-rail-campus-destinations" presence={presence}>
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
          </PresenceGated>
        ) : null}

        {mode === 'expanded' ? (
          <>
            <WorldHealthAmbientIndicator
              ecology={livingEcology}
              civilization={livingCivilization}
              presence={presence}
            />
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
