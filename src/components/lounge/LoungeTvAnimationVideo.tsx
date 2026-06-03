import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
  LOUNGE_TV_ANIMATION_VIDEO_SRC,
  LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV,
  loungeTvAnimationFrameStyle,
  loungeTvAnimationFullBleedPosterStyle,
  loungeTvAnimationLetterboxBottomBandStyle,
  loungeTvAnimationLetterboxShellStyle,
  loungeTvAnimationLetterboxTopBandStyle,
  loungeTvAnimationMediaLayerStyle,
  loungeTvAnimationPosterInFrameStyle,
  loungeTvAnimationPosterSrc,
  loungeTvAnimationVideoSrc,
} from '../../constants/loungeTvAnimationVideo';
import { useLoungeTvAnimationLetterboxLayout } from '../../hooks/useLoungeTvAnimationLetterboxLayout';
import { useSceneCoverVideoPlayback, type SceneCoverVideoDirection } from '../../hooks/useSceneCoverVideoPlayback';

type Props = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  onComplete: () => void;
};

/** Full-screen TV open/close Seedance clip — full frame + transparent letterbox bands. */
export function LoungeTvAnimationVideo({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = loungeTvAnimationVideoSrc();
  const poster = loungeTvAnimationPosterSrc(direction);
  const letterbox = useLoungeTvAnimationLetterboxLayout();
  const showPoster = !frameVisible && poster;

  const finish = useCallback(() => {
    setFrameVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    if (el.dataset.sceneCoverSrc !== src) {
      el.dataset.sceneCoverSrc = src;
      el.load();
    }
  }, [src]);

  useSceneCoverVideoPlayback(videoRef, {
    active,
    direction,
    reversePlaybackRate: LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
    onComplete: finish,
    onPlaying: () => setFrameVisible(true),
    safetyTimeoutMs: 15000,
  });

  if (!active) return null;

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <div style={loungeTvAnimationLetterboxShellStyle()}>
        {showPoster ? (
          <div aria-hidden style={loungeTvAnimationFullBleedPosterStyle(poster)} />
        ) : null}
        <div aria-hidden style={loungeTvAnimationLetterboxTopBandStyle(letterbox.topBandPx)} />
        <div style={loungeTvAnimationFrameStyle(letterbox)}>
          {showPoster ? (
            <div aria-hidden style={loungeTvAnimationPosterInFrameStyle(poster, direction)} />
          ) : null}
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            onError={finish}
            style={{
              ...loungeTvAnimationMediaLayerStyle(direction),
              opacity: frameVisible ? 1 : 0,
              transition: frameVisible ? 'opacity 60ms linear' : 'none',
            }}
          >
            <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC} type="video/mp4" />
            <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV} type="video/quicktime" />
          </video>
        </div>
        <div aria-hidden style={loungeTvAnimationLetterboxBottomBandStyle(letterbox.bottomBandPx)} />
      </div>
    </div>
  );
}
