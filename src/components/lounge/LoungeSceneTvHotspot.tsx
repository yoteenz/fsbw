import { useCallback, useRef, useState } from 'react';
import { FINAL_LOUNGE_TV_HIT_REGION, FINAL_LOUNGE_TV_PLAY_HIT_REGION } from '../../constants/finalLobbySceneAssets';
import { LOUNGE_TV_PLAY_BUTTON_COLOR } from './loungeTvFrame';
import { LoungeTvOverlay } from './LoungeTvOverlay';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';

export function LoungeSceneTvHotspot() {
  const tvFrameRef = useRef<HTMLDivElement>(null);
  const [tvOpen, setTvOpen] = useState(false);
  const [tvOriginRect, setTvOriginRect] = useState<DOMRect | null>(null);

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
        ref={tvFrameRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: tvOpen ? 8 : 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            ...rectToPercentStyle(FINAL_LOUNGE_TV_HIT_REGION),
            position: 'absolute',
            pointerEvents: 'auto',
            opacity: tvOpen ? 0.4 : 1,
            transition: 'opacity 0.35s ease',
          }}
        >
          {!tvOpen ? (
            <button
              type="button"
              onClick={openLoungeTv}
              aria-label="Play lounge media"
              style={{
                ...rectToPercentStyle(FINAL_LOUNGE_TV_PLAY_HIT_REGION),
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
      </div>

      <LoungeTvOverlay isOpen={tvOpen} originRect={tvOriginRect} onClose={closeLoungeTv} />
    </>
  );
}
