import { useMemo, type RefObject } from 'react';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { mapDesktopRoomImageRectToContainer } from '../../utils/desktopRoomCoverLayout';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import type { MansionDebugDisplayMode, MansionDebugRegion } from '../../types/desktopMansionDebug';
import {
  formatMansionDebugLabel,
  MANSION_DEBUG_CATEGORY_COLORS,
} from '../../utils/desktopMansionDebug';

type Props = {
  region: MansionDebugRegion;
  measureRef: RefObject<HTMLElement | null>;
  displayMode: MansionDebugDisplayMode;
  onHoverChange: (active: boolean) => void;
};

export function MansionDebugRegionOverlay({
  region,
  measureRef,
  displayMode,
  onHoverChange,
}: Props) {
  const { width, height } = useDesktopRoomCoverMeasure(measureRef);

  const metrics = useMemo(() => {
    if (width <= 0 || height <= 0) return null;
    const mapped = mapDesktopRoomImageRectToContainer(
      region.bounds.imageRect,
      width,
      height,
      region.bounds.image,
    );
    return {
      width: Math.round(mapped.width * width),
      height: Math.round(mapped.height * height),
      x: Math.round(mapped.left * width),
      y: Math.round(mapped.top * height),
    };
  }, [height, region.bounds.image, region.bounds.imageRect, width]);

  const color = MANSION_DEBUG_CATEGORY_COLORS[region.category];
  const showBoundary = displayMode !== 'labels';
  const showLabels = displayMode !== 'boundaries';

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={region.bounds.image}
      imageRect={region.bounds.imageRect}
      zIndex={9990}
      className="mansion-debug-region"
      style={{
        pointerEvents: 'auto',
        border: showBoundary ? `2px solid ${color}` : 'none',
        background: showBoundary ? `${color}33` : 'transparent',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="mansion-debug-region__hit"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        {showLabels && metrics ? (
          <div className="mansion-debug-region__label" style={{ color }}>
            <span className="mansion-debug-region__name">{formatMansionDebugLabel(region.label)}</span>
            <span>
              {metrics.width} × {metrics.height}
            </span>
            <span>x: {metrics.x}</span>
            <span>y: {metrics.y}</span>
          </div>
        ) : null}
      </div>
    </DesktopRoomCoverRectAnchor>
  );
}
