import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import CheckoutPage from '../../checkout/page';
import { DesktopCuratorSuiteScene } from '../../../components/desktop-shopping-bag/DesktopCuratorSuiteScene';
import { AcquisitionTabletChrome } from '../../../components/desktop-shopping-bag/AcquisitionTabletChrome';
import {
  DesktopCuratorCheckoutBridgeProvider,
  useDesktopCuratorCheckoutBridge,
} from '../../../components/desktop-shopping-bag/DesktopCuratorCheckoutBridge';
import { DesktopCuratorCheckoutContext } from '../../../utils/desktopCuratorCheckout';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_SHOPPING_BAG_BACKGROUND_URL } from '../../../constants/desktopShoppingBag';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { MansionDebugLayer } from '../../../components/desktop-mansion-debug';
import { useMansionDebugViewportBinding } from '../../../components/desktop-mansion-debug/MansionDebugProvider';
import '../../../components/desktop-shopping-bag/DesktopShoppingBag.css';
import '../../../components/desktop-shopping-bag/DesktopAcquisition.css';

function AcquisitionTabletHost() {
  const bridge = useDesktopCuratorCheckoutBridge();
  const location = useLocation();
  const entering = Boolean((location.state as { fromCollection?: boolean } | null)?.fromCollection);

  return (
    <AcquisitionTabletChrome
      finalTotal={bridge?.finalTotal ?? 0}
      onComplete={() => bridge?.submit()}
    >
      <div className="curated-acquisition-checkout-host">
        <CheckoutPage />
      </div>
      <div className={entering ? 'curated-tablet__enter-flash' : ''} aria-hidden />
    </AcquisitionTabletChrome>
  );
}

export default function DesktopAcquisitionPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const artboard = isDesktopArtboardLayoutActive();
  const location = useLocation();
  const entering = Boolean((location.state as { fromCollection?: boolean } | null)?.fromCollection);

  useEffect(() => {
    void preloadDesktopRoomBackground(DESKTOP_SHOPPING_BAG_BACKGROUND_URL);
  }, []);

  useMansionDebugViewportBinding(viewportRef, {
    page: 'acquisition',
    pageLabel: 'Acquisition',
  });

  return (
    <div
      className={`desktop-shopping-bag-page${artboard ? ' desktop-shopping-bag-page--artboard' : ''}`}
    >
      <NavBar />
      <section ref={viewportRef} className="desktop-shopping-bag-page__viewport">
        <DesktopCuratorCheckoutBridgeProvider>
          <DesktopCuratorCheckoutContext.Provider value={true}>
            <DesktopCuratorSuiteScene measureRef={viewportRef} panelId="checkout-tablet" tabletEntering={entering}>
              <AcquisitionTabletHost />
            </DesktopCuratorSuiteScene>
          </DesktopCuratorCheckoutContext.Provider>
        </DesktopCuratorCheckoutBridgeProvider>
        <MansionDebugLayer />
      </section>
    </div>
  );
}
