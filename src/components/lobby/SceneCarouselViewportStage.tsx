import type { ReactNode, Ref } from 'react';
import {
  sceneCarouselViewportBackgroundStyle,
  sceneCarouselViewportStageStyle,
} from '../../utils/sceneCarouselBackground';

type Props = {
  backgroundSrc: string;
  /** Final LP composites use `center top` (default). */
  backgroundPosition?: string;
  measureRef?: Ref<HTMLDivElement>;
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
    <div ref={measureRef} style={sceneCarouselViewportStageStyle()}>
      <div
        style={sceneCarouselViewportBackgroundStyle(backgroundSrc, {
          backgroundPosition,
        })}
      />
      {children}
    </div>
  );
}
