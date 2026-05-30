import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoungeTvVideoTile } from './loungeTvContent';
import { formatLoungeTvVideoDuration } from './loungeTvVideoUtils';

const BODY_FONT = '"Futura PT Medium", Futura, sans-serif';
const TIME_FONT = '"Futura PT Book", Futura, sans-serif';
const BRAND_RED = '#EB1C24';
const BODY_GRAY = '#808080';
const TAP_DELAY_MS = 280;

type LoungeTvWatchLearnPlayerProps = {
  tile: LoungeTvVideoTile;
};

function FullscreenExpandIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M8 4H4v4M16 4h4v4M16 20h4v-4M8 20H4v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

type VideoWithIosFullscreen = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

type ElementWithLegacyFullscreen = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function LoungeTvWatchLearnPlayer({ tile }: LoungeTvWatchLearnPlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const syncTimeFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !tile.videoSrc) return;
    video.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
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
      syncTimeFromVideo();
    }
  }, [syncTimeFromVideo]);

  const enterFullscreen = useCallback(() => {
    const video = videoRef.current as VideoWithIosFullscreen | null;
    const shell = shellRef.current;
    if (!video) return;

    try {
      if (typeof video.webkitEnterFullscreen === 'function') {
        video.webkitEnterFullscreen();
        return;
      }
    } catch {
      /* iOS may throw if not allowed */
    }

    const target: ElementWithLegacyFullscreen = (shell ?? video) as ElementWithLegacyFullscreen;
    if (document.fullscreenElement === target) return;

    const request =
      target.requestFullscreen?.bind(target) ??
      target.webkitRequestFullscreen?.bind(target);
    if (!request) return;

    void Promise.resolve(request()).catch(() => undefined);
  }, []);

  const cancelPendingTap = useCallback(() => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
  }, []);

  const handleVideoPointerUp = useCallback(() => {
    cancelPendingTap();
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      togglePlay();
    }, TAP_DELAY_MS);
  }, [cancelPendingTap, togglePlay]);

  const handleVideoDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      cancelPendingTap();
      enterFullscreen();
    },
    [cancelPendingTap, enterFullscreen]
  );

  const handleFullscreenPress = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      cancelPendingTap();
      enterFullscreen();
    },
    [cancelPendingTap, enterFullscreen]
  );

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    const video = videoRef.current;
    if (!video || !Number.isFinite(next)) return;
    video.currentTime = next;
    setCurrentTime(next);
  }, []);

  const handleControlsPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    cancelPendingTap();
  }, [cancelPendingTap]);

  if (!tile.videoSrc) return null;

  const seekMax = duration > 0 ? duration : Math.max(currentTime, 1);
  const elapsedLabel = formatLoungeTvVideoDuration(currentTime);
  const totalLabel = duration > 0 ? formatLoungeTvVideoDuration(duration) : '—';
  const progressLabel =
    duration > 0 ? `${elapsedLabel}/${totalLabel}` : elapsedLabel !== '—' ? `${elapsedLabel}/—` : '—';

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
        ref={shellRef}
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
          onPause={() => {
            setPaused(true);
            syncTimeFromVideo();
          }}
          onTimeUpdate={syncTimeFromVideo}
          onLoadedMetadata={syncTimeFromVideo}
          onLoadedData={syncTimeFromVideo}
          onDurationChange={syncTimeFromVideo}
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
              background: 'rgba(0,0,0,0.2)',
              paddingBottom: '22px',
            }}
          >
            PAUSED
          </span>
        ) : null}

        {paused ? (
          <div
            role="group"
            aria-label="Video seek"
            onPointerDown={handleControlsPointerDown}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              padding: '4px 28px 6px 6px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="range"
              className="lounge-tv-seek-range"
              min={0}
              max={seekMax}
              step={0.1}
              value={Math.min(currentTime, seekMax)}
              onChange={handleSeekChange}
              onInput={handleSeekChange}
              aria-label="Seek video"
              aria-valuemin={0}
              aria-valuemax={seekMax}
              aria-valuenow={currentTime}
            />
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Full screen"
          onPointerDown={handleFullscreenPress}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={handleFullscreenPress}
          style={{
            position: 'absolute',
            right: '5px',
            bottom: paused ? '20px' : '5px',
            zIndex: 10,
            width: '22px',
            height: '22px',
            margin: 0,
            padding: 0,
            border: 'none',
            borderRadius: '2px',
            background: 'rgba(0,0,0,0.5)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            transition: 'bottom 0.15s ease',
            pointerEvents: 'auto',
          }}
        >
          <FullscreenExpandIcon />
        </button>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '8px',
          minWidth: 0,
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
            flex: '1 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tile.title}
        </span>
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: '7px',
            letterSpacing: '0.06em',
            color: BRAND_RED,
            textTransform: 'uppercase',
            lineHeight: 1,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          aria-label={`Playback ${progressLabel}`}
        >
          {progressLabel}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontFamily: BODY_FONT,
          fontSize: '7px',
          lineHeight: 1.35,
          color: BODY_GRAY,
          textAlign: 'left',
        }}
      >
        {tile.description}
      </p>
    </div>
  );
}
