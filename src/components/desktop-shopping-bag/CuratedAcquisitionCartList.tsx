import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildAWigFeatureSignInModal from '../BuildAWigFeatureSignInModal';
import { useDesktopShoppingBagCart } from '../../hooks/useDesktopShoppingBagCart';
import {
  executeCartLineEditAction,
  resolveCartLineEditAction,
  resolveCartLinePdpHref,
} from '../../utils/cartEditFromBag';
import { CuratedAcquisitionItemCard } from './CuratedAcquisitionItemCard';

export function CuratedAcquisitionCartList() {
  const navigate = useNavigate();
  const { cartItems, removingIds, removeItem, changeQuantity } = useDesktopShoppingBagCart();
  const [bawSignInOpen, setBawSignInOpen] = useState(false);
  const [bawSignInReturnTo, setBawSignInReturnTo] = useState<{ pathname: string; search?: string }>({
    pathname: '/build-a-wig/noir/edit',
  });

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

  if (cartItems.length === 0) {
    return (
      <p className="curated-acquisition-list__empty">Your collection is empty. Return to the showroom to select pieces.</p>
    );
  }

  return (
    <>
      <div className="curated-acquisition-list" data-checkout-collection-list>
        {cartItems.map((item) => (
          <CuratedAcquisitionItemCard
            key={String(item.id)}
            item={item as Record<string, unknown>}
            removing={removingIds.has(String(item.id))}
            onEdit={onEdit}
            onRemove={removeItem}
            onOpenPdp={onOpenPdp}
            onQuantityChange={changeQuantity}
          />
        ))}
      </div>

      <BuildAWigFeatureSignInModal
        isOpen={bawSignInOpen}
        onClose={() => setBawSignInOpen(false)}
        returnTo={bawSignInReturnTo}
      />
    </>
  );
}
