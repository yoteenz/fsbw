import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoungeTvMediaState } from './loungeTvStreamingMedia';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import {
  applyLoungeTvDecorativeMotionPlayback,
  applyLoungeTvMutedPlayback,
  LOUNGE_TV_DECORATIVE_MOTION_ATTR,
  loungeTvVideoMayPlayUserAudio,
  pauseLoungeTvVideo,
  playLoungeTvDecorativeMotion,
  playLoungeTvMuted,
} from './loungeTvMutedPlayback';

export type LoungeTvVideoPreviewProps = {
  src?: string;
  poster?: string;
  /** When false, video element stays mounted but playback pauses. */
  active?: boolean;
  loop?: boolean;
  muted?: boolean;
  /** Silent decorative loop — animation only; never joins audio-capable playback logic. */
  decorativeMotion?: boolean;
  className?: string;
  ariaLabel?: string;
  objectFit?: 'cover' | 'contain';
  onReady?: () => void;
  onError?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  style?: React.CSSProperties;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LoungeTvVideoPreview({
  src,
  poster,
  active = true,
  loop = true,
  muted = true,
  decorativeMotion = false,
  ariaLabel = 'Video preview',
  objectFit = 'cover',
  className,
  onReady,
  onError,
  onPlayingChange,
  style,
}: LoungeTvVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaState, setMediaState] = useState<LoungeTvMediaState>(() =>
    src && !prefersReducedMotion() ? 'loading' : 'idle'
  );
  const [videoVisible, setVideoVisible] = useState(false);

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src || !active) return;
    if (prefersReducedMotion()) {
      setMediaState('paused');
      return;
    }
    const useDecorative = decorativeMotion || (muted && !loungeTvVideoMayPlayUserAudio(video));
    try {
      if (useDecorative) {
        await playLoungeTvDecorativeMotion(video);
      } else if (muted) {
        await playLoungeTvMuted(video);
      } else {
        video.muted = false;
        video.defaultMuted = false;
        video.volume = 1;
        video.removeAttribute('muted');
        video.removeAttribute(LOUNGE_TV_DECORATIVE_MOTION_ATTR);
        await video.play();
      }
      setMediaState('playing');
      setVideoVisible(true);
    } catch {
      setMediaState('paused');
    }
  }, [active, decorativeMotion, muted, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || !src) {
      pauseLoungeTvVideo(video);
      setMediaState(src ? 'paused' : 'idle');
      return;
    }
    if (prefersReducedMotion()) {
      pauseLoungeTvVideo(video);
      setMediaState('paused');
      return;
    }
    setMediaState('loading');
    void tryPlay();
  }, [active, src, tryPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (decorativeMotion) {
      applyLoungeTvDecorativeMotionPlayback(video);
      return;
    }
    if (muted) {
      applyLoungeTvMutedPlayback(video);
    } else {
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      video.removeAttribute('muted');
      video.removeAttribute(LOUNGE_TV_DECORATIVE_MOTION_ATTR);
    }
  }, [decorativeMotion, muted]);

  useEffect(() => {
    return () => {
      pauseLoungeTvVideo(videoRef.current);
    };
  }, []);

  const showPoster = poster && (!videoVisible || mediaState === 'error' || mediaState === 'loading');
  const showLoading = mediaState === 'loading' && src && !prefersReducedMotion();
  const showUnavailable = mediaState === 'error' && !poster;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0a0a0a',
        ...style,
      }}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          draggable={false}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: showPoster ? 1 : 0,
            transition: 'opacity 0.55s ease',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          muted={muted}
          loop={loop}
          preload="metadata"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          aria-label={ariaLabel}
          onCanPlay={() => {
            setMediaState('ready');
            onReady?.();
            void tryPlay();
          }}
          onPlaying={() => {
            setMediaState('playing');
            setVideoVisible(true);
            onPlayingChange?.(true);
          }}
          onPause={() => {
            setMediaState((s) => (s === 'error' ? s : 'paused'));
            onPlayingChange?.(false);
          }}
          onError={() => {
            setMediaState('error');
            setVideoVisible(false);
            onError?.();
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: videoVisible && mediaState !== 'error' ? 1 : 0,
            transition: 'opacity 0.55s ease',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {showLoading ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            className="lounge-tv-media-spinner"
            style={{
              width: loungeTvGlassCqw(2.5, 6, 12),
              height: loungeTvGlassCqw(2.5, 6, 12),
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: 'rgba(255,255,255,0.85)',
              borderRadius: '50%',
            }}
          />
        </div>
      ) : null}

      {mediaState === 'error' && poster ? (
        <span
          style={{
            position: 'absolute',
            bottom: loungeTvGlassCqw(1, 2.5, 5),
            right: loungeTvGlassCqw(1, 2.5, 5),
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          PREVIEW TEMPORARILY UNAVAILABLE
        </span>
      ) : null}

      {showUnavailable ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: loungeTvGlassCqw(2, 5, 10),
            background: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 55%, #111 100%)',
          }}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            PREVIEW TEMPORARILY UNAVAILABLE
          </span>
        </div>
      ) : null}
    </div>
  );
}
