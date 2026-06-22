import { Navigate, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID,
  getPenthouseRoomIdByIndex,
  getPenthouseRoomIndexById,
} from '../../../constants/desktopPenthouseRooms';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import { DesktopPenthouseRoomScene } from '../../../components/desktop-lobby/DesktopPenthouseRoomScene';
import { DesktopFloatingNav } from '../../../components/desktop-lobby/floating-nav/DesktopFloatingNav';
import { ExtensionsBoutiqueExperience } from '../../../components/desktop-penthouse/ExtensionsBoutiqueExperience';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';

function PenthouseViewport({
  roomIndex,
  roomId,
  onRoomIndexChange,
}: {
  roomIndex: number;
  roomId: string;
  onRoomIndexChange: (index: number) => void;
}) {
  const artboard = isDesktopArtboardLayoutActive();
  const viewportMeasureRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={viewportMeasureRef}
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

      <DesktopFloatingNav />

      <ExtensionsBoutiqueExperience
        viewportMeasureRef={viewportMeasureRef}
        active={roomId === 'boutique'}
      />
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
      <PenthouseViewport
        roomIndex={roomIndex}
        roomId={roomParam}
        onRoomIndexChange={onRoomIndexChange}
      />
    </div>
  );
}
