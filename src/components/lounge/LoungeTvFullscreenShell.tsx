import type React from 'react';
import {
  LOUNGE_TV_CONTENT_FRAME_CLOSE_ANCHOR,
  LOUNGE_TV_CONTENT_FRAME_PX,
  LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
  LOUNGE_TV_CONTENT_FRAME_SRC,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX,
  LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX,
} from './loungeTvAssets';
import { LoungeTvCloseButton } from './loungeTvFrame';
import { useCoverMappedLayout } from '../../hooks/useCoverMappedLayout';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';

type Props = {
  children?: React.ReactNode;
  screenStyle?: React.CSSProperties;
  closeVisible?: boolean;
  onClose?: (e: React.MouseEvent) => void;
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
  zIndex = 110,
}: Props) {
  const closePoint = {
    x: 1 - LOUNGE_TV_CONTENT_FRAME_CLOSE_ANCHOR.right,
    y: LOUNGE_TV_CONTENT_FRAME_CLOSE_ANCHOR.top,
  };

  const { mappedScreen, mappedClose } = useCoverMappedLayout(
    LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
    LOUNGE_TV_CONTENT_FRAME_PX.width,
    LOUNGE_TV_CONTENT_FRAME_PX.height,
    closePoint,
  );

  const frameStillOffsetX = LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX;
  const frameStillOffsetY = LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX;
  const screenOffsetY = LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX;
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
      }}
    >
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
      <div
        style={{
          ...rectToPercentStyle(mappedScreen),
          position: 'absolute',
          boxSizing: 'border-box',
          overflow: 'hidden',
          zIndex: 1,
          ...screenStyle,
          transform: screenOffsetY ? `translateY(${screenOffsetY}px)` : undefined,
        }}
      >
        {children}
      </div>
      {onClose && mappedClose ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            transform: frameStillTransform,
          }}
        >
          <LoungeTvCloseButton
            visible={closeVisible}
            position={{
              left: `${mappedClose.left * 100}%`,
              top: `${mappedClose.top * 100}%`,
              right: 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
