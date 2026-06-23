import type { ReactNode, RefObject } from 'react';
import {
  DESKTOP_SHOPPING_BAG_BACKGROUND_URL,
  DESKTOP_SHOPPING_BAG_IMAGE,
  isDesktopShoppingBagDebugEnabled,
} from '../../constants/desktopShoppingBag';
import { CuratorTabletQuadHost } from './CuratorTabletQuadHost';
import {
  DesktopShoppingBagTabletDebugProvider,
  useDesktopShoppingBagTabletQuad,
} from './DesktopShoppingBagTabletDebugProvider';
import { DesktopShoppingBagTabletDebugPolygon } from './DesktopShoppingBagTabletDebugPolygon';
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
  const quad = useDesktopShoppingBagTabletQuad();
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
        <CuratorTabletQuadHost
          measureRef={measureRef}
          quad={quad}
          image={DESKTOP_SHOPPING_BAG_IMAGE}
          zIndex={6}
          className={[
            'curated-tablet',
            tabletEntering ? 'curated-tablet--acquisition-enter' : '',
            tabletClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </CuratorTabletQuadHost>
        {debug ? <DesktopShoppingBagTabletDebugPolygon measureRef={measureRef} /> : null}
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
