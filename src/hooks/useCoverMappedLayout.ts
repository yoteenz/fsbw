import { useLayoutEffect, useState } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { mapImagePointToCoverContainer, mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';

function viewportBox(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 390, height: 844 };
  return {
    width: window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}

/**
 * Map image-normalized rects/points to the viewport using `contain` + `center top`
 * (same as lounge TV animation + final-lounge composite).
 */
export function useCoverMappedLayout(
  screenRect: FinalSceneHitRect,
  imageWidth: number,
  imageHeight: number,
  closePoint?: { x: number; y: number },
) {
  const [box, setBox] = useState(viewportBox);

  useLayoutEffect(() => {
    const update = () => setBox(viewportBox());
    update();
    window.addEventListener('resize', update);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
    };
  }, []);

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
