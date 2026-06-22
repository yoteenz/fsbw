import { useNavigate } from 'react-router-dom';
import { DESKTOP_FLOORS } from '../../constants/desktopFloors';
import { DESKTOP_BRAND_RED, desktopAcrylicPanelStyle } from './desktopLobbyAcrylic';

type DesktopFloorElevatorProps = {
  activeFloorPath: string;
  side?: 'left' | 'right';
};

export function DesktopFloorElevator({ activeFloorPath, side = 'right' }: DesktopFloorElevatorProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        ...(side === 'right'
          ? { right: 'clamp(12px, 1.5vw, 24px)' }
          : { left: 'clamp(12px, 1.5vw, 24px)' }),
        transform: 'translateY(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          ...desktopAcrylicPanelStyle,
          borderRadius: '12px',
          borderLeft: side === 'right' ? `2px solid ${DESKTOP_BRAND_RED}` : desktopAcrylicPanelStyle.border,
          borderRight: side === 'left' ? `2px solid ${DESKTOP_BRAND_RED}` : desktopAcrylicPanelStyle.border,
          padding: '12px 10px',
          minWidth: '72px',
        }}
      >
        <div
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '7px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#959B9B',
            textAlign: 'center',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          Elevator
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            position: 'relative',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              ...(side === 'right' ? { right: '6px' } : { left: '6px' }),
              width: '1px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent)',
            }}
          />

          {DESKTOP_FLOORS.map((floor) => {
            const active = floor.path === activeFloorPath;
            return (
              <button
                key={floor.path}
                type="button"
                onClick={() => {
                  if (!active) navigate(floor.path);
                }}
                title={`Level ${floor.level} — ${floor.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: '8px',
                  border: active ? `1px solid ${DESKTOP_BRAND_RED}` : '1px solid transparent',
                  background: active ? 'rgba(235,28,36,0.1)' : 'rgba(255,255,255,0.35)',
                  cursor: active ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 0 1px rgba(235,28,36,0.12)` : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    color: active ? DESKTOP_BRAND_RED : '#1A1A1A',
                    minWidth: '22px',
                  }}
                >
                  L{floor.level}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: '"Futura PT Book"',
                    fontSize: '7px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: active ? DESKTOP_BRAND_RED : '#4A3728',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {floor.name}
                </span>
                <span
                  aria-hidden
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: active ? DESKTOP_BRAND_RED : 'transparent',
                    boxShadow: active ? `0 0 6px rgba(235,28,36,0.5)` : 'none',
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
