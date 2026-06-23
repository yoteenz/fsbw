import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import BuildAWigFeatureSignInModal from '../../../components/BuildAWigFeatureSignInModal';
import { DesktopShoppingBagScene } from '../../../components/desktop-shopping-bag/DesktopShoppingBagScene';
import { useDesktopShoppingBagCart } from '../../../hooks/useDesktopShoppingBagCart';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_SHOPPING_BAG_BACKGROUND_URL } from '../../../constants/desktopShoppingBag';
import {
  DESKTOP_SHOPPING_BAG_MOCK_CART_ITEMS,
  isDesktopShoppingBagMockEnabled,
} from '../../../constants/desktopShoppingBagMockCart';
import { cartBillableSubtotal } from '../../../utils/cartBillableLines';
import { cartTotalQuantityUnits } from '../../../utils/cartTotalQuantityUnits';
import { DESKTOP_PENTHOUSE_PATH } from '../../../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../../../constants/desktopNavQuickRoutes';
import { desktopAcquisitionPathForCartItems } from '../../../utils/desktopCheckoutNavigatePath';
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
  const mockEnabled = isDesktopShoppingBagMockEnabled();
  const usingMock = mockEnabled && cartItems.length === 0;
  const [mockItems, setMockItems] = useState(DESKTOP_SHOPPING_BAG_MOCK_CART_ITEMS);
  const [mockRemovingIds, setMockRemovingIds] = useState<Set<string>>(() => new Set());
  const displayItems = usingMock ? mockItems : cartItems;
  const displayItemCount = useMemo(
    () => (usingMock ? cartTotalQuantityUnits(mockItems) : itemCount),
    [usingMock, mockItems, itemCount],
  );
  const displaySubtotal = useMemo(
    () => (usingMock ? cartBillableSubtotal(mockItems) : subtotal),
    [usingMock, mockItems, subtotal],
  );
  const displayRemovingIds = usingMock ? mockRemovingIds : removingIds;
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

  const removeDisplayItem = useCallback(
    (itemId: string) => {
      if (usingMock) {
        setMockRemovingIds((prev) => new Set(prev).add(itemId));
        window.setTimeout(() => {
          setMockItems((prev) => prev.filter((i) => String(i.id) !== itemId));
          setMockRemovingIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        }, 280);
        return;
      }
      removeItem(itemId);
    },
    [usingMock, removeItem],
  );

  const onAcquire = useCallback(() => {
    if (displayItems.length === 0) {
      goShowroom();
      return;
    }
    if (usingMock) {
      navigate(desktopAcquisitionPathForCartItems(displayItems), { state: { fromCollection: true } });
      return;
    }
    navigate(desktopAcquisitionPathForCartItems(cartItems), { state: { fromCollection: true } });
  }, [cartItems, displayItems, goShowroom, navigate, usingMock]);

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
          cartItems={displayItems}
          itemCount={displayItemCount}
          subtotal={displaySubtotal}
          removingIds={displayRemovingIds}
          onEdit={onEdit}
          onRemove={removeDisplayItem}
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
