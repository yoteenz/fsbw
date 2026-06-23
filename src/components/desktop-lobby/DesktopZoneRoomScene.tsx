import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { isDesktopArtboardLayoutActive } from '../../utils/desktopPreview';
import {
  getLastDesktopRoomBackground,
  isDesktopRoomBackgroundLoaded,
  preloadDesktopRoomBackground,
  setLastDesktopRoomBackground,
} from '../../utils/desktopRoomBackgroundCache';
import { resolveDesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { resolveDesktopRoomTitleCopy } from '../../constants/desktopRoomTitles';
import type { DesktopLoungeSlayCinemaMode } from '../../constants/desktopLoungeSlayCinema';
import { DesktopRoomTitle } from './DesktopRoomTitle';
import './DesktopZoneRoomScene.css';

const ZONE_TRANSITION_MS = 880;

type ZoneBackgroundProps = {
  zoneId: string;
  className: string;
  resolveBackground: (zoneId: string) => string;
  resolveFallbackBackground?: (zoneId: string) => string;
  onReadyChange?: (ready: boolean) => void;
  slayCinema?: DesktopLoungeSlayCinemaMode;
};

function ZoneBackground({
  zoneId,
  className,
  resolveBackground,
  resolveFallbackBackground,
  onReadyChange,
  slayCinema,
}: ZoneBackgroundProps) {
  const targetSrc = resolveBackground(zoneId);
  const fallbackSrc = resolveFallbackBackground?.(zoneId);
  const crossfadeMs = slayCinema?.crossfadeMs ?? 550;
  const useCinemaDimmed = Boolean(slayCinema?.enabled);
  const brightSrc = slayCinema?.brightSrc ?? targetSrc;
  const dimmedSrc = slayCinema?.dimmedSrc;

  const [displayBrightSrc, setDisplayBrightSrc] = useState(() => {
    const cached = getLastDesktopRoomBackground();
    if (cached && (!dimmedSrc || cached === brightSrc || cached === dimmedSrc)) return cached;
    if (isDesktopRoomBackgroundLoaded(brightSrc)) return brightSrc;
    return brightSrc;
  });
  const [displayDimmedSrc, setDisplayDimmedSrc] = useState(dimmedSrc ?? '');
  const [dimmedReady, setDimmedReady] = useState(() =>
    dimmedSrc ? isDesktopRoomBackgroundLoaded(dimmedSrc) : true,
  );

  useEffect(() => {
    let cancelled = false;
    const target = resolveBackground(zoneId);
    const fallback = resolveFallbackBackground?.(zoneId);
    const primary = slayCinema?.brightSrc ?? target;
    const alternate = slayCinema?.dimmedSrc;

    const markReady = (src: string) => {
      onReadyChange?.(true);
      setLastDesktopRoomBackground(src);
    };

    const loadPrimary = async () => {
      if (isDesktopRoomBackgroundLoaded(primary)) {
        if (!cancelled) setDisplayBrightSrc(primary);
        return primary;
      }
      onReadyChange?.(false);
      const loaded = await preloadDesktopRoomBackground(primary, fallback);
      if (!cancelled) setDisplayBrightSrc(loaded);
      return loaded;
    };

    const loadAlternate = async () => {
      if (!alternate) {
        setDimmedReady(true);
        return;
      }
      if (isDesktopRoomBackgroundLoaded(alternate)) {
        if (!cancelled) {
          setDisplayDimmedSrc(alternate);
          setDimmedReady(true);
        }
        return;
      }
      const loaded = await preloadDesktopRoomBackground(alternate, primary);
      if (!cancelled) {
        setDisplayDimmedSrc(loaded);
        setDimmedReady(true);
      }
    };

    void Promise.all([loadPrimary(), loadAlternate()]).then(([loadedPrimary]) => {
      if (cancelled) return;
      markReady(loadedPrimary);
    });

    return () => {
      cancelled = true;
    };
  }, [
    zoneId,
    resolveBackground,
    resolveFallbackBackground,
    onReadyChange,
    slayCinema?.brightSrc,
    slayCinema?.dimmedSrc,
  ]);

  useEffect(() => {
    if (!dimmedSrc) return;
    const activeSrc = useCinemaDimmed ? dimmedSrc : brightSrc;
    setLastDesktopRoomBackground(activeSrc);
  }, [useCinemaDimmed, dimmedSrc, brightSrc]);

  const handleBrightLoad = useCallback(() => {
    if (!useCinemaDimmed) setLastDesktopRoomBackground(displayBrightSrc);
  }, [displayBrightSrc, useCinemaDimmed]);

  const handleDimmedLoad = useCallback(() => {
    if (useCinemaDimmed && displayDimmedSrc) setLastDesktopRoomBackground(displayDimmedSrc);
  }, [displayDimmedSrc, useCinemaDimmed]);

  const bgClass = `desktop-zone-room-scene__bg ${className}`.trim();
  const crossfadeStyle = {
    transition: `opacity ${crossfadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  };

  if (dimmedSrc) {
    return (
      <div className="desktop-zone-room-scene__bg-stack" aria-hidden>
        <img
          src={displayBrightSrc}
          alt=""
          draggable={false}
          className={`${bgClass} desktop-zone-room-scene__bg-layer`}
          style={{
            ...crossfadeStyle,
            opacity: useCinemaDimmed ? 0 : 1,
          }}
          onLoad={handleBrightLoad}
          onError={() => {
            if (!fallbackSrc || displayBrightSrc === fallbackSrc) return;
            void preloadDesktopRoomBackground(fallbackSrc).then((loaded) => {
              setDisplayBrightSrc(loaded);
              if (!useCinemaDimmed) {
                setLastDesktopRoomBackground(loaded);
                onReadyChange?.(true);
              }
            });
          }}
        />
        {displayDimmedSrc ? (
          <img
            src={displayDimmedSrc}
            alt=""
            draggable={false}
            className={`${bgClass} desktop-zone-room-scene__bg-layer`}
            style={{
              ...crossfadeStyle,
              opacity: useCinemaDimmed && dimmedReady ? 1 : 0,
            }}
            onLoad={handleDimmedLoad}
            onError={() => {
              if (!useCinemaDimmed) return;
              setDisplayBrightSrc(displayBrightSrc);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={displayBrightSrc}
      alt=""
      draggable={false}
      className={bgClass}
      onLoad={() => {
        setLastDesktopRoomBackground(displayBrightSrc);
      }}
      onError={() => {
        if (!fallbackSrc || displayBrightSrc === fallbackSrc) return;
        void preloadDesktopRoomBackground(fallbackSrc).then((loaded) => {
          setDisplayBrightSrc(loaded);
          setLastDesktopRoomBackground(loaded);
          onReadyChange?.(true);
        });
      }}
    />
  );
}

function ZoneRoomTitle({
  zoneId,
  measureRef,
}: {
  zoneId: string;
  measureRef: RefObject<HTMLElement | null>;
}) {
  const copy = resolveDesktopRoomTitleCopy(zoneId);
  if (!copy) return null;

  return (
    <DesktopRoomTitle
      zoneId={zoneId}
      title={copy.title}
      subtitle={copy.subtitle}
      placement={resolveDesktopRoomTitlePlacement(zoneId)}
      measureRef={measureRef}
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
  loungeSlayCinema?: DesktopLoungeSlayCinemaMode | null;
};

export function DesktopZoneRoomScene({
  zoneIds,
  zoneIndex,
  resolveBackground,
  resolveFallbackBackground,
  className = '',
  onBackgroundReadyChange,
  loungeSlayCinema = null,
}: DesktopZoneRoomSceneProps) {
  const [activeIndex, setActiveIndex] = useState(zoneIndex);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const layerMeasureRef = useRef<HTMLDivElement>(null);

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

  const resolveSlayCinemaForZone = useCallback(
    (id: string): DesktopLoungeSlayCinemaMode | undefined => {
      if (id !== 'lounge' || !loungeSlayCinema) return undefined;
      return loungeSlayCinema;
    },
    [loungeSlayCinema],
  );

  if (!activeZoneId) return null;

  return (
    <div
      className={`desktop-zone-room-scene${artboard ? ' desktop-zone-room-scene--artboard' : ''} ${className}`.trim()}
      aria-hidden
    >
      {!isTransitioning ? (
        <div ref={layerMeasureRef} className="desktop-zone-room-scene__layer">
          <ZoneBackground
            zoneId={activeZoneId}
            className="desktop-zone-room-scene__bg desktop-zone-room-scene__bg--steady"
            resolveBackground={resolveBackground}
            resolveFallbackBackground={resolveFallbackBackground}
            onReadyChange={handleReadyChange}
            slayCinema={resolveSlayCinemaForZone(activeZoneId)}
          />
          <ZoneRoomTitle zoneId={activeZoneId} measureRef={layerMeasureRef} />
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
                slayCinema={resolveSlayCinemaForZone(leavingZoneId)}
              />
            </div>
          ) : null}
          <div ref={layerMeasureRef} className="desktop-zone-room-scene__layer">
            <ZoneBackground
              zoneId={activeZoneId}
              className="desktop-zone-room-scene__bg desktop-zone-room-scene__bg--enter"
              resolveBackground={resolveBackground}
              resolveFallbackBackground={resolveFallbackBackground}
              onReadyChange={handleReadyChange}
              slayCinema={resolveSlayCinemaForZone(activeZoneId)}
            />
            <ZoneRoomTitle zoneId={activeZoneId} measureRef={layerMeasureRef} />
          </div>
        </>
      )}
    </div>
  );
}
