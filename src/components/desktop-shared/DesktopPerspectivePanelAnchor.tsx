import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { PerspectivePanelId } from '../../types/perspectivePanel';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import { PerspectivePanel } from '../perspective-panel/PerspectivePanel';

type Props = {
  id: PerspectivePanelId;
  measureRef: RefObject<HTMLElement | null>;
  image: DesktopRoomCoverImageSpace;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

/** Maps panel content into a perspective-warped surface with saved quad overrides. */
export function DesktopPerspectivePanelAnchor({
  id,
  measureRef,
  image,
  children,
  className = '',
  style,
  zIndex = 8,
}: Props) {
  return (
    <PerspectivePanel
      id={id}
      measureRef={measureRef}
      image={image}
      className={className}
      style={{ pointerEvents: 'auto', overflow: 'hidden', ...style }}
      zIndex={zIndex}
    >
      {children}
    </PerspectivePanel>
  );
}
