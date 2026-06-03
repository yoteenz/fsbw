import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  FINAL_LOUNGE_TV_HIT_REGION,
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
  FINAL_LOUNGE_TV_PLAY_TAP_RECT,
} from '../../constants/finalLobbySceneAssets';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { applyScreenOffsetToCoverRect } from '../../utils/sceneCoverHitMap';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';
import { LOUNGE_TV_PLAY_BUTTON_COLOR } from './loungeTvFrame';
import { LoungeTvOverlay } from './LoungeTvOverlay';

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

  const tvRegion = useSceneCoverHitRect(FINAL_LOUNGE_TV_HIT_REGION, measureRef);
  const playTapMapped = useSceneCoverHitRect(FINAL_LOUNGE_TV_PLAY_TAP_RECT, measureRef);
  const [playTap, setPlayTap] = useState(playTapMapped);

  useLayoutEffect(() => {
    if (!playTapMapped) {
      setPlayTap(null);
      return;
    }
    const el = measureRef.current;
    const width = el?.offsetWidth ?? 0;
    const height = el?.offsetHeight ?? 0;
    if (width <= 0 || height <= 0) {
      setPlayTap(playTapMapped);
      return;
    }
    setPlayTap(
      applyScreenOffsetToCoverRect(
        playTapMapped,
        width,
        height,
        FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
        FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
      ),
    );
  }, [measureRef, playTapMapped]);

  const openLoungeTv = useCallback(() => {
    setTvOriginRect(tvAnchorRef.current?.getBoundingClientRect() ?? null);
    setTvOpen(true);
  }, []);

  const closeLoungeTv = useCallback(() => {
    setTvOpen(false);
  }, []);

  return (
    <>
      {tvRegion ? (
        <div
          ref={tvAnchorRef}
          aria-hidden
          style={{
            ...rectToPercentStyle(tvRegion),
            position: 'absolute',
            zIndex: tvOpen ? 8 : 9,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {!tvOpen && playTap ? (
        <button
          type="button"
          data-lounge-tv-play
          onClick={openLoungeTv}
          aria-label="Play lounge media"
          style={{
            ...rectToPercentStyle(playTap),
            position: 'absolute',
            zIndex: 11,
            margin: 0,
            padding: 12,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'block',
              height: 18,
              width: 22,
              pointerEvents: 'none',
              backgroundColor: LOUNGE_TV_PLAY_BUTTON_COLOR,
              WebkitMaskImage: 'url(/assets/play-button.png)',
              maskImage: 'url(/assets/play-button.png)',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />
        </button>
      ) : null}

      <LoungeTvOverlay isOpen={tvOpen} originRect={tvOriginRect} onClose={closeLoungeTv} />
    </>
  );
}
