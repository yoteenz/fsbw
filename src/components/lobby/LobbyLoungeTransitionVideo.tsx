import React, { useCallback, useEffect, useRef } from 'react';
import {
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_SRC,
} from '../../constants/lobbyLoungeTransitionVideo';

type Props = {
  active: boolean;
  onComplete: () => void;
  onSkip?: () => void;
};

/**
 * Full-viewport lobby → lounge transition clip. Sits above the carousel during playback.
 */
export const LobbyLoungeTransitionVideo: React.FC<Props> = ({ active, onComplete, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

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
        el.currentTime = 0;
        el.load();
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

    let timer = window.setTimeout(finish, 8000);
    const setTimerFromMeta = () => {
      window.clearTimeout(timer);
      const ms = Number.isFinite(el.duration) ? el.duration * 1000 + 500 : 6000;
      timer = window.setTimeout(finish, ms);
    };
    el.addEventListener('loadedmetadata', setTimerFromMeta);
    if (el.readyState >= 1) setTimerFromMeta();

    return () => {
      window.clearTimeout(timer);
      el.removeEventListener('loadedmetadata', setTimerFromMeta);
    };
  }, [active, finish]);

  if (!active) return null;

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483640,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
      onClick={() => onSkip?.()}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        preload="auto"
        onEnded={finish}
        onError={finish}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      >
        <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_SRC} type="video/mp4" />
        <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
      </video>
      {onSkip ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          style={{
            position: 'absolute',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            right: 16,
            zIndex: 2,
            padding: '8px 14px',
            fontSize: 11,
            fontFamily: 'inherit',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid #000',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      ) : null}
    </div>
  );
};
