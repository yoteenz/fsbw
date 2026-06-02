import { useCallback, useRef, useState, type RefObject } from 'react';
import {
  FINAL_LOUNGE_TV_HIT_REGION,
  FINAL_LOUNGE_TV_PLAY_IMAGE_RECT,
} from '../../constants/finalLobbySceneAssets';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { LOUNGE_TV_PLAY_BUTTON_COLOR } from './loungeTvFrame';
import { LoungeTvOverlay } from './LoungeTvOverlay';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';

type Props = {
  /** Lounge slide shell — same box as `sceneCarouselBackgroundLayerStyle` (pass page root ref). */
  measureRef: RefObject<HTMLDivElement>;
};

export function LoungeSceneTvHotspot({ measureRef }: Props) {
  const tvFrameRef = useRef<HTMLDivElement>(null);
  const [tvOpen, setTvOpen] = useState(false);
  const [tvOriginRect, setTvOriginRect] = useState<DOMRect | null>(null);

  const playHit = useSceneCoverHitRect(FINAL_LOUNGE_TV_PLAY_IMAGE_RECT, measureRef);
  const tvHit = useSceneCoverHitRect(FINAL_LOUNGE_TV_HIT_REGION, measureRef);

  const openLoungeTv = useCallback(() => {
    const rect = tvFrameRef.current?.getBoundingClientRect() ?? null;
    setTvOriginRect(rect);
    setTvOpen(true);
  }, []);

  const closeLoungeTv = useCallback(() => {
    setTvOpen(false);
  }, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: tvOpen ? 8 : 10,
          pointerEvents: 'none',
        }}
      >
        {tvHit ? (
          <div
            ref={tvFrameRef}
            style={{
              ...rectToPercentStyle(tvHit),
              position: 'absolute',
              pointerEvents: 'none',
            }}
            aria-hidden
          />
        ) : null}
        {!tvOpen && playHit ? (
          <button
            type="button"
            data-lounge-tv-play
            onClick={openLoungeTv}
            aria-label="Play lounge media"
            style={{
              ...rectToPercentStyle(playHit),
              position: 'absolute',
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
              pointerEvents: 'auto',
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
      </div>

      <LoungeTvOverlay isOpen={tvOpen} originRect={tvOriginRect} onClose={closeLoungeTv} />
    </>
  );
}
