import type { RefObject } from 'react';
import { DesktopCuratorSuiteScene } from './DesktopCuratorSuiteScene';
import { CuratedCollectionTablet } from './CuratedCollectionTablet';
import './DesktopShoppingBag.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  cartItems: Record<string, unknown>[];
  itemCount: number;
  subtotal: number;
  removingIds: Set<string>;
  onEdit: (item: Record<string, unknown>) => void;
  onRemove: (itemId: string) => void;
  onOpenPdp: (item: Record<string, unknown>) => void;
  onAcquire: () => void;
  onEnterShowroom: () => void;
};

export function DesktopShoppingBagScene({
  measureRef,
  cartItems,
  itemCount,
  subtotal,
  removingIds,
  onEdit,
  onRemove,
  onOpenPdp,
  onAcquire,
  onEnterShowroom,
}: Props) {
  return (
    <DesktopCuratorSuiteScene measureRef={measureRef}>
      <CuratedCollectionTablet
        cartItems={cartItems}
        itemCount={itemCount}
        subtotal={subtotal}
        removingIds={removingIds}
        onEdit={onEdit}
        onRemove={onRemove}
        onOpenPdp={onOpenPdp}
        onAcquire={onAcquire}
        onEnterShowroom={onEnterShowroom}
      />
    </DesktopCuratorSuiteScene>
  );
}
