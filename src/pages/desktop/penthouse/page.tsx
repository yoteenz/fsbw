import { useState, useEffect } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../../components/desktop-lobby/PSAConciergePanel';
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

  const sceneHeight = isDesktopArtboardLayoutActive() ? '1012px' : 'calc(100vh - 68px)';

  return (
    <section
      style={{
        position: 'relative',
        height: sceneHeight,
        minHeight: sceneHeight,
        maxHeight: sceneHeight,
        overflow: 'hidden',
        background: '#0A0A0A',
      }}
    >
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

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0A0A0A' }}>
      <NavBar activeLink="HOME" />
      <PenthouseViewport roomIndex={roomIndex} onRoomIndexChange={setRoomIndex} />
    </div>
  );
}
