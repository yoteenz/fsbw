import type React from 'react';
import type { RefObject } from 'react';
import { LOUNGE_TV_CONTENT_FRAME_SRC } from './loungeTvAssets';
import { LoungeTvCloseButton } from './loungeTvFrame';
import {
  LOUNGE_TV_GLASS_CLOSE_ICON_SIZE,
  LOUNGE_TV_GLASS_CLOSE_SIZE,
  LOUNGE_TV_GLASS_CONTAINER_STYLE,
} from './loungeTvResponsive';
import {
  LOUNGE_TV_MENU_CLOSE_INSET_RIGHT_RATIO,
  LOUNGE_TV_MENU_CLOSE_INSET_TOP_RATIO,
  LOUNGE_TV_MENU_FRAME_STILL_OFFSET_RATIO,
  LOUNGE_TV_MENU_SCREEN_IMAGE,
  LOUNGE_TV_MENU_SCREEN_OFFSET,
  LOUNGE_TV_MENU_SCREEN_RECT,
} from '../../constants/loungeTvSceneLayout';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { sceneCarouselCoverBackgroundPosition } from '../../utils/sceneCarouselBackground';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';
import { useLoungeTvGlassHitDebugEnabled } from '../../utils/sceneHitDebug';

type Props = {
  children?: React.ReactNode;
  screenStyle?: React.CSSProperties;
  closeVisible?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  /** During Seedance close — no black viewport flash under reverse clip. */
  backdropTransparent?: boolean;
  /** Override stack order (e.g. power-off kickoff above reverse clip). */
  zIndex?: number;
  /** {@link SceneCarouselViewportStage} — maps TV glass to the lounge scene box. */
  viewportMeasureRef?: RefObject<HTMLElement | null>;
};

/**
 * Full-viewport TV menu — transparent glass box scene-locked to the theater TV on the
 * lounge composite (`cover` + `center top`), with optional end-still PNG behind it.
 */
export function LoungeTvFullscreenShell({
  children,
  screenStyle,
  closeVisible = false,
  onClose,
  backdropTransparent = false,
  zIndex = 110,
  viewportMeasureRef,
}: Props) {
  const mappedGlass = useSceneCoverHitRect(
    LOUNGE_TV_MENU_SCREEN_RECT,
    viewportMeasureRef ?? { current: null },
    LOUNGE_TV_MENU_SCREEN_OFFSET,
    LOUNGE_TV_MENU_SCREEN_IMAGE,
  );

  const showGlassDebug = useLoungeTvGlassHitDebugEnabled();

  const stillNudgeX = LOUNGE_TV_MENU_FRAME_STILL_OFFSET_RATIO.x * 100;
  const stillNudgeY = LOUNGE_TV_MENU_FRAME_STILL_OFFSET_RATIO.y * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lounge media"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        overflow: 'hidden',
        backgroundColor: backdropTransparent ? 'transparent' : '#000000',
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
            backgroundPosition: sceneCarouselCoverBackgroundPosition(),
            backgroundRepeat: 'no-repeat',
            transform: `translate(${stillNudgeX}%, ${stillNudgeY}%)`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {mappedGlass ? (
        <div
          data-lounge-tv-glass
          style={{
            ...rectToPercentStyle(mappedGlass),
            position: 'absolute',
            boxSizing: 'border-box',
            zIndex: 1,
            ...LOUNGE_TV_GLASS_CONTAINER_STYLE,
            pointerEvents: 'auto',
            background: showGlassDebug ? 'rgba(235, 28, 36, 0.12)' : 'transparent',
            outline: showGlassDebug ? '1px dashed rgba(235, 28, 36, 0.65)' : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              ...screenStyle,
            }}
          >
            {children}
            {onClose ? (
              <LoungeTvCloseButton
                visible={closeVisible}
                size={LOUNGE_TV_GLASS_CLOSE_SIZE}
                iconSize={LOUNGE_TV_GLASS_CLOSE_ICON_SIZE}
                position={{
                  top: `${LOUNGE_TV_MENU_CLOSE_INSET_TOP_RATIO * 100}%`,
                  right: `${LOUNGE_TV_MENU_CLOSE_INSET_RIGHT_RATIO * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(e);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
