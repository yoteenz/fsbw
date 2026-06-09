import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveWatchLearnDescription, type LoungeTvVideoTile } from './loungeTvContent';
import { formatLoungeTvVideoDuration } from './loungeTvVideoUtils';
import { useSceneHitRegionConfig } from '../lobby/SceneHitLayoutEditorContext';
import { LoungeTvInnerLayoutEditor } from './LoungeTvInnerLayoutEditor';
import { loungeTvVideoShellStyle } from '../../utils/loungeTvInnerLayout';

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

function isSameOriginMediaUrl(url: string): boolean {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function LoungeTvWatchLearnPlayer({ tile }: LoungeTvWatchLearnPlayerProps) {
  const videoFrameRegion = useSceneHitRegionConfig('lounge-tv-video-frame');
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const isScrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const [videoSrc, setVideoSrc] = useState(tile.videoSrc ?? '');
  const [paused, setPaused] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const syncTimeFromVideo = useCallback(() => {
    if (isScrubbingRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
  }, []);

  useEffect(() => {
    const src = tile.videoSrc ?? '';
    setVideoSrc(src);
    if (!src) return;

    let cancelled = false;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Same-origin MP4 is seekable directly — blob swap reloads mid-session and breaks scrub.
    if (isSameOriginMediaUrl(src)) return;

    void fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const video = videoRef.current;
        const resumeTime = video?.currentTime ?? 0;
        const resumePaused = video?.paused ?? false;
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setVideoSrc(blobUrl);
        if (!video) return;
        const restore = () => {
          if (resumeTime > 0) video.currentTime = resumeTime;
          if (resumePaused) {
            video.pause();
            setPaused(true);
          } else {
            void video.play();
            setPaused(false);
          }
          setCurrentTime(video.currentTime);
          if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
        };
        if (video.readyState >= 1) restore();
        else video.addEventListener('loadedmetadata', restore, { once: true });
      })
      .catch(() => {
        if (!cancelled) setVideoSrc(src);
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [tile.id, tile.videoSrc]);

  useEffect(() => {
    if (!tile.videoSrc) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    const syncPaused = () => setPaused(video.paused);
    const playPromise = video.play();
    if (playPromise) {
      void playPromise.then(syncPaused).catch(syncPaused);
    } else {
      syncPaused();
    }
  }, [tile.id]);

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
    if (isScrubbingRef.current) return;
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

  const applySeekTime = useCallback((next: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(next)) return;
    const clamped = Math.max(0, next);
    try {
      video.currentTime = clamped;
    } catch {
      /* ignore seek errors before metadata */
    }
    setCurrentTime(clamped);
  }, []);

  const handleSeekInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applySeekTime(Number(e.target.value));
    },
    [applySeekTime],
  );

  const beginScrub = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      cancelPendingTap();
      const video = videoRef.current;
      wasPlayingBeforeScrubRef.current = video ? !video.paused : false;
      if (video && !video.paused) {
        video.pause();
        setPaused(true);
      }
      isScrubbingRef.current = true;
      setIsScrubbing(true);
      if (e.currentTarget instanceof Element && e.currentTarget.setPointerCapture) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    },
    [cancelPendingTap],
  );

  const endScrub = useCallback(() => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    setIsScrubbing(false);
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (wasPlayingBeforeScrubRef.current) {
      void video.play();
      setPaused(false);
    }
  }, []);

  useEffect(() => {
    if (!isScrubbing) return;
    const finish = () => endScrub();
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
  }, [isScrubbing, endScrub]);

  const handleShellPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbingRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-lounge-tv-seek]')) return;
    // Keep vertical scroll on the media panel from stealing tap-to-pause on the video.
    if (e.pointerType === 'touch') e.preventDefault();
  }, []);

  if (!tile.videoSrc) return null;

  const shellHeightExtraPx = videoFrameRegion.layout.layoutHeightExtraPx ?? 0;
  const shellScaleY = videoFrameRegion.layout.layoutScale?.y ?? 1;
  const shellAspectPaddingTop =
    shellHeightExtraPx > 0
      ? `calc(100% * ${9 * shellScaleY} / 16 + ${shellHeightExtraPx}px)`
      : `calc(100% * ${9 * shellScaleY} / 16)`;

  const seekMax = duration > 0 ? duration : Math.max(currentTime, 1);
  const elapsedLabel = formatLoungeTvVideoDuration(currentTime);
  const totalLabel = duration > 0 ? formatLoungeTvVideoDuration(duration) : '—';
  const progressLabel =
    duration > 0 ? `${elapsedLabel}/${totalLabel}` : elapsedLabel !== '—' ? `${elapsedLabel}/—` : '—';
  const detailText = resolveWatchLearnDescription(tile);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: 0,
        textTransform: 'uppercase',
        boxSizing: 'border-box',
      }}
    >
        <LoungeTvInnerLayoutEditor
          regionId="lounge-tv-video-frame"
          label="watch+learn video"
          layout={videoFrameRegion.layout}
          style={{
            position: 'relative',
            ...loungeTvVideoShellStyle(videoFrameRegion.layout),
            width: '100%',
            height: 0,
            paddingTop: shellAspectPaddingTop,
            background: '#000000',
            overflow: 'visible',
            cursor: 'pointer',
            flexShrink: 0,
            touchAction: 'none',
          }}
          debugOutline={{
            backgroundColor: 'rgba(0, 188, 212, 0.15)',
            border: '2px dashed rgba(0, 151, 167, 0.95)',
          }}
        >
          <div
            ref={shellRef}
            style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none' }}
            onPointerDown={handleShellPointerDown}
            onPointerUp={handleVideoPointerUp}
            onDoubleClick={handleVideoDoubleClick}
          >
            <video
              key={tile.id}
              ref={videoRef}
              src={videoSrc}
              playsInline
              loop
              preload="auto"
              controls={false}
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
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
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none',
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

            {paused || isScrubbing ? (
              <div
                data-lounge-tv-seek
                role="group"
                aria-label="Video seek"
                onPointerDown={beginScrub}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  endScrub();
                }}
                onPointerCancel={(e) => {
                  e.stopPropagation();
                  endScrub();
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  padding: '10px 6px 8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
                  boxSizing: 'border-box',
                  touchAction: 'pan-x',
                  pointerEvents: 'auto',
                }}
              >
                <input
                  type="range"
                  className="lounge-tv-seek-range"
                  min={0}
                  max={seekMax}
                  step={0.05}
                  value={Math.min(currentTime, seekMax)}
                  onChange={handleSeekInput}
                  onInput={handleSeekInput}
                  onPointerDown={beginScrub}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    endScrub();
                  }}
                  onPointerCancel={(e) => {
                    e.stopPropagation();
                    endScrub();
                  }}
                  aria-label="Seek video"
                  aria-valuemin={0}
                  aria-valuemax={seekMax}
                  aria-valuenow={currentTime}
                />
              </div>
            ) : null}

            {!paused ? (
              <button
                type="button"
                aria-label="Full screen"
                onPointerDown={handleFullscreenPress}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={handleFullscreenPress}
                style={{
                  position: 'absolute',
                  right: '5px',
                  bottom: '5px',
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
                  pointerEvents: 'auto',
                }}
              >
                <FullscreenExpandIcon />
              </button>
            ) : null}
          </div>
        </LoungeTvInnerLayoutEditor>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
            flexShrink: 0,
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
              fontFamily: TIME_FONT,
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

      {detailText ? (
        <p
          data-lounge-tv-description
          style={{
            margin: 0,
            fontFamily: BODY_FONT,
            fontSize: '7px',
            lineHeight: 1.35,
            color: BODY_GRAY,
            textAlign: 'left',
          }}
        >
          {detailText}
        </p>
      ) : null}
    </div>
  );
}
