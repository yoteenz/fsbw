import { useState, useEffect } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { getDesktopLayoutViewportWidth, isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../../components/desktop-lobby/PSAConciergePanel';
import { DESKTOP_LOUNGE_BG_FALLBACK } from '../../../constants/desktopLobbyEnv';
import { DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX } from '../../../constants/desktopLobbyPanorama';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { DesktopLobbyPanorama } from '../../../components/desktop-lobby/DesktopLobbyPanorama';
import { DesktopElevatorPanel } from '../../../components/desktop-lobby/DesktopElevatorPanel';

function PenthouseViewport({
  roomIndex,
  onRoomIndexChange,
}: {
  roomIndex: number;
  onRoomIndexChange: (index: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const floatIn = (delayMs: number, dy = 24) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  const sceneHeight = isDesktopArtboardLayoutActive() ? '1080px' : '100vh';

  return (
    <section
      style={{
        position: 'relative',
        height: sceneHeight,
        minHeight: sceneHeight,
        maxHeight: sceneHeight,
        overflow: 'hidden',
        background: '#ECE8E4',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${DESKTOP_LOUNGE_BG_FALLBACK})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />

      <DesktopLobbyPanorama roomIndex={roomIndex} onRoomIndexChange={onRoomIndexChange} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <ParticleField />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(120px, 18vh, 200px)',
          left: '6%',
          zIndex: 30,
          filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
          ...floatIn(400, 32),
        }}
      >
        <BuildAWigPanel />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(120px, 18vh, 200px)',
          right: '6%',
          zIndex: 30,
          filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
          ...floatIn(560, 32),
        }}
      >
        <PSAConciergePanel />
      </div>

      <DesktopElevatorPanel
        activeFloorPath={DESKTOP_PENTHOUSE_PATH}
        roomIndex={roomIndex}
        onRoomSelect={onRoomIndexChange}
        showRoomNav
      />
    </section>
  );
}

export default function DesktopPenthousePage() {
  const [roomIndex, setRoomIndex] = useState(DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX);
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
    <div style={{ height: '100vh', overflow: 'hidden', background: '#ECE8E4' }}>
      <NavBar activeLink="HOME" />
      <PenthouseViewport roomIndex={roomIndex} onRoomIndexChange={setRoomIndex} />
    </div>
  );
}
