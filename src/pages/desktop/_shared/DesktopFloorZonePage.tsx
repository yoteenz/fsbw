import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopFloatingNav } from '../../../components/desktop-lobby/floating-nav/DesktopFloatingNav';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { DesktopZoneRoomScene } from '../../../components/desktop-lobby/DesktopZoneRoomScene';
import PsaAssistantWidget from '../../../components/psa/PsaAssistantWidget';
import {
  resolveDesktopFloorZoneId,
  type DesktopFloor,
} from '../../../constants/desktopFloors';
import { resolveFloorZoneBackground } from '../../../constants/desktopFloorZoneBackgrounds';
import { DESKTOP_LOUNGE_BG_FALLBACK } from '../../../constants/desktopLobbyEnv';
import { useDesktopTowerPageReveal } from '../../../components/desktop-tower/useDesktopTowerPageReveal';
import { useDesktopTowerTravelOptional } from '../../../components/desktop-tower/DesktopTowerNavProvider';
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
  const { pageStyle } = useDesktopTowerPageReveal();
  const travel = useDesktopTowerTravelOptional();
  const isTraveling = travel?.isTraveling ?? false;
  const artboard = isDesktopArtboardLayoutActive();
  const [backgroundReady, setBackgroundReady] = useState(false);

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
            onBackgroundReadyChange={setBackgroundReady}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.1) 100%)',
            }}
          />

          {backgroundReady ? (
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
              <ParticleField />
            </div>
          ) : null}

          <DesktopFloatingNav />

          {zoneId === 'psa-suite' ? <PsaAssistantWidget variant="suite" /> : null}
        </section>
      </div>
  );
}
