import type { ReactNode, RefObject } from 'react';
import {
  DESKTOP_SHOPPING_BAG_BACKGROUND_URL,
  DESKTOP_SHOPPING_BAG_IMAGE,
  DESKTOP_SHOPPING_BAG_TABLET_RECT,
} from '../../constants/desktopShoppingBag';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import './DesktopShoppingBag.css';
import './DesktopAcquisition.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  tabletClassName?: string;
  tabletEntering?: boolean;
};

export function DesktopCuratorSuiteScene({
  measureRef,
  children,
  tabletClassName = '',
  tabletEntering = false,
}: Props) {
  return (
    <div className="desktop-shopping-bag-scene" aria-label="Curator collection suite">
      <img
        src={DESKTOP_SHOPPING_BAG_BACKGROUND_URL}
        alt=""
        className="desktop-shopping-bag-scene__bg"
        draggable={false}
        width={DESKTOP_SHOPPING_BAG_IMAGE.width}
        height={DESKTOP_SHOPPING_BAG_IMAGE.height}
      />
      <div className="desktop-shopping-bag-scene__layer">
        <DesktopRoomCoverRectAnchor
          measureRef={measureRef}
          imageRect={DESKTOP_SHOPPING_BAG_TABLET_RECT}
          image={DESKTOP_SHOPPING_BAG_IMAGE}
          zIndex={6}
        >
          <div
            className={[
              'curated-tablet',
              tabletEntering ? 'curated-tablet--acquisition-enter' : '',
              tabletClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </DesktopRoomCoverRectAnchor>
      </div>
    </div>
  );
}
