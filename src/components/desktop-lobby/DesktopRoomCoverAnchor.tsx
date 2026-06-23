import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import {
  desktopRoomCoverTypography,
  mapDesktopRoomContainerPointToImage,
  mapDesktopRoomImagePointToContainer,
  mapDesktopRoomImageRectToContainer,
  type DesktopRoomCoverImageSpace,
} from '../../utils/desktopRoomCoverLayout';
import { coverMappedRectScreenOffsetStyle } from '../../utils/sceneCoverHitMap';

type PointAnchorProps = {
  measureRef: RefObject<HTMLElement | null>;
  /** Normalized position on the source hero image (0–1). */
  imagePoint: { x: number; y: number };
  image?: DesktopRoomCoverImageSpace;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** CSS transform applied after centering on the mapped point. Default: translate(-50%, -50%). */
  transform?: string;
  zIndex?: number;
};

/**
 * Locks overlay content to a desktop room NO TEXT hero (`cover` + `center top`).
 * Use image-normalized coordinates for all future room overlays (labels, hotspots, TV, etc.).
 */
export function DesktopRoomCoverPointAnchor({
  measureRef,
  imagePoint,
  image,
  children,
  className,
  style,
  transform = 'translate(-50%, -50%)',
  zIndex = 4,
}: PointAnchorProps) {
  const { width, height } = useDesktopRoomCoverMeasure(measureRef);
  const mapped =
    width > 0 && height > 0
      ? mapDesktopRoomImagePointToContainer(imagePoint, width, height, image)
      : { left: imagePoint.x, top: imagePoint.y };

  const anchorStyle: CSSProperties = {
    position: 'absolute',
    left: `${mapped.left * 100}%`,
    top: `${mapped.top * 100}%`,
    transform,
    zIndex,
    pointerEvents: 'none',
    ...style,
  };

  return (
    <div className={className} style={anchorStyle}>
      {children}
    </div>
  );
}

type RectAnchorProps = {
  measureRef: RefObject<HTMLElement | null>;
  /** Normalized rect on the source hero image (0–1). */
  imageRect: FinalSceneHitRect;
  image?: DesktopRoomCoverImageSpace;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  screenOffsetX?: number;
  screenOffsetY?: number;
  zIndex?: number;
};

/** Rectangular region locked to the cover-mapped hero — for frames, panels, hit areas. */
export function DesktopRoomCoverRectAnchor({
  measureRef,
  imageRect,
  image,
  children,
  className,
  style,
  screenOffsetX = 0,
  screenOffsetY = 0,
  zIndex = 4,
}: RectAnchorProps) {
  const { width, height } = useDesktopRoomCoverMeasure(measureRef);
  const mapped =
    width > 0 && height > 0
      ? mapDesktopRoomImageRectToContainer(imageRect, width, height, image)
      : imageRect;

  const box = coverMappedRectScreenOffsetStyle(mapped, screenOffsetX, screenOffsetY);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        ...box,
        zIndex,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export {
  desktopRoomCoverTypography,
  mapDesktopRoomContainerPointToImage,
  mapDesktopRoomImagePointToContainer,
};
