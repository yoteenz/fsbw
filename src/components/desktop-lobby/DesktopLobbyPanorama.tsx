import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX,
  DESKTOP_LOBBY_PANORAMA_ROOMS,
  computeDesktopLobbyPanoramaTransform,
} from '../../constants/desktopLobbyPanorama';
import { DESKTOP_LOBBY_BG_URL, DESKTOP_LOUNGE_BG_FALLBACK } from '../../constants/desktopLobbyEnv';

type DesktopLobbyPanoramaProps = {
  roomIndex?: number;
  onRoomIndexChange?: (index: number) => void;
  className?: string;
};

export function DesktopLobbyPanorama({
  roomIndex: roomIndexProp,
  onRoomIndexChange,
  className = '',
}: DesktopLobbyPanoramaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [internalRoomIndex, setInternalRoomIndex] = useState(DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX);
  const [bgSrc, setBgSrc] = useState(DESKTOP_LOBBY_BG_URL);
  const [metrics, setMetrics] = useState({ width: 1920, height: 1080 });

  const roomIndex = roomIndexProp ?? internalRoomIndex;
  const setRoomIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(DESKTOP_LOBBY_PANORAMA_ROOMS.length - 1, next));
      if (roomIndexProp === undefined) setInternalRoomIndex(clamped);
      onRoomIndexChange?.(clamped);
    },
    [onRoomIndexChange, roomIndexProp],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setMetrics({ width: rect.width, height: rect.height });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setRoomIndex(roomIndex - 1);
      if (e.key === 'ArrowRight') setRoomIndex(roomIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [roomIndex, setRoomIndex]);

  const { translateX, translateY, scale, imageWidth, imageHeight } = computeDesktopLobbyPanoramaTransform(
    metrics.width,
    metrics.height,
    roomIndex,
  );

  return (
    <div
      ref={viewportRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <img
        src={bgSrc}
        alt=""
        draggable={false}
        onError={() => setBgSrc(DESKTOP_LOUNGE_BG_FALLBACK)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          maxWidth: 'none',
          display: 'block',
          transformOrigin: 'top left',
          transition: 'transform 0.85s cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: 'transform',
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        }}
      />
    </div>
  );
}
