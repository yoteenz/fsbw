import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopElevatorPanel } from '../../../components/desktop-lobby/DesktopElevatorPanel';
import { getDesktopLayoutViewportWidth } from '../../../utils/desktopPreview';
import type { DesktopFloor } from '../../../constants/desktopFloors';
import { useEffect, useState } from 'react';

type Props = {
  floor: DesktopFloor;
};

export default function DesktopFloorPlaceholder({ floor }: Props) {
  const [isTooSmall, setIsTooSmall] = useState(() => getDesktopLayoutViewportWidth() < 1024);

  useEffect(() => {
    const check = () => setIsTooSmall(getDesktopLayoutViewportWidth() < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isTooSmall) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF8F7', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', letterSpacing: '0.3em', color: '#C81C24', marginBottom: '16px' }}>
          FRONTAL SLAYER
        </div>
        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', letterSpacing: '0.06em', color: '#4A3728', maxWidth: '280px', lineHeight: 1.7 }}>
          THE DIGITAL FLAGSHIP IS DESIGNED FOR DESKTOP VIEWING. PLEASE VISIT ON A DEVICE WITH A WIDER SCREEN FOR THE FULL EXPERIENCE.
        </div>
      </div>
    );
  }

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
        <DesktopElevatorPanel activeFloorPath={floor.path} />
      </section>
    </div>
  );
}
