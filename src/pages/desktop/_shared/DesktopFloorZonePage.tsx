import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopFloatingNav } from '../../../components/desktop-lobby/floating-nav/DesktopFloatingNav';
import { DesktopLoungeSlayCinemaPlay } from '../../../components/desktop-lobby/DesktopLoungeSlayCinemaPlay';
import { DesktopZoneRoomScene } from '../../../components/desktop-lobby/DesktopZoneRoomScene';
import PsaAssistantWidget from '../../../components/psa/PsaAssistantWidget';
import {
  resolveDesktopFloorZoneId,
  type DesktopFloor,
} from '../../../constants/desktopFloors';
import { resolveFloorZoneBackground } from '../../../constants/desktopFloorZoneBackgrounds';
import {
  DESKTOP_LOUNGE_BRIGHT_BACKGROUND,
  DESKTOP_LOUNGE_SLAY_CINEMA_BACKGROUND,
  DESKTOP_LOUNGE_SLAY_CINEMA_CROSSFADE_MS,
  DESKTOP_LOUNGE_ZONE_ID,
} from '../../../constants/desktopLoungeSlayCinema';
import { DESKTOP_LOUNGE_BG_FALLBACK } from '../../../constants/desktopLobbyEnv';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';
import { useDesktopTowerTravelOptional } from '../../../components/desktop-tower/DesktopTowerNavProvider';
import { ReceptionDashboard } from '../../../components/desktop-reception/ReceptionDashboard';
import { GrandLobbyPanels } from '../../../components/desktop-grand-lobby/GrandLobbyPanels';
import '../../../components/desktop-grand-lobby/GrandLobby.css';
import '../../../components/desktop-shared/acrylicGlass.css';
import { MansionDebugLayer } from '../../../components/desktop-mansion-debug';
import {
  resolveMansionDebugPageIdFromFloorPath,
  resolveMansionDebugPageLabel,
} from '../../../constants/desktopDebugRegistry';
import { useMansionDebugViewportBinding } from '../../../components/desktop-mansion-debug/MansionDebugProvider';
import { DESKTOP_GRAND_LOBBY_IMAGE } from '../../../constants/desktopGrandLobby';
import { DESKTOP_RECEPTION_BACKGROUND_URL, RECEPTION_DASHBOARD_IMAGE } from '../../../constants/desktopReceptionDashboard';
import {
  DESKTOP_LOUNGE_ART_HEIGHT,
  DESKTOP_LOUNGE_ART_WIDTH,
} from '../../../constants/desktopLoungeTvLayout';
import {
  DESKTOP_PSA_SUITE_ART_HEIGHT,
  DESKTOP_PSA_SUITE_ART_WIDTH,
} from '../../../constants/desktopPsaSuiteLayout';
import { PerspectivePanelPageDebugOverlays } from '../../../components/perspective-panel/PerspectivePanelPageDebugOverlays';
import { RewardsRoomCertificationWall } from '../../../components/desktop-rewards/RewardsRoomCertificationWall';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_ROOM_SHELL_BACKGROUND } from '../../../constants/desktopRoomHeroArt';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  isDesktopArtboardLayoutActive,
} from '../../../utils/desktopPreview';

type Props = {
  floor: DesktopFloor;
};

function resolveZoneBackground(zoneId: string): string {
  return resolveFloorZoneBackground(zoneId) ?? DESKTOP_LOUNGE_BG_FALLBACK;
}

export default function DesktopFloorZonePage({ floor }: Props) {
  const [searchParams] = useSearchParams();
  const zoneId = resolveDesktopFloorZoneId(floor, searchParams.get('zone'));
  const viewportMeasureRef = useRef<HTMLElement>(null);
  const { pageStyle } = useDesktopTowerPageReveal();
  const travel = useDesktopTowerTravelOptional();
  const isTraveling = travel?.isTraveling ?? false;
  const artboard = isDesktopArtboardLayoutActive();
  const [isSlayCinemaEnabled, setIsSlayCinemaEnabled] = useState(false);

  const isLoungeZone = zoneId === DESKTOP_LOUNGE_ZONE_ID;
  const isReceptionZone = zoneId === 'reception';
  const isGrandLobbyZone = zoneId === 'grand-lobby';

  useEffect(() => {
    if (!isLoungeZone) {
      setIsSlayCinemaEnabled(false);
    }
  }, [isLoungeZone]);

  useEffect(() => {
    if (!isLoungeZone) return;
    void preloadDesktopRoomBackground(DESKTOP_LOUNGE_BRIGHT_BACKGROUND);
    void preloadDesktopRoomBackground(DESKTOP_LOUNGE_SLAY_CINEMA_BACKGROUND);
  }, [isLoungeZone]);

  useEffect(() => {
    if (!isReceptionZone) return;
    void preloadDesktopRoomBackground(DESKTOP_RECEPTION_BACKGROUND_URL);
  }, [isReceptionZone]);

  const toggleSlayCinema = useCallback(() => {
    setIsSlayCinemaEnabled((current) => !current);
  }, []);

  const closeSlayCinema = useCallback(() => {
    setIsSlayCinemaEnabled(false);
  }, []);

  const loungeSlayCinema = useMemo(
    () =>
      isLoungeZone && isSlayCinemaEnabled
        ? {
            enabled: true,
            brightSrc: DESKTOP_LOUNGE_BRIGHT_BACKGROUND,
            dimmedSrc: DESKTOP_LOUNGE_SLAY_CINEMA_BACKGROUND,
            crossfadeMs: DESKTOP_LOUNGE_SLAY_CINEMA_CROSSFADE_MS,
          }
        : null,
    [isLoungeZone, isSlayCinemaEnabled],
  );

  const zoneIds = useMemo(() => floor.zones.map((zone) => zone.id), [floor.zones]);
  const zoneIndex = useMemo(() => {
    const index = zoneIds.indexOf(zoneId);
    return index >= 0 ? index : 0;
  }, [zoneId, zoneIds]);

  const mansionDebugPage = resolveMansionDebugPageIdFromFloorPath(floor.path);
  const mansionDebugPageLabel = resolveMansionDebugPageLabel(mansionDebugPage);
  useMansionDebugViewportBinding(viewportMeasureRef, {
    page: mansionDebugPage,
    pageZone: zoneId,
    pageLabel: mansionDebugPageLabel,
  });

  return (
    <div
      style={{
        height: artboard ? `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px` : '100vh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: DESKTOP_ROOM_SHELL_BACKGROUND,
        position: 'relative',
        ...pageStyle,
        opacity: isTraveling ? 0 : pageStyle.opacity,
        pointerEvents: isTraveling ? 'none' : undefined,
      }}
    >
      <NavBar />
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
        <DesktopZoneRoomScene
          zoneIds={zoneIds}
          zoneIndex={zoneIndex}
          resolveBackground={resolveZoneBackground}
          resolveFallbackBackground={() => DESKTOP_LOUNGE_BG_FALLBACK}
          loungeSlayCinema={loungeSlayCinema}
        />

        <DesktopLoungeSlayCinemaPlay
          measureRef={viewportMeasureRef}
          active={isLoungeZone}
          isSlayCinemaEnabled={isSlayCinemaEnabled}
          onToggleSlayCinema={toggleSlayCinema}
          onCloseSlayCinema={closeSlayCinema}
        />

        <DesktopFloatingNav />

        {isReceptionZone ? <ReceptionDashboard measureRef={viewportMeasureRef} /> : null}

        {isGrandLobbyZone ? <GrandLobbyPanels measureRef={viewportMeasureRef} /> : null}

        {zoneId === 'psa-suite' ? (
          <PsaAssistantWidget variant="suite" measureRef={viewportMeasureRef} />
        ) : null}

        {isGrandLobbyZone ? (
          <PerspectivePanelPageDebugOverlays
            measureRef={viewportMeasureRef}
            page="grand-lobby"
            image={DESKTOP_GRAND_LOBBY_IMAGE}
          />
        ) : null}

        {isReceptionZone ? (
          <PerspectivePanelPageDebugOverlays
            measureRef={viewportMeasureRef}
            page="reception"
            image={RECEPTION_DASHBOARD_IMAGE}
          />
        ) : null}

        {isLoungeZone ? (
          <PerspectivePanelPageDebugOverlays
            measureRef={viewportMeasureRef}
            page="lounge"
            image={{ width: DESKTOP_LOUNGE_ART_WIDTH, height: DESKTOP_LOUNGE_ART_HEIGHT }}
          />
        ) : null}

        {zoneId === 'psa-suite' ? (
          <PerspectivePanelPageDebugOverlays
            measureRef={viewportMeasureRef}
            page="psa-suite"
            image={{ width: DESKTOP_PSA_SUITE_ART_WIDTH, height: DESKTOP_PSA_SUITE_ART_HEIGHT }}
          />
        ) : null}

        {zoneId === 'rewards-gallery' ? (
          <RewardsRoomCertificationWall measureRef={viewportMeasureRef} />
        ) : null}

        <MansionDebugLayer />
      </section>
    </div>
  );
}
