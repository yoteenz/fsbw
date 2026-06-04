import type { ReactNode } from 'react';
import { sceneCarouselViewportOverlayRootStyle } from '../../utils/sceneCarouselBackground';

type Props = {
  children: ReactNode;
  zIndex?: number;
};

/**
 * Scene-locked overlay layer — `absolute` + `inset: 0` inside {@link SceneCarouselViewportStage}.
 * Prefer this over {@link SceneViewportPortal} when the overlay must mount with the slide (e.g. room transition video).
 */
export function SceneViewportOverlay({ children, zIndex = 200 }: Props) {
  return <div style={sceneCarouselViewportOverlayRootStyle(zIndex)}>{children}</div>;
}
