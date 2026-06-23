import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import BuildAWigFeatureSignInModal from '../../../components/BuildAWigFeatureSignInModal';
import { DesktopShoppingBagScene } from '../../../components/desktop-shopping-bag/DesktopShoppingBagScene';
import { useDesktopShoppingBagCart } from '../../../hooks/useDesktopShoppingBagCart';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_SHOPPING_BAG_BACKGROUND_URL } from '../../../constants/desktopShoppingBag';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../../../constants/desktopNavQuickRoutes';
import { checkoutPathForCartItems } from '../../../utils/checkoutNavigatePath';
import {
  executeCartLineEditAction,
  resolveCartLineEditAction,
  resolveCartLinePdpHref,
} from '../../../utils/cartEditFromBag';
import { useDesktopTowerTravelOptional } from '../../../components/desktop-tower/DesktopTowerNavProvider';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { useEffect } from 'react';

export default function DesktopShoppingBagPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const towerTravel = useDesktopTowerTravelOptional();
  const artboard = isDesktopArtboardLayoutActive();
  const { cartItems, itemCount, subtotal, removingIds, removeItem } = useDesktopShoppingBagCart();
  const [bawSignInOpen, setBawSignInOpen] = useState(false);
  const [bawSignInReturnTo, setBawSignInReturnTo] = useState<{ pathname: string; search?: string }>({
    pathname: '/build-a-wig/noir/edit',
  });

  useEffect(() => {
    void preloadDesktopRoomBackground(DESKTOP_SHOPPING_BAG_BACKGROUND_URL);
  }, []);

  const goShowroom = useCallback(() => {
    const href = buildDesktopDestinationHref(DESKTOP_PENTHOUSE_PATH, 'showroom');
    if (towerTravel) towerTravel.quickTravelTo(href);
    else navigate(href);
  }, [navigate, towerTravel]);

  const onAcquire = useCallback(() => {
    if (cartItems.length === 0) {
      goShowroom();
      return;
    }
    navigate(checkoutPathForCartItems(cartItems));
  }, [cartItems, goShowroom, navigate]);

  const onEdit = useCallback(
    (item: Record<string, unknown>) => {
      const action = resolveCartLineEditAction(item);
      if (!action) return;
      const signInReturn = executeCartLineEditAction(action, navigate);
      if (signInReturn) {
        setBawSignInReturnTo({ pathname: signInReturn });
        setBawSignInOpen(true);
      }
    },
    [navigate],
  );

  const onOpenPdp = useCallback(
    (item: Record<string, unknown>) => {
      navigate(resolveCartLinePdpHref(item));
    },
    [navigate],
  );

  return (
    <div
      className={`desktop-shopping-bag-page${artboard ? ' desktop-shopping-bag-page--artboard' : ''}`}
    >
      <NavBar />
      <section ref={viewportRef} className="desktop-shopping-bag-page__viewport">
        <DesktopShoppingBagScene
          measureRef={viewportRef}
          cartItems={cartItems}
          itemCount={itemCount}
          subtotal={subtotal}
          removingIds={removingIds}
          onEdit={onEdit}
          onRemove={removeItem}
          onOpenPdp={onOpenPdp}
          onAcquire={onAcquire}
          onEnterShowroom={goShowroom}
        />
      </section>

      <BuildAWigFeatureSignInModal
        isOpen={bawSignInOpen}
        onClose={() => setBawSignInOpen(false)}
        returnTo={bawSignInReturnTo}
      />
    </div>
  );
}
