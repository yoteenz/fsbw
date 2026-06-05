import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import {
  LOUNGE_TV_ANIMATION_VIDEO_ENABLED,
  LOUNGE_TV_ANIMATION_VIDEO_SRC,
} from '../../constants/loungeTvAnimationVideo';
import {
  FINAL_LOUNGE_TV_HIT_REGION,
  FINAL_LOUNGE_TV_PLAY_TAP_RECT,
} from '../../constants/finalLobbySceneAssets';
import {
  LOUNGE_TV_MENU_SCREEN_IMAGE,
  LOUNGE_TV_MENU_SCREEN_OFFSET,
  LOUNGE_TV_MENU_SCREEN_RECT,
} from '../../constants/loungeTvSceneLayout';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { domRectRelativeToContainer } from '../../utils/sceneCoverContainerRect';
import { useSceneHitDebugEnabled, useSceneHitEditEnabled } from '../../utils/sceneHitDebug';
import { sceneHitLayoutBoxStyle } from '../../utils/sceneHitLayout';
import { SceneHitDebugBanner } from '../lobby/SceneHitDebugBanner';
import { SceneHitDebugOverlay } from '../lobby/SceneHitDebugOverlay';
import { useSceneHitRegionConfig } from '../lobby/SceneHitLayoutEditorContext';
import { SceneViewportOverlay } from '../lobby/SceneViewportOverlay';
import { LoungeTvOverlay } from './LoungeTvOverlay';

const PRESS_PLAY_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#808080',
  lineHeight: 1.2,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  animation: 'lounge-tv-press-play-pulse 1.6s ease-in-out infinite',
};

type Props = {
  /** {@link SceneCarouselViewportStage} root — `100dvh` cover box on `final-lounge.png`. */
  measureRef: RefObject<HTMLElement | null>;
};

/**
 * Tap-to-open for the TV baked into `final-lounge.png`.
 * Play target and overlay grow origin use cover-mapped rects on the viewport stage only
 * (not legacy `lounge-tv-design.png` layout).
 */
export function LoungeCompositeTvPlay({ measureRef }: Props) {
  const tvAnchorRef = useRef<HTMLDivElement>(null);
  const [tvOpen, setTvOpen] = useState(false);
  const [tvOriginRect, setTvOriginRect] = useState<DOMRect | null>(null);

  const hitDebug = useSceneHitDebugEnabled();
  const hitEdit = useSceneHitEditEnabled();
  const bakedRegion = useSceneHitRegionConfig('lounge-tv-baked');
  const contentPopupRegion = useSceneHitRegionConfig('lounge-tv-content-popup');
  const playTapRegion = useSceneHitRegionConfig('lounge-tv-play-tap');

  const tvRegion = useSceneCoverHitRect(FINAL_LOUNGE_TV_HIT_REGION, measureRef);
  const playTapMapped = useSceneCoverHitRect(FINAL_LOUNGE_TV_PLAY_TAP_RECT, measureRef);
  const contentPopupMapped = useSceneCoverHitRect(
    LOUNGE_TV_MENU_SCREEN_RECT,
    measureRef,
    LOUNGE_TV_MENU_SCREEN_OFFSET,
    LOUNGE_TV_MENU_SCREEN_IMAGE,
  );

  const playScreenOffsetX = playTapRegion.screenOffset?.x ?? 0;
  const playScreenOffsetY = playTapRegion.screenOffset?.y ?? 0;

  const openLoungeTv = useCallback(() => {
    const anchor = tvAnchorRef.current;
    const stage = measureRef.current;
    if (anchor && stage) {
      const r = domRectRelativeToContainer(anchor.getBoundingClientRect(), stage);
      setTvOriginRect(new DOMRect(r.left, r.top, r.width, r.height));
    } else {
      setTvOriginRect(anchor?.getBoundingClientRect() ?? null);
    }
    setTvOpen(true);
  }, [measureRef]);

  const closeLoungeTv = useCallback(() => {
    setTvOpen(false);
  }, []);

  useEffect(() => {
    if (!LOUNGE_TV_ANIMATION_VIDEO_ENABLED) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = LOUNGE_TV_ANIMATION_VIDEO_SRC;
    document.head.appendChild(link);

    const warmup = document.createElement('video');
    warmup.muted = true;
    warmup.playsInline = true;
    warmup.preload = 'auto';
    warmup.src = LOUNGE_TV_ANIMATION_VIDEO_SRC;
    warmup.setAttribute('aria-hidden', 'true');
    warmup.tabIndex = -1;
    Object.assign(warmup.style, {
      position: 'fixed',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      left: '-9999px',
      top: '0',
    });
    document.body.appendChild(warmup);
    warmup.load();

    return () => {
      document.head.removeChild(link);
      warmup.remove();
    };
  }, []);

  const playContainerStyle: CSSProperties | null = playTapMapped
    ? {
        ...sceneHitLayoutBoxStyle(
          playTapMapped,
          playScreenOffsetX,
          playScreenOffsetY,
          playTapRegion.layout,
        ),
        zIndex: 20,
        pointerEvents: 'auto',
      }
    : null;

  return (
    <>
      <SceneHitDebugBanner active={hitDebug}>
        Lounge TV — blue baked, green play tap, magenta glass. After play: yellow media panel, cyan video.
        Lobby display case on shop slide. <strong>?sceneHitDebug=1</strong>
        {hitEdit ? (
          <>
            {' '}
            + <strong>sceneHitEdit=1</strong> — drag/corner-resize, then Save (open TV to tune inner content).
          </>
        ) : null}
        .
      </SceneHitDebugBanner>

      {hitDebug && tvRegion ? (
        <SceneHitDebugOverlay
          regionId="lounge-tv-baked"
          rect={tvRegion}
          label="lounge tv (baked)"
          zIndex={26}
          layout={bakedRegion.layout}
          overlayStyle={{
            backgroundColor: 'rgba(33, 150, 243, 0.42)',
            border: '2px solid rgba(21, 101, 192, 0.95)',
          }}
        />
      ) : null}

      {hitDebug && !tvOpen && contentPopupMapped ? (
        <SceneHitDebugOverlay
          regionId="lounge-tv-content-popup"
          rect={contentPopupMapped}
          label="lounge tv content pop-up"
          zIndex={27}
          layout={contentPopupRegion.layout}
          overlayStyle={{
            backgroundColor: 'rgba(233, 30, 99, 0.42)',
            border: '2px solid rgba(194, 24, 91, 0.95)',
          }}
        />
      ) : null}

      {hitDebug && !tvOpen && playTapMapped ? (
        <SceneHitDebugOverlay
          regionId="lounge-tv-play-tap"
          rect={playTapMapped}
          label="lounge tv play tap"
          showLabel={false}
          zIndex={28}
          screenOffsetX={playScreenOffsetX}
          screenOffsetY={playScreenOffsetY}
          layout={playTapRegion.layout}
          overlayStyle={{
            backgroundColor: 'rgba(76, 175, 80, 0.48)',
            border: '2px solid rgba(46, 125, 50, 0.95)',
          }}
        />
      ) : null}

      {tvRegion ? (
        <div
          ref={tvAnchorRef}
          aria-hidden
          style={{
            ...sceneHitLayoutBoxStyle(tvRegion, 0, 0, bakedRegion.layout),
            zIndex: tvOpen ? 8 : 9,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {!tvOpen && playContainerStyle ? (
        <div data-lounge-tv-play-container style={playContainerStyle}>
          <button
            type="button"
            data-lounge-tv-play
            onClick={openLoungeTv}
            aria-label="Press to play lounge media"
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
            <span aria-hidden style={PRESS_PLAY_LABEL_STYLE}>
              PRESS TO PLAY
            </span>
          </button>
        </div>
      ) : null}

      <SceneViewportOverlay zIndex={220}>
        <LoungeTvOverlay
          isOpen={tvOpen}
          originRect={tvOriginRect}
          onClose={closeLoungeTv}
          viewportMeasureRef={measureRef}
        />
      </SceneViewportOverlay>
    </>
  );
}
