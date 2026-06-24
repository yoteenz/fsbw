import { Navigate, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID,
  getPenthouseRoomIdByIndex,
  getPenthouseRoomIndexById,
} from '../../../constants/desktopPenthouseRooms';
import { DESKTOP_ROOM_SHELL_BACKGROUND } from '../../../constants/desktopRoomHeroArt';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import {
  appendRoomTitleDebugToHref,
  persistRoomTitleDebugFromSearch,
} from '../../../utils/desktopRoomTitlePlacementDebug';
import { DesktopPenthouseRoomScene } from '../../../components/desktop-lobby/DesktopPenthouseRoomScene';
import { DesktopFloatingNav } from '../../../components/desktop-lobby/floating-nav/DesktopFloatingNav';
import { ExtensionsBoutiqueExperience } from '../../../components/desktop-penthouse/ExtensionsBoutiqueExperience';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';
import { useDesktopTowerTravelOptional } from '../../../components/desktop-tower/DesktopTowerNavProvider';
import { MansionDebugLayer } from '../../../components/desktop-mansion-debug';
import { useMansionDebugViewportBinding } from '../../../components/desktop-mansion-debug/MansionDebugProvider';

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

  useMansionDebugViewportBinding(viewportMeasureRef, {
    page: 'penthouse',
    pageZone: roomId,
    pageLabel: 'Penthouse',
  });

  return (
    <section
      ref={viewportMeasureRef}
      style={{
        position: 'relative',
        flex: artboard ? 'none' : 1,
        height: artboard ? '1012px' : undefined,
        minHeight: artboard ? '1012px' : 0,
        overflow: 'hidden',
        background: DESKTOP_ROOM_SHELL_BACKGROUND,
      }}
    >
      <DesktopPenthouseRoomScene
        roomIndex={roomIndex}
        onRoomIndexChange={onRoomIndexChange}
      />

      <DesktopFloatingNav />

      <ExtensionsBoutiqueExperience
        viewportMeasureRef={viewportMeasureRef}
        active={roomId === 'boutique'}
      />

      <MansionDebugLayer />
    </section>
  );
}

export default function DesktopPenthousePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room');
  const { pageStyle } = useDesktopTowerPageReveal();
  const travel = useDesktopTowerTravelOptional();
  const isTraveling = travel?.isTraveling ?? false;

  const roomIndex = useMemo(() => getPenthouseRoomIndexById(roomParam), [roomParam]);

  const onRoomIndexChange = useCallback(
    (index: number) => {
      const roomId = getPenthouseRoomIdByIndex(index);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('room', roomId);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  persistRoomTitleDebugFromSearch(searchParams.toString());

  if (!roomParam) {
    return (
      <Navigate
        to={appendRoomTitleDebugToHref(
          buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID),
          searchParams,
        )}
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
        background: DESKTOP_ROOM_SHELL_BACKGROUND,
        ...pageStyle,
        opacity: isTraveling ? 0 : pageStyle.opacity,
        pointerEvents: isTraveling ? 'none' : undefined,
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
