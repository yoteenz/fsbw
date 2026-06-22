import { DESKTOP_LOBBY_PANORAMA_ROOMS } from '../../constants/desktopLobbyPanorama';
import { DESKTOP_BRAND_RED, desktopAcrylicPanelStyle } from './desktopLobbyAcrylic';

type DesktopRoomNavPanelProps = {
  roomIndex: number;
  onRoomSelect: (index: number) => void;
};

export function DesktopRoomNavPanel({ roomIndex, onRoomSelect }: DesktopRoomNavPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'clamp(16px, 2.5vh, 32px)',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'min(720px, calc(100vw - 120px))',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          ...desktopAcrylicPanelStyle,
          borderRadius: '14px',
          padding: '12px 16px 14px',
        }}
      >
        <div
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '8px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#959B9B',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          Room navigation
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center',
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
                  flex: '1 1 160px',
                  minWidth: '140px',
                  maxWidth: '220px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: active ? `1px solid ${DESKTOP_BRAND_RED}` : '1px solid rgba(0,0,0,0.08)',
                  background: active ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.45)',
                  color: active ? DESKTOP_BRAND_RED : '#1A1A1A',
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
    </div>
  );
}
