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
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
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

  return (
    <div
      style={{
        height: artboard ? `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px` : '100vh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0A0A0A',
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
          background: '#0A0A0A',
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

        {zoneId === 'psa-suite' ? (
          <PsaAssistantWidget variant="suite" measureRef={viewportMeasureRef} />
        ) : null}
      </section>
    </div>
  );
}
