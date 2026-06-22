import { Navigate, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../../components/desktop-lobby/PSAConciergePanel';
import {
  DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID,
  DESKTOP_LOBBY_PANORAMA_ROOMS,
  getPenthouseRoomIdByIndex,
  getPenthouseRoomIndexById,
} from '../../../constants/desktopLobbyPanorama';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import { DesktopLobbyPanorama } from '../../../components/desktop-lobby/DesktopLobbyPanorama';
import { DesktopFloorElevator } from '../../../components/desktop-lobby/DesktopFloorElevator';
import { DesktopRoomNavPanel } from '../../../components/desktop-lobby/DesktopRoomNavPanel';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';

function PenthouseComingSoonBadge({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'clamp(88px, 12vh, 120px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        pointerEvents: 'none',
        fontFamily: '"Futura PT Medium"',
        fontSize: '9px',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: '#EB1C24',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(235,28,36,0.35)',
        padding: '8px 16px',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      }}
    >
      {label} — coming soon
    </div>
  );
}

function PenthouseViewport({
  roomIndex,
  onRoomIndexChange,
}: {
  roomIndex: number;
  onRoomIndexChange: (index: number) => void;
}) {
  const sceneHeight = isDesktopArtboardLayoutActive() ? '1012px' : 'calc(100vh - 68px)';
  const room = DESKTOP_LOBBY_PANORAMA_ROOMS[roomIndex];

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

      {room?.comingSoon ? <PenthouseComingSoonBadge label={room.label} /> : null}

      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(120px, 18vh, 200px)',
          left: '6%',
          zIndex: 30,
          filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
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
        }}
      >
        <PSAConciergePanel />
      </div>

      <DesktopFloorElevator activeFloorPath={DESKTOP_PENTHOUSE_PATH} />
      <DesktopRoomNavPanel roomIndex={roomIndex} onRoomSelect={onRoomIndexChange} />
    </section>
  );
}

export default function DesktopPenthousePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room');
  const { pageStyle } = useDesktopTowerPageReveal();

  const roomIndex = useMemo(() => getPenthouseRoomIndexById(roomParam), [roomParam]);

  const onRoomIndexChange = useCallback(
    (index: number) => {
      const roomId = getPenthouseRoomIdByIndex(index);
      setSearchParams({ room: roomId }, { replace: true });
    },
    [setSearchParams],
  );

  if (!roomParam) {
    return (
      <Navigate
        to={buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID)}
        replace
      />
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0A0A0A', ...pageStyle }}>
      <NavBar />
      <PenthouseViewport roomIndex={roomIndex} onRoomIndexChange={onRoomIndexChange} />
    </div>
  );
}
