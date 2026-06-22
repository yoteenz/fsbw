import { useSearchParams } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopFloorElevator } from '../../../components/desktop-lobby/DesktopFloorElevator';
import { DesktopRoomNavPanel } from '../../../components/desktop-lobby/DesktopRoomNavPanel';
import {
  getDesktopZoneOnFloor,
  resolveDesktopFloorZoneId,
  type DesktopFloor,
} from '../../../constants/desktopFloors';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  isDesktopArtboardLayoutActive,
} from '../../../utils/desktopPreview';

type Props = {
  floor: DesktopFloor;
};

export default function DesktopFloorZonePage({ floor }: Props) {
  const [searchParams] = useSearchParams();
  const zoneId = resolveDesktopFloorZoneId(floor, searchParams.get('zone'));
  const zone = getDesktopZoneOnFloor(floor, zoneId) ?? getDesktopZoneOnFloor(floor, floor.defaultZoneId);
  const { pageStyle } = useDesktopTowerPageReveal();
  const artboard = isDesktopArtboardLayoutActive();

  return (
    <div
      style={{
        height: artboard ? `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px` : '100vh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#ECE8E4',
        position: 'relative',
        ...pageStyle,
      }}
    >
      <NavBar />
      <section
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 120px 140px 48px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <div
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#959B9B',
              marginBottom: '12px',
            }}
          >
            Level {floor.id} — {floor.name}
          </div>
          <div
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '26px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              marginBottom: '12px',
            }}
          >
            {zone?.label ?? floor.name}
          </div>
          {zone?.comingSoon ? (
            <div
              style={{
                display: 'inline-block',
                fontFamily: '"Futura PT Medium"',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#EB1C24',
                border: '1px solid rgba(235,28,36,0.35)',
                background: 'rgba(235,28,36,0.06)',
                padding: '6px 14px',
                borderRadius: '6px',
                marginBottom: '14px',
              }}
            >
              Coming soon
            </div>
          ) : null}
          <div
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '12px',
              letterSpacing: '0.06em',
              color: '#4A3728',
              lineHeight: 1.7,
            }}
          >
            {zone?.comingSoon
              ? 'This destination is under construction. Use the elevator to explore other floors.'
              : 'Welcome to the Frontal Slayer digital flagship. More experiences arriving soon.'}
          </div>
        </div>
        <DesktopFloorElevator />
        <DesktopRoomNavPanel />
      </section>
    </div>
  );
}
