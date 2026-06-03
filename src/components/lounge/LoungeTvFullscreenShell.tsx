import type React from 'react';
import {
  LOUNGE_TV_CONTENT_FRAME_PX,
  LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
  LOUNGE_TV_CONTENT_FRAME_SRC,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX,
  LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_RIGHT_PX,
  LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_TOP_PX,
  LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX,
  LOUNGE_TV_CONTENT_SCREEN_SCALE,
} from './loungeTvAssets';
import { LoungeTvCloseButton } from './loungeTvFrame';
import { useCoverMappedLayout } from '../../hooks/useCoverMappedLayout';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';

type Props = {
  children?: React.ReactNode;
  screenStyle?: React.CSSProperties;
  closeVisible?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  /** During Seedance close — no black viewport flash under reverse clip. */
  backdropTransparent?: boolean;
  /** Override stack order (e.g. power-off kickoff above reverse clip). */
  zIndex?: number;
};

/**
 * Full-viewport TV menu shell — `cover` + `center top` on the end-still PNG,
 * matching {@link LoungeTvAnimationVideo} geometry for a seamless handoff.
 */
export function LoungeTvFullscreenShell({
  children,
  screenStyle,
  closeVisible = false,
  onClose,
  backdropTransparent = false,
  zIndex = 110,
}: Props) {
  const { mappedScreen } = useCoverMappedLayout(
    LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
    LOUNGE_TV_CONTENT_FRAME_PX.width,
    LOUNGE_TV_CONTENT_FRAME_PX.height,
  );

  const frameStillOffsetX = LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX;
  const frameStillOffsetY = LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX;
  const screenTransform = `translateY(${LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX}px) scale(${LOUNGE_TV_CONTENT_SCREEN_SCALE})`;
  const frameStillTransform =
    frameStillOffsetX || frameStillOffsetY
      ? `translate(${frameStillOffsetX}px, ${frameStillOffsetY}px)`
      : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lounge media"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        overflow: 'hidden',
        backgroundColor: '#000000',
        pointerEvents: backdropTransparent ? 'none' : 'auto',
      }}
    >
      {!backdropTransparent ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${LOUNGE_TV_CONTENT_FRAME_SRC})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            transform: frameStillTransform,
          }}
        />
      ) : null}
      <div
        style={{
          ...rectToPercentStyle(mappedScreen),
          position: 'absolute',
          boxSizing: 'border-box',
          overflow: 'visible',
          zIndex: 1,
          ...screenStyle,
          transform: screenTransform,
          transformOrigin: 'center top',
        }}
      >
        {children}
        {onClose ? (
          <LoungeTvCloseButton
            visible={closeVisible}
            position={{
              top: LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_TOP_PX,
              right: LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_RIGHT_PX,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
