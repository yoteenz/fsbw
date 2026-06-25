import type { CSSProperties, ReactNode, RefObject } from 'react';
import { TRANSFORMATION_SUITE_IMAGE } from '../../constants/transformationSuite';
import { BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL } from '../../constants/desktopPagePerspectivePanels';
import type { TransformationSuiteRectRegionId } from '../../types/transformationSuite';
import { DesktopPerspectivePanelAnchor } from '../desktop-shared/DesktopPerspectivePanelAnchor';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  regionId: TransformationSuiteRectRegionId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

/** Production content anchor — maps layout quad to hero cover space. */
export function TransformationSuitePanelAnchor({
  measureRef,
  regionId,
  children,
  className = '',
  style,
  zIndex = 8,
}: Props) {
  return (
    <DesktopPerspectivePanelAnchor
      id={BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL[regionId]}
      measureRef={measureRef}
      image={TRANSFORMATION_SUITE_IMAGE}
      className={className}
      style={style}
      zIndex={zIndex}
    >
      {children}
    </DesktopPerspectivePanelAnchor>
  );
}
