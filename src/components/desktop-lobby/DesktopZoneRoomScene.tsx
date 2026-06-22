import { useEffect, useState } from 'react';
import { isDesktopArtboardLayoutActive } from '../../utils/desktopPreview';
import './DesktopZoneRoomScene.css';

const ZONE_TRANSITION_MS = 880;

type ZoneBackgroundProps = {
  zoneId: string;
  className: string;
  resolveBackground: (zoneId: string) => string;
  resolveFallbackBackground?: (zoneId: string) => string;
};

function ZoneBackground({
  zoneId,
  className,
  resolveBackground,
  resolveFallbackBackground,
}: ZoneBackgroundProps) {
  const [src, setSrc] = useState(() => resolveBackground(zoneId));

  useEffect(() => {
    setSrc(resolveBackground(zoneId));
  }, [resolveBackground, zoneId]);

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={className}
      onError={() => {
        if (!resolveFallbackBackground) return;
        setSrc((current) => {
          const fallback = resolveFallbackBackground(zoneId);
          return current === fallback ? current : fallback;
        });
      }}
    />
  );
}

type DesktopZoneRoomSceneProps = {
  zoneIds: readonly string[];
  zoneIndex: number;
  resolveBackground: (zoneId: string) => string;
  resolveFallbackBackground?: (zoneId: string) => string;
  className?: string;
};

export function DesktopZoneRoomScene({
  zoneIds,
  zoneIndex,
  resolveBackground,
  resolveFallbackBackground,
  className = '',
}: DesktopZoneRoomSceneProps) {
  const [activeIndex, setActiveIndex] = useState(zoneIndex);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (zoneIndex === activeIndex) return;

    setLeavingIndex(activeIndex);
    setActiveIndex(zoneIndex);

    const timer = window.setTimeout(() => {
      setLeavingIndex(null);
    }, ZONE_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, zoneIndex]);

  const clampedActiveIndex = Math.max(0, Math.min(zoneIds.length - 1, activeIndex));
  const activeZoneId = zoneIds[clampedActiveIndex] ?? zoneIds[0];
  const leavingZoneId =
    leavingIndex !== null ? (zoneIds[Math.max(0, Math.min(zoneIds.length - 1, leavingIndex))] ?? null) : null;
  const isTransitioning = leavingIndex !== null;
  const artboard = isDesktopArtboardLayoutActive();

  if (!activeZoneId) return null;

  return (
    <div
      className={`desktop-zone-room-scene${artboard ? ' desktop-zone-room-scene--artboard' : ''} ${className}`.trim()}
      aria-hidden
    >
      {!isTransitioning ? (
        <div className="desktop-zone-room-scene__layer">
          <ZoneBackground
            zoneId={activeZoneId}
            className="desktop-zone-room-scene__bg desktop-zone-room-scene__bg--steady"
            resolveBackground={resolveBackground}
            resolveFallbackBackground={resolveFallbackBackground}
          />
        </div>
      ) : (
        <>
          {leavingZoneId ? (
            <div className="desktop-zone-room-scene__layer">
              <ZoneBackground
                zoneId={leavingZoneId}
                className="desktop-zone-room-scene__bg desktop-zone-room-scene__bg--exit"
                resolveBackground={resolveBackground}
                resolveFallbackBackground={resolveFallbackBackground}
              />
            </div>
          ) : null}
          <div className="desktop-zone-room-scene__layer">
            <ZoneBackground
              zoneId={activeZoneId}
              className="desktop-zone-room-scene__bg desktop-zone-room-scene__bg--enter"
              resolveBackground={resolveBackground}
              resolveFallbackBackground={resolveFallbackBackground}
            />
          </div>
        </>
      )}
    </div>
  );
}
