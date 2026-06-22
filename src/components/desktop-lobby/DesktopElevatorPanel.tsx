import { useNavigate } from 'react-router-dom';
import { DESKTOP_FLOORS } from '../../constants/desktopFloors';
import { DESKTOP_LOBBY_PANORAMA_ROOMS } from '../../constants/desktopLobbyPanorama';

const RED = '#EB1C24';

type DesktopElevatorPanelProps = {
  activeFloorPath: string;
  roomIndex?: number;
  onRoomSelect?: (index: number) => void;
  showRoomNav?: boolean;
};

export function DesktopElevatorPanel({
  activeFloorPath,
  roomIndex = 0,
  onRoomSelect,
  showRoomNav = false,
}: DesktopElevatorPanelProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'clamp(16px, 2.5vh, 32px)',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'min(920px, calc(100vw - 48px))',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(28px) saturate(1.65)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.65)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderTop: `2px solid ${RED}`,
          borderRadius: '14px',
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.95)',
            '0 20px 48px rgba(0,0,0,0.14)',
            '0 4px 16px rgba(0,0,0,0.08)',
          ].join(', '),
          padding: '14px 18px 16px',
        }}
      >
        {showRoomNav && onRoomSelect ? (
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '8px',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#959B9B',
                marginBottom: '8px',
              }}
            >
              Room navigation
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              {DESKTOP_LOBBY_PANORAMA_ROOMS.map((room, i) => {
                const active = i === roomIndex;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onRoomSelect(i)}
                    style={{
                      flex: '1 1 140px',
                      minWidth: '120px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: active ? `1px solid ${RED}` : '1px solid rgba(0,0,0,0.08)',
                      background: active ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.45)',
                      color: active ? RED : '#1A1A1A',
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? `0 0 0 1px rgba(235,28,36,0.15)` : 'none',
                    }}
                  >
                    {room.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <div
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '8px',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#959B9B',
              marginBottom: '8px',
            }}
          >
            Floor navigation
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {DESKTOP_FLOORS.map((floor) => {
              const active = floor.path === activeFloorPath;
              return (
                <button
                  key={floor.path}
                  type="button"
                  onClick={() => {
                    if (!active) navigate(floor.path);
                  }}
                  style={{
                    flex: '1 1 100px',
                    minWidth: '88px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: active ? `1px solid ${RED}` : '1px solid rgba(0,0,0,0.08)',
                    background: active ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.45)',
                    cursor: active ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? `0 0 0 1px rgba(235,28,36,0.15)` : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '7px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: active ? RED : '#959B9B',
                      marginBottom: '2px',
                    }}
                  >
                    Level {floor.level}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: active ? RED : '#1A1A1A',
                    }}
                  >
                    {floor.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
