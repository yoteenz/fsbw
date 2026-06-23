import { useCallback, useEffect, useRef, useState } from 'react';
import { isDesktopArtboardLayoutActive } from '../../utils/desktopPreview';
import {
  getLastDesktopRoomBackground,
  isDesktopRoomBackgroundLoaded,
  preloadDesktopRoomBackground,
  setLastDesktopRoomBackground,
} from '../../utils/desktopRoomBackgroundCache';
import { resolveDesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { resolveDesktopRoomTitleCopy } from '../../constants/desktopRoomTitles';
import { DesktopRoomTitle } from './DesktopRoomTitle';
import './DesktopZoneRoomScene.css';

const ZONE_TRANSITION_MS = 880;

type ZoneBackgroundProps = {
  zoneId: string;
  className: string;
  resolveBackground: (zoneId: string) => string;
  resolveFallbackBackground?: (zoneId: string) => string;
  onReadyChange?: (ready: boolean) => void;
};

function ZoneBackground({
  zoneId,
  className,
  resolveBackground,
  resolveFallbackBackground,
  onReadyChange,
}: ZoneBackgroundProps) {
  const targetSrc = resolveBackground(zoneId);
  const fallbackSrc = resolveFallbackBackground?.(zoneId);
  const [displaySrc, setDisplaySrc] = useState(() => {
    const cached = getLastDesktopRoomBackground();
    if (cached) return cached;
    if (isDesktopRoomBackgroundLoaded(targetSrc)) return targetSrc;
    return targetSrc;
  });

  useEffect(() => {
    let cancelled = false;
    const target = resolveBackground(zoneId);
    const fallback = resolveFallbackBackground?.(zoneId);

    const markReady = (src: string) => {
      onReadyChange?.(true);
      setLastDesktopRoomBackground(src);
    };

    if (isDesktopRoomBackgroundLoaded(target)) {
      setDisplaySrc(target);
      markReady(target);
      return;
    }

    onReadyChange?.(false);

    void preloadDesktopRoomBackground(target, fallback).then((loaded) => {
      if (cancelled) return;
      setDisplaySrc(loaded);
      markReady(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [zoneId, resolveBackground, resolveFallbackBackground, onReadyChange]);

  return (
    <img
      src={displaySrc}
      alt=""
      draggable={false}
      className={className}
      onLoad={() => {
        setLastDesktopRoomBackground(displaySrc);
      }}
      onError={() => {
        if (!fallbackSrc || displaySrc === fallbackSrc) return;
        void preloadDesktopRoomBackground(fallbackSrc).then((loaded) => {
          setDisplaySrc(loaded);
          setLastDesktopRoomBackground(loaded);
          onReadyChange?.(true);
        });
      }}
    />
  );
}

function ZoneRoomTitle({ zoneId }: { zoneId: string }) {
  const copy = resolveDesktopRoomTitleCopy(zoneId);
  if (!copy) return null;

  return (
    <DesktopRoomTitle
      title={copy.title}
      subtitle={copy.subtitle}
      placement={resolveDesktopRoomTitlePlacement(zoneId)}
    />
  );
}

type DesktopZoneRoomSceneProps = {
  zoneIds: readonly string[];
  zoneIndex: number;
  resolveBackground: (zoneId: string) => string;
  resolveFallbackBackground?: (zoneId: string) => string;
  className?: string;
  onBackgroundReadyChange?: (ready: boolean) => void;
};

export function DesktopZoneRoomScene({
  zoneIds,
  zoneIndex,
  resolveBackground,
  resolveFallbackBackground,
  className = '',
  onBackgroundReadyChange,
}: DesktopZoneRoomSceneProps) {
  const [activeIndex, setActiveIndex] = useState(zoneIndex);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const handleReadyChange = useCallback(
    (ready: boolean) => {
      onBackgroundReadyChange?.(ready);
    },
    [onBackgroundReadyChange],
  );

  useEffect(() => {
    if (zoneIndex === activeIndex) return;

    const nextZoneId = zoneIds[zoneIndex];
    if (!nextZoneId) return;

    const nextSrc = resolveBackground(nextZoneId);
    const fallback = resolveFallbackBackground?.(nextZoneId);
    let cancelled = false;

    onBackgroundReadyChange?.(false);

    void preloadDesktopRoomBackground(nextSrc, fallback).then(() => {
      if (cancelled) return;

      setLeavingIndex(activeIndex);
      setActiveIndex(zoneIndex);
      onBackgroundReadyChange?.(true);

      clearTransitionTimer();
      transitionTimerRef.current = window.setTimeout(() => {
        setLeavingIndex(null);
        transitionTimerRef.current = null;
      }, ZONE_TRANSITION_MS);
    });

    return () => {
      cancelled = true;
      clearTransitionTimer();
    };
  }, [
    activeIndex,
    zoneIndex,
    zoneIds,
    resolveBackground,
    resolveFallbackBackground,
    onBackgroundReadyChange,
    clearTransitionTimer,
  ]);

  const clampedActiveIndex = Math.max(0, Math.min(zoneIds.length - 1, activeIndex));
  const activeZoneId = zoneIds[clampedActiveIndex] ?? zoneIds[0];
  const leavingZoneId =
    leavingIndex !== null
      ? (zoneIds[Math.max(0, Math.min(zoneIds.length - 1, leavingIndex))] ?? null)
      : null;
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
            onReadyChange={handleReadyChange}
          />
          <ZoneRoomTitle zoneId={activeZoneId} />
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
              onReadyChange={handleReadyChange}
            />
            <ZoneRoomTitle zoneId={activeZoneId} />
          </div>
        </>
      )}
    </div>
  );
}
