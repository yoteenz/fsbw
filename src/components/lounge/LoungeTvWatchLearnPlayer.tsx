import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoungeTvVideoTile } from './loungeTvContent';

const BODY_FONT = '"Futura PT Medium", Futura, sans-serif';
const TAP_DELAY_MS = 280;

type LoungeTvWatchLearnPlayerProps = {
  tile: LoungeTvVideoTile;
};

export function LoungeTvWatchLearnPlayer({ tile }: LoungeTvWatchLearnPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !tile.videoSrc) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        /* autoplay may be blocked until interaction */
      });
    }
    setPaused(false);
  }, [tile.id, tile.videoSrc]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }, []);

  const enterFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) return;
    const request = video.requestFullscreen ?? (video as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
    if (request) {
      void Promise.resolve(request.call(video)).catch(() => undefined);
    }
  }, []);

  const handleVideoPointerUp = useCallback(() => {
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      togglePlay();
    }, TAP_DELAY_MS);
  }, [togglePlay]);

  const handleVideoDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      enterFullscreen();
    },
    [enterFullscreen]
  );

  if (!tile.videoSrc) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minHeight: 0,
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#0a0a0a',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <video
          ref={videoRef}
          src={tile.videoSrc}
          playsInline
          loop
          preload="auto"
          aria-label={tile.title}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onPointerUp={handleVideoPointerUp}
          onDoubleClick={handleVideoDoubleClick}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {paused ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: BODY_FONT,
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            PAUSED
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
        }}
      >
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: '8px',
            letterSpacing: '0.04em',
            color: '#ffffff',
            textTransform: 'uppercase',
            textAlign: 'left',
            flex: 1,
            minWidth: 0,
          }}
        >
          {tile.title}
        </span>
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: '7px',
            letterSpacing: '0.06em',
            color: '#9a9a9a',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {tile.durationLabel ?? '—'}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontFamily: BODY_FONT,
          fontSize: '7px',
          lineHeight: 1.35,
          color: '#b5b5b5',
          textAlign: 'left',
        }}
      >
        {tile.description}
      </p>
    </div>
  );
}
