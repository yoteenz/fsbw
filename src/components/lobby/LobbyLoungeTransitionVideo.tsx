import React, { useCallback, useEffect, useRef } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import { sceneCarouselSlideMinHeightCss } from '../../utils/sceneCarouselBackground';

type Props = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

/**
 * Middle carousel panel: Seedance lobby ↔ lounge clip (forward or reverse).
 */
export const LobbyLoungeTransitionSlide: React.FC<Props> = ({ active, direction, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const src = lobbyLoungeTransitionVideoSrc(direction);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      return;
    }
    completedRef.current = false;
    const el = videoRef.current;
    if (!el) return;

    const playWithRetry = async () => {
      try {
        el.load();
        if (direction === 'reverse' && Number.isFinite(el.duration) && el.duration > 0) {
          el.currentTime = Math.max(0, el.duration - 0.05);
        } else {
          el.currentTime = 0;
        }
        await el.play();
      } catch {
        try {
          await new Promise((r) => setTimeout(r, 120));
          await el.play();
        } catch {
          finish();
        }
      }
    };

    void playWithRetry();

    let timer = window.setTimeout(finish, 12000);
    const setTimerFromMeta = () => {
      window.clearTimeout(timer);
      const ms = Number.isFinite(el.duration) ? el.duration * 1000 + 400 : 6000;
      timer = window.setTimeout(finish, ms);
    };
    el.addEventListener('loadedmetadata', setTimerFromMeta);
    if (el.readyState >= 1) setTimerFromMeta();

    return () => {
      window.clearTimeout(timer);
      el.removeEventListener('loadedmetadata', setTimerFromMeta);
    };
  }, [active, direction, finish, src]);

  return (
    <div
      className="relative"
      style={{
        width: '100vw',
        flexShrink: 0,
        minHeight: sceneCarouselSlideMinHeightCss(),
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
      aria-hidden={!active}
    >
      <video
        key={`${direction}-${src}`}
        ref={videoRef}
        playsInline
        muted
        preload="auto"
        onEnded={finish}
        onError={finish}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          pointerEvents: 'none',
        }}
      >
        <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
        <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
      </video>
    </div>
  );
};
