import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopFloorElevator } from '../../../components/desktop-lobby/DesktopFloorElevator';
import type { DesktopFloor } from '../../../constants/desktopFloors';

type Props = {
  floor: DesktopFloor;
};

export default function DesktopFloorPlaceholder({ floor }: Props) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#ECE8E4', position: 'relative' }}>
      <NavBar activeLink="HOME" />
      <section
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 140px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#959B9B', marginBottom: '12px' }}>
            Level {floor.level}
          </div>
          <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '28px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '12px' }}>
            {floor.name}
          </div>
          <div style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', letterSpacing: '0.06em', color: '#4A3728', lineHeight: 1.7 }}>
            This floor is coming soon. Use the elevator to visit the Penthouse or Lounge.
          </div>
        </div>
        <DesktopFloorElevator activeFloorPath={floor.path} />
      </section>
    </div>
  );
}
