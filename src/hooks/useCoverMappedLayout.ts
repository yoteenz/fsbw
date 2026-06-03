import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { mapImagePointToCoverContainer, mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';
import {
  measureSceneCarouselBox,
  type SceneCarouselMeasureBox,
} from './useSceneCarouselMeasureBox';

function viewportBox(): SceneCarouselMeasureBox {
  if (typeof window === 'undefined') return { width: 390, height: 844 };
  return {
    width: window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}

/**
 * Map image-normalized rects/points using `contain` + `center top`.
 * Pass {@link SceneCarouselViewportStage} `measureRef` so layout tracks the scene box (not raw viewport).
 */
export function useCoverMappedLayout(
  screenRect: FinalSceneHitRect,
  imageWidth: number,
  imageHeight: number,
  closePoint?: { x: number; y: number },
  measureRef?: RefObject<HTMLElement | null>,
) {
  const [box, setBox] = useState<SceneCarouselMeasureBox>(() =>
    measureRef ? measureSceneCarouselBox(measureRef.current) : viewportBox(),
  );

  useLayoutEffect(() => {
    const update = () =>
      setBox(measureRef ? measureSceneCarouselBox(measureRef.current) : viewportBox());
    update();
    const el = measureRef?.current;
    const observer = el ? new ResizeObserver(update) : null;
    if (el && observer) observer.observe(el);
    window.addEventListener('resize', update);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
    };
  }, [measureRef]);

  const mappedScreen = mapImageRectToCoverContainer(
    screenRect,
    box.width,
    box.height,
    imageWidth,
    imageHeight,
  );

  const mappedClose = closePoint
    ? mapImagePointToCoverContainer(closePoint, box.width, box.height, imageWidth, imageHeight)
    : null;

  return { mappedScreen, mappedClose, viewport: box };
}
