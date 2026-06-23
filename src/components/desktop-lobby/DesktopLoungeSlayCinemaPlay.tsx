import { useCallback, type RefObject } from 'react';
import {
  DESKTOP_LOUNGE_ART_HEIGHT,
  DESKTOP_LOUNGE_ART_WIDTH,
  DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
  DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
  DESKTOP_LOUNGE_TV_PLAY_TAP_LAYOUT,
  DESKTOP_LOUNGE_TV_PLAY_TAP_RECT,
} from '../../constants/desktopLoungeTvLayout';
import {
  LOUNGE_TV_PRESS_PLAY_LABEL,
  LOUNGE_TV_PRESS_PLAY_LABEL_STYLE,
} from '../../constants/loungeTvPressPlay';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { sceneHitLayoutBoxStyle } from '../../utils/sceneHitLayout';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  isSlayCinemaEnabled: boolean;
  onToggleSlayCinema: () => void;
  active: boolean;
};

/**
 * Desktop TV Lounge — same pulsing PRESS TO PLAY cue as mobile, toggles Slay Cinema
 * (bright ↔ dimmed background) instead of opening the lounge TV animation.
 */
export function DesktopLoungeSlayCinemaPlay({
  measureRef,
  isSlayCinemaEnabled,
  onToggleSlayCinema,
  active,
}: Props) {
  const playTapMapped = useSceneCoverHitRect(
    DESKTOP_LOUNGE_TV_PLAY_TAP_RECT,
    measureRef,
    {
      x: DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
      y: DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
    },
    { width: DESKTOP_LOUNGE_ART_WIDTH, height: DESKTOP_LOUNGE_ART_HEIGHT },
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggleSlayCinema();
      }
    },
    [onToggleSlayCinema],
  );

  if (!active || !playTapMapped) return null;

  const playContainerStyle = {
    ...sceneHitLayoutBoxStyle(
      playTapMapped,
      DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
      DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
      DESKTOP_LOUNGE_TV_PLAY_TAP_LAYOUT,
    ),
    position: 'absolute' as const,
    zIndex: 12,
    pointerEvents: 'auto' as const,
  };

  return (
    <div data-desktop-lounge-slay-cinema-play style={playContainerStyle}>
      <button
        type="button"
        data-desktop-lounge-slay-cinema-toggle
        onClick={onToggleSlayCinema}
        onKeyDown={onKeyDown}
        aria-label="Toggle Slay Cinema mode"
        aria-pressed={isSlayCinemaEnabled}
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 8,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <span aria-hidden style={LOUNGE_TV_PRESS_PLAY_LABEL_STYLE}>
          {LOUNGE_TV_PRESS_PLAY_LABEL}
        </span>
      </button>
    </div>
  );
}
