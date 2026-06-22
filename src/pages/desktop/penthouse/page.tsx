import { Navigate, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../../components/desktop-lobby/PSAConciergePanel';
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID,
  DESKTOP_PENTHOUSE_ROOMS,
  getPenthouseRoomIdByIndex,
  getPenthouseRoomIndexById,
} from '../../../constants/desktopPenthouseRooms';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import { DesktopPenthouseRoomScene } from '../../../components/desktop-lobby/DesktopPenthouseRoomScene';
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
  const artboard = isDesktopArtboardLayoutActive();
  const room = DESKTOP_PENTHOUSE_ROOMS[roomIndex];

  return (
    <section
      style={{
        position: 'relative',
        flex: artboard ? 'none' : 1,
        height: artboard ? '1012px' : undefined,
        minHeight: artboard ? '1012px' : 0,
        overflow: 'hidden',
        background: '#0A0A0A',
      }}
    >
      <DesktopPenthouseRoomScene roomIndex={roomIndex} onRoomIndexChange={onRoomIndexChange} />

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

      {room?.comingSoon ? <PenthouseComingSoonBadge label={room.name} /> : null}

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

      <DesktopFloorElevator />
      <DesktopRoomNavPanel />
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
        to={buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID)}
        replace
      />
    );
  }

  const artboard = isDesktopArtboardLayoutActive();

  return (
    <div
      style={{
        height: artboard ? '1080px' : '100vh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0A0A0A',
        ...pageStyle,
      }}
    >
      <NavBar />
      <PenthouseViewport roomIndex={roomIndex} onRoomIndexChange={onRoomIndexChange} />
    </div>
  );
}
