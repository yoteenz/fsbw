import type { ReactNode, RefObject } from 'react';
import {
  DESKTOP_SHOPPING_BAG_BACKGROUND_URL,
  DESKTOP_SHOPPING_BAG_IMAGE,
  isDesktopShoppingBagDebugEnabled,
} from '../../constants/desktopShoppingBag';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import {
  DesktopShoppingBagTabletDebugProvider,
  useDesktopShoppingBagTabletRect,
} from './DesktopShoppingBagTabletDebugProvider';
import { DesktopShoppingBagTabletDebugRect } from './DesktopShoppingBagTabletDebugRect';
import { DesktopShoppingBagTabletDebugInspector } from './DesktopShoppingBagTabletDebugInspector';
import './DesktopShoppingBag.css';
import './DesktopAcquisition.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  tabletClassName?: string;
  tabletEntering?: boolean;
};

function DesktopCuratorSuiteSceneInner({
  measureRef,
  children,
  tabletClassName = '',
  tabletEntering = false,
}: Props) {
  const tabletRect = useDesktopShoppingBagTabletRect();
  const debug = isDesktopShoppingBagDebugEnabled();

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
          imageRect={tabletRect}
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
        {debug ? <DesktopShoppingBagTabletDebugRect measureRef={measureRef} /> : null}
      </div>
      {debug ? <DesktopShoppingBagTabletDebugInspector /> : null}
    </div>
  );
}

export function DesktopCuratorSuiteScene(props: Props) {
  return (
    <DesktopShoppingBagTabletDebugProvider>
      <DesktopCuratorSuiteSceneInner {...props} />
    </DesktopShoppingBagTabletDebugProvider>
  );
}
