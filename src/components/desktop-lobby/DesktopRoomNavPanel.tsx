import { useMemo, useState } from 'react';
import { DESKTOP_LOBBY_PANORAMA_ROOMS } from '../../constants/desktopLobbyPanorama';
import {
  getDirectoryRoomCode,
  getDirectoryRoomStatus,
  resolveRoomTravelDirection,
  roomIndexToConnectorRatio,
} from '../../constants/desktopRoomDirectory';
import './DesktopRoomDirectory.css';

type DesktopRoomNavPanelProps = {
  roomIndex: number;
  onRoomSelect: (index: number) => void;
};

export function DesktopRoomNavPanel({ roomIndex, onRoomSelect }: DesktopRoomNavPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pulseDirection, setPulseDirection] = useState<'left' | 'right' | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const roomCount = DESKTOP_LOBBY_PANORAMA_ROOMS.length;

  const connectorGlowLeft = useMemo(() => {
    const index = pendingIndex ?? roomIndex;
    const ratio = roomIndexToConnectorRatio(index, roomCount);
    const inset = 14;
    const span = 100 - inset * 2;
    return `${inset + ratio * span}%`;
  }, [pendingIndex, roomCount, roomIndex]);

  const connectorPulseClass = pulseDirection
    ? pulseDirection === 'right'
      ? 'room-directory__connector-pulse--right'
      : 'room-directory__connector-pulse--left'
    : '';

  const handleSelect = (index: number) => {
    if (index === roomIndex) return;

    const direction = resolveRoomTravelDirection(roomIndex, index);
    if (direction) {
      setPulseDirection(direction);
      setPulseKey((k) => k + 1);
    }

    setPendingIndex(index);
    onRoomSelect(index);
    window.setTimeout(() => {
      setPendingIndex(null);
      setPulseDirection(null);
    }, 900);
  };

  return (
    <div
      className="room-directory"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'clamp(16px, 2.5vh, 32px)',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
      aria-label="Penthouse destination directory"
    >
      <div className="room-directory__marble-base" aria-hidden />
      <div className="room-directory__frame">
        <div className="room-directory__chrome-cap" aria-hidden />
        <div className="room-directory__crystal-edge" aria-hidden />

        <header className="room-directory__header">
          <div className="room-directory__header-label">Frontal Slayer</div>
          <div className="room-directory__header-title">Destination directory</div>
        </header>

        <div className="room-directory__row">
          <div className="room-directory__connector" aria-hidden>
            {pulseDirection ? (
              <div key={pulseKey} className={`room-directory__connector-pulse ${connectorPulseClass}`} />
            ) : null}
          </div>
          <div
            className={`room-directory__connector-glow ${pendingIndex !== null ? 'room-directory__connector-glow--traveling' : ''}`}
            style={{ left: connectorGlowLeft }}
            aria-hidden
          />

          {DESKTOP_LOBBY_PANORAMA_ROOMS.map((room, i) => {
            const isActive = i === roomIndex;
            const isDestination = pendingIndex === i && !isActive;
            const isHovered = hoveredIndex === i;
            const status = getDirectoryRoomStatus(isActive, isDestination, isHovered, room.comingSoon);

            return (
              <div key={room.id} className="room-directory__card-wrap">
                <div
                  className={`room-directory__card-glow ${isActive ? 'room-directory__card-glow--active' : ''}`}
                  aria-hidden
                />
                <button
                  type="button"
                  className={[
                    'room-directory__card',
                    isActive ? 'room-directory__card--active' : '',
                    isDestination ? 'room-directory__card--destination' : '',
                    room.comingSoon ? 'room-directory__card--coming-soon' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={isActive}
                  onClick={() => handleSelect(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={room.label}
                >
                  <span className="room-directory__code">{getDirectoryRoomCode(i)}</span>
                  <span className="room-directory__name">{room.label}</span>
                  {status ? <span className="room-directory__status">{status}</span> : null}
                  {!isActive ? (
                    <span className="room-directory__arrow" aria-hidden>
                      →
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
