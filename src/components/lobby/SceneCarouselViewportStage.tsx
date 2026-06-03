import type { ReactNode, Ref, RefObject } from 'react';
import {
  sceneCarouselViewportBackgroundStyle,
  sceneCarouselViewportStageStyle,
} from '../../utils/sceneCarouselBackground';

type Props = {
  backgroundSrc: string;
  /** Final LP composites use `center top` (default). */
  backgroundPosition?: string;
  measureRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
};

/** Visible lobby/lounge scene — fixed `100dvh` so cover, hits, and transition video share one box. */
export function SceneCarouselViewportStage({
  backgroundSrc,
  backgroundPosition,
  measureRef,
  children,
}: Props) {
  return (
    <div ref={measureRef as Ref<HTMLDivElement>} style={sceneCarouselViewportStageStyle()}>
      <div
        style={sceneCarouselViewportBackgroundStyle(backgroundSrc, {
          backgroundPosition,
        })}
      />
      {children}
    </div>
  );
}
