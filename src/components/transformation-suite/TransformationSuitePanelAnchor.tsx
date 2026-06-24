import type { CSSProperties, ReactNode, RefObject } from 'react';
import { TRANSFORMATION_SUITE_IMAGE } from '../../constants/transformationSuite';
import type { TransformationSuitePercentRect, TransformationSuiteRectRegionId } from '../../types/transformationSuite';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { getTransformationSuiteRect } from '../../constants/transformationSuiteLayout';
import { transformationSuiteRectToImageRect } from '../../utils/transformationSuiteLayoutMath';
import { useTransformationSuiteLayout } from './TransformationSuiteDebugProvider';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  regionId: TransformationSuiteRectRegionId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

/** Production content anchor — maps layout rect to hero cover space. */
export function TransformationSuitePanelAnchor({
  measureRef,
  regionId,
  children,
  className = '',
  style,
  zIndex = 8,
}: Props) {
  const layout = useTransformationSuiteLayout();
  const rect: TransformationSuitePercentRect = getTransformationSuiteRect(layout, regionId);

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={TRANSFORMATION_SUITE_IMAGE}
      imageRect={transformationSuiteRectToImageRect(rect)}
      zIndex={zIndex}
      className={className}
      style={{ pointerEvents: 'auto', overflow: 'hidden', ...style }}
    >
      {children}
    </DesktopRoomCoverRectAnchor>
  );
}
