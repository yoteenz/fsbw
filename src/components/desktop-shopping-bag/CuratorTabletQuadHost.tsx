import { useMemo, type CSSProperties, type ReactNode, type RefObject } from 'react';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import { mapDesktopRoomImagePointToContainer } from '../../utils/desktopRoomCoverLayout';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import {
  quadBoundingBox,
  quadClipPathPolygon,
  quadCornerList,
  quadPerspectiveMatrix3d,
  type Quad4,
} from '../../utils/quadPerspectiveTransform';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  quad: Quad4;
  image: DesktopRoomCoverImageSpace;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

/** Perspective-warped tablet host — quad is in normalized hero image space (0–1). */
export function CuratorTabletQuadHost({
  measureRef,
  quad,
  image,
  children,
  className = '',
  style,
  zIndex = 6,
}: Props) {
  const { width: cw, height: ch, isMeasured } = useDesktopRoomCoverMeasure(measureRef);

  const layout = useMemo(() => {
    if (!isMeasured || cw <= 0 || ch <= 0) return null;

    const mapped = quadCornerList(quad).map((p) =>
      mapDesktopRoomImagePointToContainer(p, cw, ch, image),
    );

    const containerQuad: Quad4 = {
      tl: { x: mapped[0].left, y: mapped[0].top },
      tr: { x: mapped[1].left, y: mapped[1].top },
      br: { x: mapped[2].left, y: mapped[2].top },
      bl: { x: mapped[3].left, y: mapped[3].top },
    };

    const bbox = quadBoundingBox(quadCornerList(containerQuad));
    const matrix3d = quadPerspectiveMatrix3d(containerQuad, bbox);
    const clipPath = quadClipPathPolygon(containerQuad, bbox);

    return {
      bbox,
      matrix3d,
      clipPath,
    };
  }, [quad, cw, ch, image, isMeasured]);

  if (!layout) return null;

  const hostStyle: CSSProperties = {
    position: 'absolute',
    left: `${layout.bbox.minX * 100}%`,
    top: `${layout.bbox.minY * 100}%`,
    width: `${layout.bbox.width * 100}%`,
    height: `${layout.bbox.height * 100}%`,
    zIndex,
    overflow: 'hidden',
    pointerEvents: 'none',
    ...style,
  };

  return (
    <div className="curator-tablet-quad-host" style={hostStyle}>
      <div
        className={['curator-tablet-quad-host__warp', className].filter(Boolean).join(' ')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: layout.matrix3d,
          transformOrigin: '0 0',
          clipPath: layout.clipPath,
          WebkitClipPath: layout.clipPath,
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
